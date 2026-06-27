import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, FlatList, RefreshControl, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { Colors, CategoryType } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Property } from '../../constants/mockData';
import { CategoryCard } from '../../components/ui/CategoryCard';
import { PropertyCard } from '../../components/ui/PropertyCard';
import { FilterChips, FilterState } from '../../components/ui/FilterChips';
import { FilterModal, DEFAULT_FILTERS, countActiveFilters } from '../../components/modals/FilterModal';
import { useWelcomeModal } from '../../hooks/useWelcomeModal';
import { useAuth } from '../../context/AuthContext';
import { fetchProperties } from '../../services/firebaseServices';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

const CATEGORIES: CategoryType[] = ['apartment', 'hostel', 'shop', 'airbnb'];

const PRICE_THRESHOLDS: Record<FilterState['priceRange'], [number, number]> = {
  all: [0, Infinity],
  budget: [0, 700000],
  mid: [700001, 3000000],
  premium: [3000001, Infinity],
};

function applyFilters(properties: Property[], filters: FilterState): Property[] {
  const [minP, maxP] = PRICE_THRESHOLDS[filters.priceRange];
  return properties.filter(p => {
    if (filters.category !== 'all' && p.category !== filters.category) return false;
    if (filters.verifiedOnly && !p.isVerified) return false;
    if (filters.furnished === 'furnished' && !p.isFurnished) return false;
    if (filters.furnished === 'unfurnished' && p.isFurnished) return false;
    if (filters.district !== 'All') {
      const dist = p.district || '';
      const loc = p.location || '';
      const query = filters.district.toLowerCase();
      if (!dist.toLowerCase().includes(query) && !loc.toLowerCase().includes(query)) return false;
    }
    if (p.price < minP || p.price > maxP) return false;
    if (filters.bedrooms !== 'any') {
      const beds = p.bedrooms ?? 0;
      if (filters.bedrooms === '4+') { if (beds < 4) return false; }
      else { if (beds !== filters.bedrooms) return false; }
    }
    if (filters.bathrooms !== 'any') {
      const baths = p.bathrooms ?? 0;
      if (filters.bathrooms === '3+') { if (baths < 3) return false; }
      else { if (baths !== filters.bathrooms) return false; }
    }
    if (p.trustScore < filters.minTrustScore) return false;
    return true;
  });
}

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    category?: string;
    verifiedOnly?: string;
    furnished?: string;
    district?: string;
    priceRange?: string;
    bedrooms?: string;
    bathrooms?: string;
    minTrustScore?: string;
  }>();
  const { user, requireAuth } = useAuth();
  const { shouldShow } = useWelcomeModal();
  const [searchQuery, setSearchQuery] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [dbProperties, setDbProperties] = useState<Property[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Real-time blocked users listener
  useEffect(() => {
    if (!user) {
      setBlockedUserIds([]);
      return;
    }
    const blocksRef = collection(db, 'blocks');
    const q = query(blocksRef, where('userId', '==', user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blocked = snapshot.docs.map(doc => doc.data().blockedUserId);
      setBlockedUserIds(blocked);
    }, (err) => {
      console.log('Error listening to blocks:', err);
    });
    return () => unsubscribe();
  }, [user]);

  // Synchronize state when params change
  useEffect(() => {
    if (Object.keys(params).length > 0) {
      setFilters(prev => ({
        category: (params.category as any) ?? prev.category,
        verifiedOnly: params.verifiedOnly !== undefined ? params.verifiedOnly === 'true' : prev.verifiedOnly,
        furnished: (params.furnished as any) ?? prev.furnished,
        district: params.district ?? prev.district,
        priceRange: (params.priceRange as any) ?? prev.priceRange,
        bedrooms: params.bedrooms !== undefined
          ? (params.bedrooms === 'any' || params.bedrooms === '4+' ? params.bedrooms : (parseInt(params.bedrooms) as any))
          : prev.bedrooms,
        bathrooms: params.bathrooms !== undefined
          ? (params.bathrooms === 'any' || params.bathrooms === '3+' ? params.bathrooms : (parseInt(params.bathrooms) as any))
          : prev.bathrooms,
        minTrustScore: params.minTrustScore !== undefined ? parseInt(params.minTrustScore) : prev.minTrustScore,
      }));
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    AsyncStorage.getItem('onboarding_done').then(val => {
      if (!val) {
        router.replace('/onboarding' as any);
      } else {
        setCheckingOnboarding(false);
        if (shouldShow) {
          router.push('/screens/welcome' as any);
        }
        SplashScreen.hideAsync().catch(() => { });
      }
    });
  }, []);

  // Real-time properties listener
  useEffect(() => {
    if (checkingOnboarding) return;

    const propertiesRef = collection(db, 'properties');
    const q = query(propertiesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const properties = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[];
      setDbProperties(properties);

      // Prefetch all retrieved property images for instant navigation display
      properties.forEach(p => {
        if (p.images && p.images.length > 0) {
          p.images.forEach(img => {
            if (img) Image.prefetch(img).catch(() => { });
          });
        }
      });
    }, (err) => {
      console.error('Error listening to properties:', err);
    });

    return () => unsubscribe();
  }, [checkingOnboarding]);

  const allProperties = useMemo(() => {
    if (blockedUserIds.length === 0) return dbProperties;
    return dbProperties.filter(p => !blockedUserIds.includes(p.landlordId));
  }, [dbProperties, blockedUserIds]);

  const filteredProperties = useMemo(() => {
    return applyFilters(allProperties, filters);
  }, [allProperties, filters]);

  const featuredProperties = useMemo(() => {
    const now = new Date().toISOString();
    // Paid featured listings first (featuredUntil > now), then verified, then newest
    const paid = filteredProperties.filter(p => p.featuredUntil && p.featuredUntil > now);
    const rest = filteredProperties.filter(p => !p.featuredUntil || p.featuredUntil <= now);
    const sorted = [...paid, ...rest.filter(p => p.isVerified), ...rest.filter(p => !p.isVerified)];
    return sorted.slice(0, 8);
  }, [filteredProperties]);

  const nearbyProperties = useMemo(() => {
    const now = new Date().toISOString();
    const featured = filteredProperties.filter(p => p.featuredUntil && p.featuredUntil > now);
    const featuredIds = new Set(featured.slice(0, 8).map(p => p.id));
    return filteredProperties.filter(p => !featuredIds.has(p.id)).slice(0, 8);
  }, [filteredProperties]);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (q) router.push(`/explore?q=${encodeURIComponent(q)}` as any);
    else router.push('/explore' as any);
  };

  const handleSave = async (id: string) => {
    if (!requireAuth('Sign in to save properties')) return;
    try {
      const stored = await AsyncStorage.getItem('saved_property_ids');
      let ids: string[] = stored ? JSON.parse(stored) : [];
      if (ids.includes(id)) {
        ids = ids.filter(x => x !== id);
      } else {
        ids.push(id);
      }
      await AsyncStorage.setItem('saved_property_ids', JSON.stringify(ids));
      setSavedIds(ids);
      router.push('/screens/saved-confirm' as any);
    } catch (e) {
      console.log('Error saving property:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadSavedIds = async () => {
        try {
          const stored = await AsyncStorage.getItem('saved_property_ids');
          if (stored) {
            setSavedIds(JSON.parse(stored));
          } else {
            setSavedIds([]);
          }
        } catch (e) {
          console.log('Error loading saved ids:', e);
        }
      };
      loadSavedIds();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setRefreshing(false);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    const displayName = user?.name || 'Guest';
    if (h >= 5 && h < 12) return `Good morning, ${displayName}! 👋`;
    if (h >= 12 && h < 17) return `Good afternoon, ${displayName}! 👋`;
    if (h >= 17 && h < 22) return `Good evening, ${displayName}! 👋`;
    return `Good night, ${displayName}! 👋`;
  };

  const activeCount = countActiveFilters(filters);

  if (checkingOnboarding) {
    // Show skeleton instead of blank screen to avoid white flash
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={[Colors.primary, '#3B82F6']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <View style={{ gap: 6 }}>
              <View style={styles.skeletonLine} />
              <View style={[styles.skeletonLine, { width: 180, height: 22 }]} />
            </View>
            <View style={styles.skeletonCircle} />
          </View>
          <View style={[styles.skeletonPill, { marginTop: 4 }]} />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
      >
        {/* ── Gradient Header ─────────────────────────── */}
        <LinearGradient
          colors={[Colors.primary, '#3B82F6']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.tagline}>Find your perfect space</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/screens/notifications' as any)}>
              <MaterialCommunityIcons name="bell-outline" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Search + Filter */}
          <View style={styles.searchRow}>
            <TouchableOpacity activeOpacity={0.92} onPress={handleSearch} style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={20} color={Colors.muted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search apartments, hostels, shops…"
                placeholderTextColor={Colors.placeholder}
                style={styles.searchInput}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialCommunityIcons name="close-circle" size={18} color={Colors.muted} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {/* Filter button */}
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => router.push({
                pathname: '/screens/filters',
                params: {
                  category: filters.category,
                  verifiedOnly: String(filters.verifiedOnly),
                  furnished: filters.furnished,
                  district: filters.district,
                  priceRange: filters.priceRange,
                  bedrooms: String(filters.bedrooms),
                  bathrooms: String(filters.bathrooms),
                  minTrustScore: String(filters.minTrustScore),
                  from: 'index'
                }
              } as any)}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="tune" size={20} color={Colors.white} />
              {activeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{activeCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

        </LinearGradient>

        {/* ── Quick Filter Chips ───────────────────────── */}
        <FilterChips filters={filters} onChange={setFilters} />

        {/* ── Active Filter Bar ────────────────────────── */}
        {activeCount > 0 && (
          <View style={styles.activeFilterBar}>
            <MaterialCommunityIcons name="filter-check" size={14} color={Colors.primary} />
            <Text style={styles.activeFilterText}>
              {activeCount} filter{activeCount > 1 ? 's' : ''} active · {featuredProperties.length + nearbyProperties.length} results
            </Text>
            <TouchableOpacity onPress={() => setFilters(DEFAULT_FILTERS)}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.body}>
          {/* ── Categories ──────────────────────────────── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What are you looking for?</Text>
          </View>
          <View style={styles.categoryGrid}>
            {CATEGORIES.slice(0, 2).map(cat => (
              <View key={cat} style={{ flex: 1 }}><CategoryCard category={cat} /></View>
            ))}
          </View>
          <View style={styles.categoryGrid}>
            {CATEGORIES.slice(2, 4).map(cat => (
              <View key={cat} style={{ flex: 1 }}><CategoryCard category={cat} /></View>
            ))}
          </View>

          {/* ── Extra Services ───────────────────────────── */}
          <Text style={[styles.sectionTitle, { marginTop: Spacing.xs }]}>More Services</Text>
          <View style={styles.categoryGrid}>
            <TouchableOpacity
              style={[styles.serviceCard, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
              onPress={() => router.push('/screens/furniture-shop' as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.serviceEmoji}>🛋️</Text>
              <Text style={[styles.serviceName, { color: '#92400E' }]}>Furniture</Text>
              <Text style={[styles.serviceSub, { color: '#B45309' }]}>Sofas, beds & more</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.serviceCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}
              onPress={() => router.push('/screens/furniture-shop?cat=Beddings' as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.serviceEmoji}>🛏️</Text>
              <Text style={[styles.serviceName, { color: '#14532D' }]}>Beddings</Text>
              <Text style={[styles.serviceSub, { color: '#166534' }]}>Duvets, pillows & sets</Text>
            </TouchableOpacity>
          </View>




          {/* ── Furnish Your Home Banner ──────────────────── */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push('/screens/furniture-shop' as any)}
            style={styles.furnishBanner}
          >
            <LinearGradient
              colors={['#D97706', '#F59E0B']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.furnishGradient}
            >
              <Text style={styles.furnishEmoji}>🛋️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.furnishTitle}>Furnish Your New Home</Text>
                <Text style={styles.furnishSub}>Beds, sofas, duvets — delivered to your door</Text>
              </View>
              <MaterialCommunityIcons name="arrow-right" size={20} color="rgba(255,255,255,0.9)" />
            </LinearGradient>
          </TouchableOpacity>

          {/* ── Featured Listings ────────────────────────── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Listings</Text>
            <TouchableOpacity onPress={() => router.push('/explore' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {featuredProperties.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyEmoji}>🔎</Text>
              <Text style={styles.emptyMsg}>No featured listings match your filters</Text>
            </View>
          ) : (
            <FlatList
              data={featuredProperties}
              keyExtractor={p => p.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              ItemSeparatorComponent={() => <View style={{ width: Spacing.md }} />}
              renderItem={({ item }) => (
                <View style={{ width: 240 }}>
                  <PropertyCard property={item} isSaved={savedIds.includes(item.id)} onSave={() => handleSave(item.id)} />
                </View>
              )}
            />
          )}

          {/* ── Near Location ────────────────────────────── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Near You</Text>
            <TouchableOpacity onPress={() => router.push('/explore' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {nearbyProperties.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyEmoji}>🏘️</Text>
              <Text style={styles.emptyMsg}>No nearby listings match your filters</Text>
            </View>
          ) : (
            <View style={styles.nearbyGrid}>
              {nearbyProperties.map(p => (
                <View key={p.id}>
                  <PropertyCard property={p} isSaved={savedIds.includes(p.id)} onSave={() => handleSave(p.id)} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  headerGradient: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.xl + 4, gap: Spacing.md },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', fontWeight: FontWeight.medium },
  tagline: { fontSize: FontSize['2xl'], color: Colors.white, fontWeight: FontWeight.bold, marginTop: 2 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md, paddingVertical: 6, ...Shadow.md,
  },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  filterBtn: {
    width: 44, height: 44, borderRadius: Radius.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.warning, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.primary,
  },
  badgeText: { fontSize: 9, color: Colors.white, fontWeight: FontWeight.bold },
  locationScroll: { marginTop: 4 },
  locationPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: Radius.full, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)', marginRight: Spacing.sm,
  },
  locationPillActive: { backgroundColor: 'rgba(255,255,255,0.25)', borderColor: Colors.white },
  locationText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', fontWeight: FontWeight.medium },
  locationTextActive: { color: Colors.white, fontWeight: FontWeight.semibold },
  activeFilterBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.base, marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    backgroundColor: Colors.primaryLight, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.primary + '25',
  },
  activeFilterText: { flex: 1, fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  clearText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
  body: { padding: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing['4xl'] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.base, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  categoryGrid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  // ── Service tiles (furniture/beddings) ────────────────────────────────
  serviceCard: {
    flex: 1, borderRadius: Radius.xl, padding: Spacing.md,
    alignItems: 'center', gap: 4, borderWidth: 1.5,
    minHeight: 90, justifyContent: 'center',
  },
  serviceEmoji: { fontSize: 28 },
  serviceName: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  serviceSub: { fontSize: FontSize.xs, textAlign: 'center' },
  // ── Furnish banner ───────────────────────────────────────────────────
  furnishBanner: { borderRadius: Radius.xl, overflow: 'hidden', marginVertical: Spacing.sm, ...Shadow.sm },
  furnishGradient: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.base },
  furnishEmoji: { fontSize: 28 },
  furnishTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#fff' },
  furnishSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  trustBanner: { marginVertical: Spacing.sm, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
  trustGradient: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.base },
  trustTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.trust },
  trustSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  trustCta: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  horizontalList: { paddingRight: Spacing.base },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginVertical: Spacing.sm },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', gap: 4, ...Shadow.sm },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs, color: Colors.muted, textAlign: 'center', fontWeight: FontWeight.medium },
  nearbyGrid: { gap: Spacing.md },
  emptySection: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyEmoji: { fontSize: 32 },
  emptyMsg: { fontSize: FontSize.sm, color: Colors.muted, textAlign: 'center' },
  // ── Skeleton styles ────────────────────────────────────────────────────
  skeletonLine: {
    height: 14, width: 130, borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  skeletonCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  skeletonPill: {
    height: 42, borderRadius: Radius.xl,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 2,
  },
});

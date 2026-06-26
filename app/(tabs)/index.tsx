import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, FlatList, RefreshControl, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const LOCATIONS = ['Kampala', 'Ntinda', 'Kira', 'Nakawa', 'Kololo', 'Entebbe'];
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
    if (filters.district !== 'All' &&
      !p.district.toLowerCase().includes(filters.district.toLowerCase()) &&
      !p.location.toLowerCase().includes(filters.district.toLowerCase())) return false;
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
  const [selectedLocation, setSelectedLocation] = useState('Kampala');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [dbProperties, setDbProperties] = useState<Property[]>([]);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

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
  }, [params]);

  const loadDbProperties = async () => {
    try {
      const result = await fetchProperties();
      const properties = result.properties as Property[];
      setDbProperties(properties);

      // Prefetch all retrieved property images for instant navigation display
      properties.forEach(p => {
        if (p.images && p.images.length > 0) {
          p.images.forEach(img => {
            if (img) Image.prefetch(img).catch(() => {});
          });
        }
      });
    } catch (err) {
      console.error('Error fetching Firestore properties:', err);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem('onboarding_done').then(val => {
      if (!val) {
        router.replace('/onboarding' as any);
      } else {
        setCheckingOnboarding(false);
        if (shouldShow) {
          router.push('/screens/welcome' as any);
        }
        loadDbProperties();
      }
    });
  }, []);

  const allProperties = useMemo(() => {
    return dbProperties;
  }, [dbProperties]);

  const featuredProperties = useMemo(() => {
    return applyFilters(allProperties, filters).slice(0, 6);
  }, [allProperties, filters]);

  const nearbyProperties = useMemo(() => {
    return applyFilters(allProperties, filters).slice(6, 12);
  }, [allProperties, filters]);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (q) router.push(`/explore?q=${encodeURIComponent(q)}` as any);
    else router.push('/explore' as any);
  };

  const handleSave = (id: string) => {
    if (!requireAuth('Sign in to save properties')) return;
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    router.push('/screens/saved-confirm' as any);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadDbProperties(),
      new Promise(r => setTimeout(r, 800))
    ]);
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
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary} />
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

          {/* Location Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationScroll}>
            {LOCATIONS.map(loc => (
              <TouchableOpacity
                key={loc}
                onPress={() => setSelectedLocation(loc)}
                style={[styles.locationPill, selectedLocation === loc && styles.locationPillActive]}
              >
                <MaterialCommunityIcons name="map-marker" size={12}
                  color={selectedLocation === loc ? Colors.white : 'rgba(255,255,255,0.7)'} />
                <Text style={[styles.locationText, selectedLocation === loc && styles.locationTextActive]}>
                  {loc}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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

          {/* ── Trust Banner ─────────────────────────────── */}
          <View style={styles.trustBanner}>
            <LinearGradient
              colors={[Colors.trustLight, Colors.primaryLight]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.trustGradient}
            >
              <MaterialCommunityIcons name="shield-check" size={28} color={Colors.trust} />
              <View style={{ flex: 1 }}>
                <Text style={styles.trustTitle}>Trust First, Always</Text>
                <Text style={styles.trustSubtitle}>Every listing verified by our team</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/explore' as any)}>
                <Text style={styles.trustCta}>Learn more →</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

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

          {/* ── Stats ────────────────────────────────────── */}
          <View style={styles.statsRow}>
            {[
              { label: 'Verified Listings', value: '2,400+', icon: 'shield-check', color: Colors.trust },
              { label: 'Happy Tenants', value: '15K+', icon: 'account-group', color: Colors.success },
              { label: 'Districts Covered', value: '12', icon: 'map-marker-multiple', color: Colors.warning },
            ].map(s => (
              <View key={s.label} style={styles.statCard}>
                <MaterialCommunityIcons name={s.icon as any} size={22} color={s.color} />
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Near Location ────────────────────────────── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Near {selectedLocation}</Text>
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
});

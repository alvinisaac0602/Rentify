import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, CategoryType } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { DISTRICTS, Property } from '../../constants/mockData';
import { FilterChips, FilterState } from '../../components/ui/FilterChips';
import { PropertyCard } from '../../components/ui/PropertyCard';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { FilterModal, DEFAULT_FILTERS, countActiveFilters } from '../../components/modals/FilterModal';
import { fetchProperties } from '../../services/firebaseServices';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function ExploreScreen() {
  const params = useLocalSearchParams<{
    q?: string;
    category?: string;
    verifiedOnly?: string;
    furnished?: string;
    district?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
    bathrooms?: string;
    minTrustScore?: string;
  }>();
  const router = useRouter();
  const { user, requireAuth } = useAuth();

  const [searchQuery, setSearchQuery] = useState(params.q ?? '');
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    category: (params.category as CategoryType | undefined) ?? 'all',
  });
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [dbProperties, setDbProperties] = useState<Property[]>([]);
  const [realUserIds, setRealUserIds] = useState<string[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);

  // Real-time users listener to exclude properties owned by non-existent/mock landlords
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const ids = snapshot.docs.map(doc => doc.id);
      setRealUserIds(ids);
    }, (err) => {
      console.log('Error listening to users:', err);
    });
    return () => unsubscribe();
  }, []);

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
    loadDbProperties();
  }, []);

  useEffect(() => {
    if (Object.keys(params).length > 0) {
      setFilters(prev => ({
        category: (params.category as any) ?? prev.category,
        verifiedOnly: params.verifiedOnly !== undefined ? params.verifiedOnly === 'true' : prev.verifiedOnly,
        furnished: (params.furnished as any) ?? prev.furnished,
        district: params.district ?? prev.district,
        priceRange: 'all',
        minPrice: params.minPrice !== undefined ? parseInt(params.minPrice) : prev.minPrice,
        maxPrice: params.maxPrice !== undefined ? parseInt(params.maxPrice) : prev.maxPrice,
        bedrooms: params.bedrooms !== undefined
          ? (params.bedrooms === 'any' || params.bedrooms === '4+' ? params.bedrooms : (parseInt(params.bedrooms) as any))
          : prev.bedrooms,
        bathrooms: params.bathrooms !== undefined
          ? (params.bathrooms === 'any' || params.bathrooms === '3+' ? params.bathrooms : (parseInt(params.bathrooms) as any))
          : prev.bathrooms,
        minTrustScore: params.minTrustScore !== undefined ? parseInt(params.minTrustScore) : prev.minTrustScore,
      }));
      if (params.q !== undefined) setSearchQuery(params.q);
    }
  }, [JSON.stringify(params)]);

  const allProperties = useMemo(() => {
    let list = dbProperties;
    if (realUserIds.length > 0) {
      list = list.filter(p => realUserIds.includes(p.landlordId));
    }
    if (blockedUserIds.length === 0) return list;
    return list.filter(p => !blockedUserIds.includes(p.landlordId));
  }, [dbProperties, blockedUserIds, realUserIds]);

  const filtered = useMemo(() => {
    const minPrice = filters.minPrice > 0 ? filters.minPrice : 0;
    const maxPrice = filters.maxPrice > 0 ? filters.maxPrice : Infinity;
    return allProperties.filter(p => {
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
      if (p.price < minPrice || p.price > maxPrice) return false;
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
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.location.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allProperties, filters, searchQuery]);

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

  const activeCount = countActiveFilters(filters);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.muted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search apartments, hostels, shops…"
              placeholderTextColor={Colors.placeholder}
              style={styles.searchInput}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close-circle" size={18} color={Colors.muted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter button with badge */}
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => router.push({
              pathname: '/screens/filters',
              params: {
                category: filters.category,
                verifiedOnly: String(filters.verifiedOnly),
                furnished: filters.furnished,
                district: filters.district,
                minPrice: String(filters.minPrice),
                maxPrice: String(filters.maxPrice),
                bedrooms: String(filters.bedrooms),
                bathrooms: String(filters.bathrooms),
                minTrustScore: String(filters.minTrustScore),
                from: 'explore'
              }
            } as any)}
            activeOpacity={0.78}
          >
            <MaterialCommunityIcons name="tune" size={20} color={Colors.primary} />
            {activeCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Filter Summary */}
      {activeCount > 0 && (
        <View style={styles.activeFilterBar}>
          <MaterialCommunityIcons name="filter-check" size={14} color={Colors.primary} />
          <Text style={styles.activeFilterText}>{activeCount} filter{activeCount > 1 ? 's' : ''} active</Text>
          <TouchableOpacity onPress={() => setFilters({ ...DEFAULT_FILTERS, category: filters.category })}>
            <Text style={styles.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Filter Chips */}
      <FilterChips filters={filters} onChange={setFilters} />

      {/* Results Count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>{filtered.length} listings found</Text>
        <TouchableOpacity style={styles.sortBtn} activeOpacity={0.78}>
          <MaterialCommunityIcons name="sort" size={16} color={Colors.primary} />
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Listings Grid */}
      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔎</Text>
            <Text style={styles.emptyTitle}>No listings found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
            <TouchableOpacity
              style={styles.clearAllBtn}
              onPress={() => setFilters({ ...DEFAULT_FILTERS, category: filters.category })}
            >
              <Text style={styles.clearAllText}>Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <PropertyCard
              property={item}
              isSaved={savedIds.includes(item.id)}
              onSave={() => handleSave(item.id)}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  filterBtn: {
    width: 44, height: 44, borderRadius: Radius.xl,
    backgroundColor: Colors.primaryLight, borderWidth: 1.5,
    borderColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.bg,
  },
  badgeText: { fontSize: 9, color: Colors.white, fontWeight: FontWeight.bold },
  activeFilterBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.base, marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    backgroundColor: Colors.primaryLight, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.primary + '25',
  },
  activeFilterText: { flex: 1, fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  clearFiltersText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
  resultsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm,
  },
  resultsText: { fontSize: FontSize.sm, color: Colors.muted, fontWeight: FontWeight.medium },
  sortBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.sm, paddingVertical: 5,
    backgroundColor: Colors.primaryLight, borderRadius: Radius.full,
  },
  sortText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  columnWrapper: { gap: Spacing.md, paddingHorizontal: Spacing.base },
  listContent: { gap: Spacing.md, paddingBottom: 120 },
  gridItem: { flex: 1 },
  emptyState: { alignItems: 'center', paddingTop: Spacing['4xl'], gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  emptySubtitle: { fontSize: FontSize.base, color: Colors.muted },
  clearAllBtn: {
    marginTop: Spacing.sm, paddingHorizontal: Spacing.xl, paddingVertical: 12,
    backgroundColor: Colors.primary, borderRadius: Radius.full,
  },
  clearAllText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});

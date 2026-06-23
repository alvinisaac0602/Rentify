import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, CategoryType } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { MOCK_PROPERTIES, DISTRICTS } from '../../constants/mockData';
import { FilterChips, FilterState } from '../../components/ui/FilterChips';
import { PropertyCard } from '../../components/ui/PropertyCard';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { FilterModal, DEFAULT_FILTERS, countActiveFilters } from '../../components/modals/FilterModal';

const PRICE_THRESHOLDS: Record<FilterState['priceRange'], [number, number]> = {
  all: [0, Infinity],
  budget: [0, 700000],
  mid: [700001, 3000000],
  premium: [3000001, Infinity],
};

export default function ExploreScreen() {
  const params = useLocalSearchParams<{ q?: string; category?: string }>();
  const router = useRouter();
  const { requireAuth } = useAuth();

  const [searchQuery, setSearchQuery] = useState(params.q ?? '');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    category: (params.category as CategoryType | undefined) ?? 'all',
  });
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    if (params.category) {
      setFilters(prev => ({ ...prev, category: params.category as CategoryType | 'all' }));
    }
  }, [params.category]);

  useEffect(() => {
    if (params.q !== undefined) setSearchQuery(params.q);
  }, [params.q]);

  const filtered = useMemo(() => {
    const [minPrice, maxPrice] = PRICE_THRESHOLDS[filters.priceRange];
    return MOCK_PROPERTIES.filter(p => {
      if (filters.category !== 'all' && p.category !== filters.category) return false;
      if (filters.verifiedOnly && !p.isVerified) return false;
      if (filters.furnished === 'furnished' && !p.isFurnished) return false;
      if (filters.furnished === 'unfurnished' && p.isFurnished) return false;
      if (filters.district !== 'All' &&
        !p.district.toLowerCase().includes(filters.district.toLowerCase()) &&
        !p.location.toLowerCase().includes(filters.district.toLowerCase())) return false;
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
  }, [filters, searchQuery]);

  const handleSave = (id: string) => {
    if (!requireAuth('Sign in to save properties')) return;
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    router.push('/screens/saved-confirm' as any);
  };

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
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilterModal(true)} activeOpacity={0.78}>
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

      {/* Advanced Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onApply={setFilters}
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

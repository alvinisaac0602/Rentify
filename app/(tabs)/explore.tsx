import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, CategoryType } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { MOCK_PROPERTIES } from '../../constants/mockData';
import { FilterChips, FilterState } from '../../components/ui/FilterChips';
import { PropertyCard } from '../../components/ui/PropertyCard';
import { useAuth } from '../../context/AuthContext';

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
  const [filters, setFilters] = useState<FilterState>({
    category: (params.category as CategoryType | undefined) ?? 'all',
    verifiedOnly: false,
    furnished: false,
    district: 'All',
    priceRange: 'all',
  });
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const [minPrice, maxPrice] = PRICE_THRESHOLDS[filters.priceRange];
    return MOCK_PROPERTIES.filter(p => {
      if (filters.category !== 'all' && p.category !== filters.category) return false;
      if (filters.verifiedOnly && !p.isVerified) return false;
      if (filters.furnished && !p.isFurnished) return false;
      if (filters.district !== 'All' && !p.district.toLowerCase().includes(filters.district.toLowerCase()) && !p.location.toLowerCase().includes(filters.district.toLowerCase())) return false;
      if (p.price < minPrice || p.price > maxPrice) return false;
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search header */}
      <View style={styles.header}>
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
      </View>

      {/* Filters */}
      <FilterChips filters={filters} onChange={setFilters} />

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>{filtered.length} listings found</Text>
        <TouchableOpacity style={styles.sortBtn}>
          <MaterialCommunityIcons name="sort" size={16} color={Colors.primary} />
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Listings grid */}
      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>ðŸ”</Text>
            <Text style={styles.emptyTitle}>No listings found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
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
  header: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing.md, gap: Spacing.md },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.text },
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
});

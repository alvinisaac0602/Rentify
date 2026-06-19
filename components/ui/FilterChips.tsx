import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, CategoryType } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';

export interface FilterState {
  category: CategoryType | 'all';
  verifiedOnly: boolean;
  furnished: boolean;
  district: string;
  priceRange: 'all' | 'budget' | 'mid' | 'premium';
}

interface FilterChipsProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const CATEGORIES: { key: FilterState['category']; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '🔍' },
  { key: 'apartment', label: 'Apartments', emoji: '🏠' },
  { key: 'office', label: 'Offices', emoji: '🏢' },
  { key: 'shop', label: 'Shops', emoji: '🏪' },
  { key: 'airbnb', label: 'Airbnbs', emoji: '🏨' },
];

const PRICE_RANGES: { key: FilterState['priceRange']; label: string }[] = [
  { key: 'all', label: 'Any Price' },
  { key: 'budget', label: 'Budget' },
  { key: 'mid', label: 'Mid-Range' },
  { key: 'premium', label: 'Premium' },
];

const DISTRICTS = ['All Districts', 'Kampala', 'Wakiso', 'Ntinda', 'Kira', 'Mukono', 'Entebbe'];

export function FilterChips({ filters, onChange }: FilterChipsProps) {
  const toggle = (key: keyof FilterState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollContainer}
      contentContainerStyle={styles.row}
    >
      {/* Category chips */}
      {CATEGORIES.map(cat => {
        const active = filters.category === cat.key;
        const catColor = cat.key !== 'all'
          ? Colors[cat.key as CategoryType]
          : Colors.primary;
        return (
          <TouchableOpacity
            key={cat.key}
            activeOpacity={0.75}
            onPress={() => toggle('category', cat.key)}
            style={[styles.chip, active && { backgroundColor: catColor, borderColor: catColor }]}
          >
            <Text style={styles.emoji}>{cat.emoji}</Text>
            <Text style={[styles.chipText, active && styles.activeText]}>{cat.label}</Text>
          </TouchableOpacity>
        );
      })}

      <View style={styles.divider} />

      {/* Verified Only */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => toggle('verifiedOnly', !filters.verifiedOnly)}
        style={[styles.chip, filters.verifiedOnly && styles.verifiedChip]}
      >
        <MaterialCommunityIcons
          name="shield-check"
          size={13}
          color={filters.verifiedOnly ? Colors.white : Colors.trust}
        />
        <Text style={[styles.chipText, filters.verifiedOnly && styles.activeText]}>Verified</Text>
      </TouchableOpacity>

      {/* Furnished */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => toggle('furnished', !filters.furnished)}
        style={[styles.chip, filters.furnished && styles.activeChip]}
      >
        <Text style={[styles.chipText, filters.furnished && styles.activeText]}>Furnished</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Price Ranges */}
      {PRICE_RANGES.map(p => {
        const active = filters.priceRange === p.key;
        return (
          <TouchableOpacity
            key={p.key}
            activeOpacity={0.75}
            onPress={() => toggle('priceRange', p.key)}
            style={[styles.chip, active && styles.activeChip]}
          >
            <Text style={[styles.chipText, active && styles.activeText]}>{p.label}</Text>
          </TouchableOpacity>
        );
      })}

      <View style={styles.divider} />

      {/* Districts */}
      {DISTRICTS.map(d => {
        const key = d === 'All Districts' ? 'All' : d;
        const active = filters.district === key;
        return (
          <TouchableOpacity
            key={d}
            activeOpacity={0.75}
            onPress={() => toggle('district', key)}
            style={[styles.chip, active && styles.activeChip]}
          >
            <Text style={[styles.chipText, active && styles.activeText]}>📍 {d}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.2,
    borderColor: Colors.border,
  },
  activeChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  verifiedChip: {
    backgroundColor: Colors.trust,
    borderColor: Colors.trust,
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    lineHeight: 18,
  },
  activeText: {
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
  emoji: {
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginHorizontal: 2,
  },
});

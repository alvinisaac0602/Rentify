import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { FilterState } from '../../components/ui/FilterChips';
import { Button } from '../../components/ui/Button';
import { DISTRICTS } from '../../constants/mockData';
import { DEFAULT_FILTERS } from '../../components/modals/FilterModal';

export default function FiltersScreen() {
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
    from?: string;
  }>();

  const from = params.from ?? 'index';

  // Parse filters from parameters
  const getInitialFilters = (): FilterState => {
    return {
      category: (params.category as any) ?? 'all',
      verifiedOnly: params.verifiedOnly === 'true',
      furnished: (params.furnished as any) ?? 'any',
      district: params.district ?? 'All',
      priceRange: (params.priceRange as any) ?? 'all',
      bedrooms: params.bedrooms
        ? (params.bedrooms === 'any' || params.bedrooms === '4+' ? params.bedrooms : (parseInt(params.bedrooms) as any))
        : 'any',
      bathrooms: params.bathrooms
        ? (params.bathrooms === 'any' || params.bathrooms === '3+' ? params.bathrooms : (parseInt(params.bathrooms) as any))
        : 'any',
      minTrustScore: params.minTrustScore ? parseInt(params.minTrustScore) : 0,
    };
  };

  const [temp, setTemp] = useState<FilterState>(DEFAULT_FILTERS);

  // Initialize once params are loaded
  useEffect(() => {
    setTemp(getInitialFilters());
  }, [params]);

  const set = (patch: Partial<FilterState>) => setTemp((t: FilterState) => ({ ...t, ...patch }));
  const reset = () => setTemp({ ...DEFAULT_FILTERS, category: temp.category });
  
  const apply = () => {
    const target = from === 'explore' ? '/explore' : '/(tabs)';
    router.replace({
      pathname: target as any,
      params: {
        category: temp.category,
        verifiedOnly: String(temp.verifiedOnly),
        furnished: temp.furnished,
        district: temp.district,
        priceRange: temp.priceRange,
        bedrooms: String(temp.bedrooms),
        bathrooms: String(temp.bathrooms),
        minTrustScore: String(temp.minTrustScore),
      }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Advanced Filters</Text>
        <TouchableOpacity onPress={reset} style={styles.resetBtn}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>

        {/* ── Category ──────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipGrid}>
            {(['all', 'apartment', 'hostel', 'shop', 'airbnb'] as const).map(cat => {
              const active = temp.category === cat;
              const meta: Record<string, string> = {
                all: '🔍 All', apartment: '🏠 Apartments', hostel: '🛏️ Hostels',
                shop: '🏪 Shops', airbnb: '🏨 Airbnbs',
              };
              return (
                <TouchableOpacity key={cat} style={[styles.chip, active && styles.activeChip]}
                  onPress={() => set({ category: cat })}>
                  <Text style={[styles.chipTxt, active && styles.activeChipTxt]}>{meta[cat]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Price Range ───────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.label}>Price Budget</Text>
          <View style={styles.seg}>
            {(['all', 'budget', 'mid', 'premium'] as const).map(r => {
              const active = temp.priceRange === r;
              const lbl = { all: 'Any', budget: 'Budget', mid: 'Mid-Range', premium: 'Premium' }[r];
              return (
                <TouchableOpacity key={r} style={[styles.segBtn, active && styles.activeSegBtn]}
                  onPress={() => set({ priceRange: r })}>
                  <Text style={[styles.segTxt, active && styles.activeSegTxt]}>{lbl}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Bedrooms ──────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.label}>Bedrooms</Text>
          <View style={styles.seg}>
            {(['any', 1, 2, 3, '4+'] as const).map(val => {
              const active = temp.bedrooms === val;
              return (
                <TouchableOpacity key={String(val)} style={[styles.segBtn, active && styles.activeSegBtn]}
                  onPress={() => set({ bedrooms: val })}>
                  <MaterialCommunityIcons name="bed" size={13}
                    color={active ? Colors.primary : Colors.muted} style={{ marginRight: 2 }} />
                  <Text style={[styles.segTxt, active && styles.activeSegTxt]}>
                    {val === 'any' ? 'Any' : val}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Bathrooms ─────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.label}>Bathrooms</Text>
          <View style={styles.seg}>
            {(['any', 1, 2, '3+'] as const).map(val => {
              const active = temp.bathrooms === val;
              return (
                <TouchableOpacity key={String(val)} style={[styles.segBtn, active && styles.activeSegBtn]}
                  onPress={() => set({ bathrooms: val })}>
                  <MaterialCommunityIcons name="shower" size={13}
                    color={active ? Colors.primary : Colors.muted} style={{ marginRight: 2 }} />
                  <Text style={[styles.segTxt, active && styles.activeSegTxt]}>
                    {val === 'any' ? 'Any' : val}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── District ──────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.label}>District</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}>
            {DISTRICTS.map(d => {
              const active = temp.district === d;
              return (
                <TouchableOpacity key={d} style={[styles.chip, active && styles.activeChip]}
                  onPress={() => set({ district: d })}>
                  <Text style={[styles.chipTxt, active && styles.activeChipTxt]}>📍 {d}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Furnishing ────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.label}>Furnishing</Text>
          <View style={styles.seg}>
            {(['any', 'furnished', 'unfurnished'] as const).map(val => {
              const active = temp.furnished === val;
              const lbl = { any: 'Any', furnished: 'Furnished', unfurnished: 'Unfurnished' }[val];
              return (
                <TouchableOpacity key={val} style={[styles.segBtn, active && styles.activeSegBtn]}
                  onPress={() => set({ furnished: val })}>
                  <Text style={[styles.segTxt, active && styles.activeSegTxt]}>{lbl}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Trust Score ───────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.label}>Min. Trust Score</Text>
          <View style={styles.seg}>
            {([0, 70, 80, 90] as const).map(val => {
              const active = temp.minTrustScore === val;
              const lbl = { 0: 'Any', 70: '70+ Safe', 80: '80+ Secure', 90: '90+ Elite' }[val];
              return (
                <TouchableOpacity key={val} style={[styles.segBtn, active && styles.activeSegBtn]}
                  onPress={() => set({ minTrustScore: val })}>
                  <Text style={[styles.segTxt, active && styles.activeSegTxt]}>{lbl}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Verified Only ─────────────────────────── */}
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Verified Listings Only</Text>
            <Text style={styles.toggleSub}>Show only Rentify-verified properties</Text>
          </View>
          <Switch
            value={temp.verifiedOnly}
            onValueChange={v => set({ verifiedOnly: v })}
            trackColor={{ false: Colors.border, true: Colors.trust }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Apply Filters" onPress={apply} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  resetBtn: { paddingVertical: 6, paddingHorizontal: Spacing.sm },
  resetText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  body: { padding: Spacing.xl },
  section: { marginBottom: Spacing.xl },
  label: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chipRow: { gap: Spacing.sm, paddingRight: Spacing.xl },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1.5,
    borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  activeChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipTxt: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  activeChipTxt: { color: Colors.white, fontWeight: FontWeight.semibold },
  seg: {
    flexDirection: 'row', backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.lg, padding: 3, borderWidth: 1, borderColor: Colors.border,
  },
  segBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.md, flexDirection: 'row', gap: 2,
  },
  activeSegBtn: { backgroundColor: Colors.white, ...Shadow.sm },
  segTxt: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  activeSegTxt: { color: Colors.text, fontWeight: FontWeight.bold },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    marginBottom: Spacing['2xl'],
  },
  toggleLabel: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  toggleSub: { fontSize: FontSize.xs, color: Colors.muted, marginTop: 2 },
  footer: {
    padding: Spacing.xl, borderTopWidth: 1,
    borderTopColor: Colors.border, backgroundColor: Colors.surface,
  },
});

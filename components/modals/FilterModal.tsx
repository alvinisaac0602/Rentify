import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { FilterState } from '../ui/FilterChips';
import { Button } from '../ui/Button';
import { DISTRICTS } from '../../constants/mockData';

export const DEFAULT_FILTERS: FilterState = {
  category: 'all',
  verifiedOnly: false,
  furnished: 'any',
  district: 'All',
  priceRange: 'all',
  bedrooms: 'any',
  bathrooms: 'any',
  minTrustScore: 0,
};

export function countActiveFilters(f: FilterState): number {
  let n = 0;
  if (f.verifiedOnly) n++;
  if (f.furnished !== 'any') n++;
  if (f.district !== 'All') n++;
  if (f.priceRange !== 'all') n++;
  if (f.bedrooms !== 'any') n++;
  if (f.bathrooms !== 'any') n++;
  if (f.minTrustScore > 0) n++;
  return n;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (f: FilterState) => void;
  showCategoryFilter?: boolean;
}

export function FilterModal({ visible, onClose, filters, onApply, showCategoryFilter = true }: Props) {
  const [temp, setTemp] = useState<FilterState>({ ...filters });

  useEffect(() => { if (visible) setTemp({ ...filters }); }, [visible]);

  const set = (patch: Partial<FilterState>) => setTemp(t => ({ ...t, ...patch }));
  const reset = () => setTemp({ ...DEFAULT_FILTERS, category: filters.category });
  const apply = () => { onApply(temp); onClose(); };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <TouchableOpacity style={s.overlayDismiss} activeOpacity={1} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.handle} />

          <View style={s.header}>
            <Text style={s.title}>Advanced Filters</Text>
            <View style={s.headerRight}>
              <TouchableOpacity onPress={reset} style={s.resetBtn}>
                <Text style={s.resetText}>Reset All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                <MaterialCommunityIcons name="close" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.body}>

            {/* ── Category ──────────────────────────────── */}
            {showCategoryFilter && (
              <View style={s.section}>
                <Text style={s.label}>Category</Text>
                <View style={s.chipGrid}>
                  {(['all', 'apartment', 'hostel', 'shop', 'airbnb'] as const).map(cat => {
                    const active = temp.category === cat;
                    const meta: Record<string, string> = {
                      all: '🔍 All', apartment: '🏠 Apartments', hostel: '🛏️ Hostels',
                      shop: '🏪 Shops', airbnb: '🏨 Airbnbs',
                    };
                    return (
                      <TouchableOpacity key={cat} style={[s.chip, active && s.activeChip]}
                        onPress={() => set({ category: cat })}>
                        <Text style={[s.chipTxt, active && s.activeChipTxt]}>{meta[cat]}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ── Price Range ───────────────────────────── */}
            <View style={s.section}>
              <Text style={s.label}>Price Budget</Text>
              <View style={s.seg}>
                {(['all', 'budget', 'mid', 'premium'] as const).map(r => {
                  const active = temp.priceRange === r;
                  const lbl = { all: 'Any', budget: 'Budget', mid: 'Mid-Range', premium: 'Premium' }[r];
                  return (
                    <TouchableOpacity key={r} style={[s.segBtn, active && s.activeSegBtn]}
                      onPress={() => set({ priceRange: r })}>
                      <Text style={[s.segTxt, active && s.activeSegTxt]}>{lbl}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── Bedrooms ──────────────────────────────── */}
            <View style={s.section}>
              <Text style={s.label}>Bedrooms</Text>
              <View style={s.seg}>
                {(['any', 1, 2, 3, '4+'] as const).map(val => {
                  const active = temp.bedrooms === val;
                  return (
                    <TouchableOpacity key={String(val)} style={[s.segBtn, active && s.activeSegBtn]}
                      onPress={() => set({ bedrooms: val })}>
                      <MaterialCommunityIcons name="bed" size={13}
                        color={active ? Colors.primary : Colors.muted} />
                      <Text style={[s.segTxt, active && s.activeSegTxt]}>
                        {val === 'any' ? 'Any' : val}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── Bathrooms ─────────────────────────────── */}
            <View style={s.section}>
              <Text style={s.label}>Bathrooms</Text>
              <View style={s.seg}>
                {(['any', 1, 2, '3+'] as const).map(val => {
                  const active = temp.bathrooms === val;
                  return (
                    <TouchableOpacity key={String(val)} style={[s.segBtn, active && s.activeSegBtn]}
                      onPress={() => set({ bathrooms: val })}>
                      <MaterialCommunityIcons name="shower" size={13}
                        color={active ? Colors.primary : Colors.muted} />
                      <Text style={[s.segTxt, active && s.activeSegTxt]}>
                        {val === 'any' ? 'Any' : val}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── District ──────────────────────────────── */}
            <View style={s.section}>
              <Text style={s.label}>District</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.chipRow}>
                {DISTRICTS.map(d => {
                  const active = temp.district === d;
                  return (
                    <TouchableOpacity key={d} style={[s.chip, active && s.activeChip]}
                      onPress={() => set({ district: d })}>
                      <Text style={[s.chipTxt, active && s.activeChipTxt]}>📍 {d}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* ── Furnishing ────────────────────────────── */}
            <View style={s.section}>
              <Text style={s.label}>Furnishing</Text>
              <View style={s.seg}>
                {(['any', 'furnished', 'unfurnished'] as const).map(val => {
                  const active = temp.furnished === val;
                  const lbl = { any: 'Any', furnished: 'Furnished', unfurnished: 'Unfurnished' }[val];
                  return (
                    <TouchableOpacity key={val} style={[s.segBtn, active && s.activeSegBtn]}
                      onPress={() => set({ furnished: val })}>
                      <Text style={[s.segTxt, active && s.activeSegTxt]}>{lbl}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── Trust Score ───────────────────────────── */}
            <View style={s.section}>
              <Text style={s.label}>Min. Trust Score</Text>
              <View style={s.seg}>
                {([0, 70, 80, 90] as const).map(val => {
                  const active = temp.minTrustScore === val;
                  const lbl = { 0: 'Any', 70: '70+ Safe', 80: '80+ Secure', 90: '90+ Elite' }[val];
                  return (
                    <TouchableOpacity key={val} style={[s.segBtn, active && s.activeSegBtn]}
                      onPress={() => set({ minTrustScore: val })}>
                      <Text style={[s.segTxt, active && s.activeSegTxt]}>{lbl}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── Verified Only ─────────────────────────── */}
            <View style={s.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.toggleLabel}>Verified Listings Only</Text>
                <Text style={s.toggleSub}>Show only Rentify-verified properties</Text>
              </View>
              <Switch
                value={temp.verifiedOnly}
                onValueChange={v => set({ verifiedOnly: v })}
                trackColor={{ false: Colors.border, true: Colors.trust }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>

          <View style={s.footer}>
            <Button label="Apply Filters" onPress={apply} fullWidth />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  overlayDismiss: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '92%', ...Shadow.lg,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginTop: Spacing.md,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  resetBtn: { paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  resetText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center',
  },
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
    borderRadius: Radius.md, flexDirection: 'row', gap: 4,
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

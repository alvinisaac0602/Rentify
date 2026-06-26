import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const PERKS = [
  { icon: 'lightning-bolt', color: Colors.warning, text: 'List in under 5 minutes' },
  { icon: 'shield-check', color: Colors.trust, text: 'Rentify-verified badge' },
  { icon: 'account-group', color: Colors.success, text: 'Reach 15,000+ tenants' },
  { icon: 'cash-multiple', color: Colors.airbnb, text: 'Free to list, no commission' },
];

export default function PostPropertyTab() {
  const router = useRouter();
  const { requireAuth, isGuest } = useAuth();

  const handlePost = () => {
    if (isGuest) {
      router.push('/screens/auth' as any);
      return;
    }
    router.push('/landlord/add-property' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
      <LinearGradient
        colors={[Colors.primary, '#7C3AED']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroIcon}>
          <Text style={styles.heroEmoji}>🏡</Text>
        </View>
        <Text style={styles.heroTitle}>List Your Property</Text>
        <Text style={styles.heroSub}>
          Connect with thousands of verified renters across Kampala and beyond
        </Text>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Why list with Rentify?</Text>

        <View style={styles.perksGrid}>
          {PERKS.map(p => (
            <View key={p.text} style={styles.perkCard}>
              <View style={[styles.perkIconCircle, { backgroundColor: p.color + '18' }]}>
                <MaterialCommunityIcons name={p.icon as any} size={22} color={p.color} />
              </View>
              <Text style={styles.perkText}>{p.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statsRow}>
          {[
            { value: '2,400+', label: 'Active listings' },
            { value: '15K+', label: 'Monthly renters' },
            { value: '4.8★', label: 'Landlord rating' },
          ].map(s => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.ctaBtn} onPress={handlePost} activeOpacity={0.88}>
          <LinearGradient
            colors={[Colors.primary, '#7C3AED']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <MaterialCommunityIcons name="plus-circle" size={22} color={Colors.white} />
            <Text style={styles.ctaText}>Post a Property</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color={Colors.white} />
          </LinearGradient>
        </TouchableOpacity>

        {isGuest && (
          <Text style={styles.guestNote}>
            You'll need to sign in before posting.{' '}
            <Text
              style={{ color: Colors.primary, fontWeight: FontWeight.semibold }}
              onPress={() => router.push('/screens/auth' as any)}
            >
              Sign in →
            </Text>
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  hero: {
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing['2xl'],
    alignItems: 'center', gap: Spacing.sm,
  },
  heroIcon: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  heroEmoji: { fontSize: 34 },
  heroTitle: {
    fontSize: FontSize['2xl'], fontWeight: FontWeight.bold,
    color: Colors.white, textAlign: 'center',
  },
  heroSub: {
    fontSize: FontSize.base, color: 'rgba(255,255,255,0.82)',
    textAlign: 'center', lineHeight: 22,
  },
  body: {
    flex: 1, padding: Spacing.base, gap: Spacing.base,
  },
  sectionTitle: {
    fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text,
    marginTop: Spacing.sm,
  },
  perksGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
  },
  perkCard: {
    width: '47%', backgroundColor: Colors.surface,
    borderRadius: Radius.xl, padding: Spacing.md,
    gap: Spacing.sm, ...Shadow.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  perkIconCircle: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  perkText: {
    fontSize: FontSize.sm, color: Colors.text,
    fontWeight: FontWeight.medium, lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row', gap: Spacing.sm,
  },
  statItem: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.md, alignItems: 'center', gap: 2,
    ...Shadow.sm, borderWidth: 1, borderColor: Colors.border,
  },
  statValue: {
    fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary,
  },
  statLabel: { fontSize: FontSize.xs, color: Colors.muted, fontWeight: FontWeight.medium },
  ctaBtn: { borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.md },
  ctaGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: 16, paddingHorizontal: Spacing.xl,
  },
  ctaText: {
    fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white, flex: 1,
  },
  guestNote: {
    textAlign: 'center', fontSize: FontSize.sm, color: Colors.muted,
  },
});

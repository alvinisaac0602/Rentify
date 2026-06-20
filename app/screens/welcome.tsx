import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { useWelcomeModal } from '../../hooks/useWelcomeModal';

export default function WelcomeScreen() {
  const router = useRouter();
  const { dismiss } = useWelcomeModal();

  const handleExplore = () => {
    dismiss();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.inner}>
        <LinearGradient
          colors={[Colors.primary, '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconBg}
        >
          <Text style={styles.icon}>🏡🛏️🏪🏨</Text>
        </LinearGradient>

        <Text style={styles.title}>Welcome to Rentify</Text>
        <Text style={styles.subtitle}>Kampala's trusted space marketplace</Text>
        <Text style={styles.description}>
          Find verified places to live, work, shop, and stay — safely, quickly, and confidently.
        </Text>

        <View style={styles.features}>
          {[
            { emoji: '✅', text: 'Verified landlords & properties' },
            { emoji: '⚡', text: 'Book in under 2 taps' },
            { emoji: '🛡️', text: 'Trust score on every listing' },
          ].map(f => (
            <View key={f.text} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <Button
          label="Start Exploring"
          onPress={handleExplore}
          fullWidth
          style={{ marginBottom: Spacing.sm }}
        />
        <Button
          label="How it works"
          onPress={handleExplore}
          variant="outline"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  inner: {
    flex: 1, padding: Spacing.xl, alignItems: 'center',
    justifyContent: 'center',
  },
  iconBg: {
    width: 90, height: 90, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl,
  },
  icon: { fontSize: 30 },
  title: {
    fontSize: FontSize['3xl'] ?? 28, fontWeight: FontWeight.bold,
    color: Colors.text, textAlign: 'center', marginBottom: 6,
  },
  subtitle: {
    fontSize: FontSize.base, color: Colors.primary,
    fontWeight: FontWeight.semibold, textAlign: 'center', marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSize.base, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl,
  },
  features: { width: '100%', gap: Spacing.sm, marginBottom: Spacing.xl },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    ...Shadow.sm,
  },
  featureEmoji: { fontSize: 18 },
  featureText: { fontSize: FontSize.base, color: Colors.text, fontWeight: FontWeight.medium },
});

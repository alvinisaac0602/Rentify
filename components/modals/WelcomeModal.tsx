import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../ui/Button';

interface WelcomeModalProps {
  visible: boolean;
  onExplore: () => void;
  onHowItWorks: () => void;
}

export function WelcomeModal({ visible, onExplore, onHowItWorks }: WelcomeModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={[Colors.primary, '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconBg}
          >
            <Text style={styles.icon}>🏡🛏️🏪🏨</Text>
          </LinearGradient>

          <Text style={styles.title}>Welcome to Rentify</Text>
          <Text style={styles.subtitle}>
            Kampala's trusted space marketplace
          </Text>
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
            onPress={onExplore}
            fullWidth
            style={{ marginBottom: Spacing.sm }}
          />
          <Button
            label="How it works"
            onPress={onHowItWorks}
            variant="outline"
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius['2xl'],
    padding: Spacing.xl,
    width: '100%',
    alignItems: 'center',
    ...Shadow.lg,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  features: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
  },
  featureEmoji: {
    fontSize: 18,
  },
  featureText: {
    fontSize: FontSize.base,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
});

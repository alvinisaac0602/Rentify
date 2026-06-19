import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';

interface TrustMeterProps {
  score: number; // 0–100
  showBreakdown?: boolean;
}

const BREAKDOWN = [
  { label: 'Identity verified', threshold: 20 },
  { label: 'Property confirmed', threshold: 45 },
  { label: 'Positive reviews', threshold: 70 },
  { label: 'Response speed', threshold: 90 },
];

function getTrustColor(score: number) {
  if (score >= 85) return Colors.success;
  if (score >= 60) return Colors.trust;
  if (score >= 40) return Colors.warning;
  return Colors.danger;
}

function getTrustLabel(score: number) {
  if (score >= 85) return 'Highly Trusted';
  if (score >= 60) return 'Trusted';
  if (score >= 40) return 'Moderate';
  return 'Low Trust';
}

export function TrustMeter({ score, showBreakdown = true }: TrustMeterProps) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: score,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const color = getTrustColor(score);
  const label = getTrustLabel(score);
  const SIZE = 88;
  const STROKE = 8;

  return (
    <View style={styles.container}>
      {/* Circular Meter */}
      <View style={[styles.ring, { width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderColor: Colors.border }]}>
        <View style={[styles.innerRing, { borderColor: color, borderRadius: SIZE / 2 }]}>
          <Text style={[styles.scoreText, { color }]}>{score}</Text>
          <Text style={styles.outOf}>/ 100</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={[styles.label, { color }]}>{label}</Text>

        {showBreakdown && (
          <View style={styles.breakdown}>
            {BREAKDOWN.map((item) => {
              const unlocked = score >= item.threshold;
              return (
                <View key={item.label} style={styles.breakdownRow}>
                  <View style={[styles.dot, { backgroundColor: unlocked ? Colors.success : Colors.border }]} />
                  <Text style={[styles.breakdownLabel, { color: unlocked ? Colors.text : Colors.muted }]}>
                    {item.label}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  ring: {
    borderWidth: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    lineHeight: 28,
  },
  outOf: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    fontWeight: FontWeight.medium,
  },
  info: {
    flex: 1,
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  breakdown: {
    gap: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  breakdownLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});

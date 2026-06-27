import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';

interface TrustBadgeProps {
  type: 'verified_landlord' | 'verified_tenant' | 'verified_property' | 'top_rated' | 'unverified';
  size?: 'sm' | 'md';
}

export function TrustBadge({ type, size = 'md' }: TrustBadgeProps) {
  const config = {
    verified_landlord: {
      label: 'Verified Landlord',
      icon: 'shield-check' as const,
      bg: Colors.trustLight,
      color: Colors.trust,
    },
    verified_tenant: {
      label: 'Verified Tenant',
      icon: 'shield-check' as const,
      bg: Colors.trustLight,
      color: Colors.trust,
    },
    verified_property: {
      label: 'Verified Property',
      icon: 'check-decagram' as const,
      bg: Colors.successLight,
      color: Colors.success,
    },
    top_rated: {
      label: 'Top Rated',
      icon: 'star' as const,
      bg: Colors.warningLight,
      color: Colors.warning,
    },
    unverified: {
      label: 'Unverified',
      icon: 'alert-circle' as const,
      bg: Colors.dangerLight,
      color: Colors.danger,
    },
  }[type];

  const isSm = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <MaterialCommunityIcons
        name={config.icon}
        size={isSm ? 11 : 13}
        color={config.color}
      />
      <Text style={[styles.label, { color: config.color, fontSize: isSm ? FontSize.xs : FontSize.sm }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  label: {
    fontWeight: FontWeight.semibold,
  },
});

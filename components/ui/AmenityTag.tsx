import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';

interface AmenityTagProps {
  label: string;
}

const AMENITY_ICONS: Record<string, string> = {
  'WiFi': 'wifi',
  'Parking': 'car',
  'Generator': 'lightning-bolt',
  'Security': 'shield',
  'CCTV': 'cctv',
  'Gym': 'dumbbell',
  'Swimming Pool': 'pool',
  'Balcony': 'balcony',
  'Air Conditioning': 'air-conditioner',
  'Smart TV': 'television',
  'Kitchen': 'silverware-fork-knife',
  'Garden': 'flower',
  'Pool': 'pool',
  'Lake View': 'waves',
  'City View': 'city',
  'Rooftop Terrace': 'home-roof',
  'Daily Cleaning': 'broom',
  'Fiber Internet': 'ethernet-cable',
  'Meeting Rooms': 'door-closed',
  'Reception': 'desk',
  'Coffee': 'coffee',
  'Events': 'calendar-star',
  'Printing': 'printer',
  'Lounge': 'sofa',
  'Electricity': 'power-plug',
  'Water Access': 'water',
  'Water Tank': 'water',
  'Stockroom': 'archive',
  'Private Meeting Room': 'door-closed',
};

export function AmenityTag({ label }: AmenityTagProps) {
  const icon = AMENITY_ICONS[label] || 'check-circle';
  return (
    <View style={styles.tag}>
      <MaterialCommunityIcons name={icon as any} size={13} color={Colors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.sm,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
});

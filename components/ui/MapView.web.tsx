import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/colors';
import { Radius, Shadow } from '../../constants/theme';

interface MapProps {
  latitude?: number;
  longitude?: number;
  title?: string;
  locationName: string;
  style?: any;
}

export function MapView({ latitude = 0.3476, longitude = 32.5825, title, locationName, style }: MapProps) {
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.015}%2C${latitude - 0.01}%2C${longitude + 0.015}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <View style={[styles.container, style]}>
      {/* @ts-ignore - iframe is a valid web element but not in RN types */}
      <iframe
        src={osmUrl}
        style={{ width: '100%', height: '100%', border: 0 }}
        title={title || locationName || 'Property Location Map'}
        allowFullScreen
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceSecondary,
    ...Shadow.sm,
  },
});

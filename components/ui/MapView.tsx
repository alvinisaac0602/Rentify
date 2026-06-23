import React from 'react';
import { View, StyleSheet } from 'react-native';
import NativeMapView, { Marker as NativeMarker } from 'react-native-maps';
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
  return (
    <View style={[styles.container, style]}>
      <NativeMapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
        loadingEnabled
      >
        <NativeMarker
          coordinate={{ latitude, longitude }}
          title={title}
          description={locationName}
          pinColor={Colors.danger}
        />
      </NativeMapView>
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

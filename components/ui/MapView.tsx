import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';

interface MapProps {
  latitude?: number;
  longitude?: number;
  title?: string;
  locationName: string;
  style?: any;
}

export function MapView({ latitude = 0.3476, longitude = 32.5825, title, locationName, style }: MapProps) {
  
  const handleOpenMap = () => {
    // Generate universal mapping query links
    const label = title || 'Rentify Listing';
    const iosUrl = `maps:0,0?q=${encodeURIComponent(label)}@${latitude},${longitude}`;
    const androidUrl = `geo:0,0?q=${latitude},${longitude}(${encodeURIComponent(label)})`;
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    const url = Platform.select({
      ios: iosUrl,
      android: androidUrl,
      default: webUrl
    });

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(webUrl);
      }
    }).catch(() => {
      Linking.openURL(webUrl);
    });
  };

  return (
    <View style={[styles.container, style]}>
      {/* Premium Stylized Vector Map Background */}
      <View style={styles.mapDesign}>
        <LinearGradient
          colors={['#E0F2FE', '#F0FDFA']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {/* Stylized Grid Lines representing streets */}
        <View style={[styles.street, { top: '25%', left: 0, right: 0, height: 18, transform: [{ rotate: '-12deg' }] }]} />
        <View style={[styles.street, { top: '65%', left: 0, right: 0, height: 24, transform: [{ rotate: '8deg' }] }]} />
        <View style={[styles.street, { top: 0, bottom: 0, left: '30%', width: 20, transform: [{ rotate: '45deg' }] }]} />
        <View style={[styles.street, { top: 0, bottom: 0, left: '70%', width: 16, transform: [{ rotate: '-35deg' }] }]} />
        
        {/* Park Visual Indicator */}
        <LinearGradient
          colors={['#DCFCE7', '#BBF7D0']}
          style={styles.parkArea}
        />

        {/* Central Glowing Property Pin */}
        <View style={styles.markerContainer}>
          <View style={styles.pulseRing} />
          <View style={styles.markerIconBg}>
            <MaterialCommunityIcons name="home-map-marker" size={24} color={Colors.white} />
          </View>
        </View>
      </View>

      {/* Map Action Info Panel */}
      <View style={styles.infoPanel}>
        <View style={styles.addressInfo}>
          <Text style={styles.locationTitle} numberOfLines={1}>{title || 'Property Location'}</Text>
          <Text style={styles.locationSub} numberOfLines={1}>{locationName}</Text>
        </View>
        <TouchableOpacity 
          style={styles.mapBtn}
          onPress={handleOpenMap}
          activeOpacity={0.82}
        >
          <MaterialCommunityIcons name="directions" size={18} color={Colors.white} />
          <Text style={styles.mapBtnText}>Open Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  mapDesign: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  street: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 4,
  },
  parkArea: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    width: 60,
    height: 50,
    borderRadius: 30,
    opacity: 0.8,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary + '18',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  markerIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  infoPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  addressInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  locationTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  locationSub: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    ...Shadow.sm,
  },
  mapBtnText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
});

import React, { useState } from 'react';
import {
  TouchableOpacity, View, Text, Image, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, CategoryMeta, CategoryType } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Property, formatPrice } from '../../constants/mockData';
import { useAuth } from '../../context/AuthContext';

interface PropertyCardProps {
  property: Property;
  onSave?: () => void;
  isSaved?: boolean;
  horizontal?: boolean;
}

export function PropertyCard({ property, onSave, isSaved = false, horizontal = false }: PropertyCardProps) {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const meta = CategoryMeta[property.category as CategoryType];
  const [imgError, setImgError] = useState(false);

  const handleSave = (e: any) => {
    e.stopPropagation?.();
    if (!requireAuth('Sign in to save properties')) return;
    onSave?.();
  };

  if (horizontal) {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => router.push(`/property/${property.id}` as any)}
        style={[styles.hCard, Shadow.card]}
      >
        <Image
          source={{ uri: imgError ? 'https://picsum.photos/200/150' : property.images[0] }}
          style={styles.hImage}
          onError={() => setImgError(true)}
          resizeMode="cover"
        />
        {property.isVerified && (
          <View style={[styles.hVerifiedDot, { backgroundColor: meta.color }]} />
        )}
        <View style={styles.hContent}>
          <View style={styles.row}>
            <View style={[styles.catBadge, { backgroundColor: meta.lightColor }]}>
              <Text style={[styles.catBadgeText, { color: meta.color }]}>{meta.emoji} {meta.label}</Text>
            </View>
            {property.unitsLeft !== undefined && property.unitsLeft <= 3 && (
              <View style={[styles.catBadge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Text style={[styles.catBadgeText, { color: '#EF4444', fontWeight: 'bold' }]}>🔥 {property.unitsLeft} left</Text>
              </View>
            )}
          </View>
          <Text style={styles.hTitle} numberOfLines={2}>{property.title}</Text>
          <View style={styles.row}>
            <MaterialCommunityIcons name="map-marker" size={12} color={Colors.muted} />
            <Text style={styles.location} numberOfLines={1}>{property.location}</Text>
          </View>
          <View style={styles.hFooter}>
            <Text style={[styles.price, { color: meta.color }]}>
              {formatPrice(property.price, property.currency, property.pricePeriod)}
            </Text>
            <View style={styles.row}>
              <MaterialCommunityIcons name="star" size={12} color={Colors.warning} />
              <Text style={styles.rating}>{property.rating}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push(`/property/${property.id}` as any)}
      style={[styles.card, Shadow.card]}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imgError ? 'https://picsum.photos/400/300' : property.images[0] }}
          style={styles.image}
          onError={() => setImgError(true)}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.25)']}
          style={styles.imageGradient}
        />

        {/* Category badge */}
        <View style={[styles.catBadgeOverlay, { backgroundColor: meta.color }]}>
          <Text style={styles.catBadgeOverlayText}>{meta.emoji} {meta.label}</Text>
        </View>

        {/* Verified badge */}
        {property.isVerified && (
          <View style={styles.verifiedOverlay}>
            <MaterialCommunityIcons name="shield-check" size={12} color={Colors.white} />
            <Text style={styles.verifiedOverlayText}>Verified</Text>
          </View>
        )}

        {/* Featured badge */}
        {property.featuredUntil && property.featuredUntil > new Date().toISOString() && (
          <View style={styles.featuredOverlay}>
            <MaterialCommunityIcons name="star-circle" size={10} color="#F59E0B" />
            <Text style={styles.featuredOverlayText}>Featured</Text>
          </View>
        )}

        {/* Units Left overlay */}
        {property.unitsLeft !== undefined && property.unitsLeft <= 3 && (
          <View style={styles.unitsLeftOverlay}>
            <MaterialCommunityIcons name="clock-alert-outline" size={10} color={Colors.white} />
            <Text style={styles.unitsLeftText}>{property.unitsLeft} left!</Text>
          </View>
        )}

        {/* Save button */}
        <TouchableOpacity
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={20}
            color={isSaved ? Colors.danger : Colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{property.title}</Text>
        <View style={styles.row}>
          <MaterialCommunityIcons name="map-marker" size={13} color={Colors.muted} />
          <Text style={styles.location} numberOfLines={1}>{property.location}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={[styles.price, { color: meta.color }]}>
            {formatPrice(property.price, property.currency, property.pricePeriod)}
          </Text>
          <View style={styles.row}>
            <MaterialCommunityIcons name="star" size={13} color={Colors.warning} />
            <Text style={styles.rating}>{property.rating}</Text>
            <Text style={styles.reviewCount}>({property.reviewCount})</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 185,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  catBadgeOverlay: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  catBadgeOverlayText: {
    fontSize: FontSize.xs,
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
  featuredOverlay: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.92)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.full,
    zIndex: 10,
  },
  featuredOverlayText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  verifiedOverlay: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(14, 165, 233, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  verifiedOverlayText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
  saveBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.md,
    gap: 5,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    lineHeight: 21,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  price: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  rating: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  reviewCount: {
    fontSize: FontSize.sm,
    color: Colors.muted,
  },
  // Horizontal variant
  hCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    height: 100,
  },
  hImage: {
    width: 100,
    height: '100%',
  },
  hVerifiedDot: {
    position: 'absolute',
    left: 88,
    top: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  hContent: {
    flex: 1,
    padding: Spacing.sm + 2,
    justifyContent: 'center',
    gap: 4,
  },
  catBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
  },
  hTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    lineHeight: 18,
  },
  hFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unitsLeftOverlay: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  unitsLeftText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
});

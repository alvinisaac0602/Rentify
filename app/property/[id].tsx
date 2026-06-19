import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PagerView from 'react-native-pager-view';
import { Colors, CategoryMeta, CategoryType } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { MOCK_PROPERTIES, MOCK_LANDLORDS, formatPrice } from '../../constants/mockData';
import { TrustBadge } from '../../components/ui/TrustBadge';
import { TrustMeter } from '../../components/ui/TrustMeter';
import { AmenityTag } from '../../components/ui/AmenityTag';
import { Button } from '../../components/ui/Button';
import { ViewingRequestModal } from '../../components/modals/ViewingRequestModal';
import { AirbnbBookingModal } from '../../components/modals/AirbnbBookingModal';
import { FraudWarningModal } from '../../components/modals/FraudWarningModal';
import { SavedModal } from '../../components/modals/SavedModal';
import { BookingSuccessModal } from '../../components/modals/BookingSuccessModal';
import { MovingServiceModal } from '../../components/modals/MovingServiceModal';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { requireAuth } = useAuth();

  const property = MOCK_PROPERTIES.find(p => p.id === id);
  const landlord = MOCK_LANDLORDS.find(l => l.id === property?.landlordId);

  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showViewing, setShowViewing] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showFraud, setShowFraud] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMoving, setShowMoving] = useState(false);

  if (!property || !landlord) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Property not found</Text>
      </View>
    );
  }

  const meta = CategoryMeta[property.category as CategoryType];

  const handleSave = () => {
    if (!requireAuth('Sign in to save properties')) return;
    setIsSaved(v => !v);
    if (!isSaved) setShowSaved(true);
  };

  const handleViewingRequest = () => {
    if (!property.isVerified) { setShowFraud(true); return; }
    if (!requireAuth('Sign in to request a viewing')) return;
    setShowViewing(true);
  };

  const handleChat = () => {
    if (!requireAuth('Sign in to message the owner')) return;
    router.push(`/messages/${landlord.id}` as any);
  };

  const handleBook = () => {
    if (!requireAuth('Sign in to book this space')) return;
    setShowBooking(true);
  };

  const handleBookingConfirmed = () => {
    setShowBooking(false);
    setShowSuccess(true);
  };

  const handleSuccessMessages = () => {
    setShowSuccess(false);
    router.push('/messages' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ─── Image Carousel ──────────────────────── */}
        <View style={styles.carouselContainer}>
          <PagerView
            style={styles.pager}
            initialPage={0}
            onPageSelected={e => setActiveImage(e.nativeEvent.position)}
          >
            {property.images.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.carouselImage} />
            ))}
          </PagerView>

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.white} />
          </TouchableOpacity>

          {/* Save button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <MaterialCommunityIcons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={22}
              color={isSaved ? Colors.danger : Colors.white}
            />
          </TouchableOpacity>

          {/* Dot indicators */}
          <View style={styles.dotsRow}>
            {property.images.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeImage && styles.dotActive]} />
            ))}
          </View>

          {/* Category + Verified overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.45)']}
            style={styles.imageGradient}
          />
          <View style={styles.imageOverlay}>
            <View style={[styles.catBadge, { backgroundColor: meta.color }]}>
              <Text style={styles.catBadgeText}>{meta.emoji} {meta.label}</Text>
            </View>
            {property.isVerified && (
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons name="shield-check" size={12} color={Colors.white} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.body}>
          {/* ─── Title + Price ───────────────────────── */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{property.title}</Text>
            <Text style={[styles.price, { color: meta.color }]}>
              {formatPrice(property.price, property.currency, property.pricePeriod)}
            </Text>
          </View>

          {/* Rating + Location */}
          <View style={styles.infoRow}>
            <View style={styles.ratingRow}>
              <MaterialCommunityIcons name="star" size={15} color={Colors.warning} />
              <Text style={styles.rating}>{property.rating}</Text>
              <Text style={styles.reviewCount}>({property.reviewCount} reviews)</Text>
            </View>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={14} color={Colors.muted} />
              <Text style={styles.location}>{property.location}</Text>
            </View>
          </View>

          {/* Quick facts */}
          {(property.bedrooms || property.size) && (
            <View style={styles.factsRow}>
              {property.bedrooms && (
                <View style={styles.factChip}>
                  <MaterialCommunityIcons name="bed" size={16} color={Colors.primary} />
                  <Text style={styles.factText}>{property.bedrooms} Bed</Text>
                </View>
              )}
              {property.bathrooms && (
                <View style={styles.factChip}>
                  <MaterialCommunityIcons name="shower" size={16} color={Colors.primary} />
                  <Text style={styles.factText}>{property.bathrooms} Bath</Text>
                </View>
              )}
              {property.size && (
                <View style={styles.factChip}>
                  <MaterialCommunityIcons name="ruler-square" size={16} color={Colors.primary} />
                  <Text style={styles.factText}>{property.size} m²</Text>
                </View>
              )}
              <View style={styles.factChip}>
                <MaterialCommunityIcons name="sofa" size={16} color={Colors.primary} />
                <Text style={styles.factText}>{property.isFurnished ? 'Furnished' : 'Unfurnished'}</Text>
              </View>
            </View>
          )}

          {/* ─── Description ─────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this space</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>

          {/* ─── Amenities ───────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {property.amenities.map(a => <AmenityTag key={a} label={a} />)}
            </View>
          </View>

          {/* ─── Map Preview ─────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapPreview}>
              <Image
                source={{ uri: `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/32.5825,0.3476,13,0/350x160?access_token=pk.placeholder` }}
                style={styles.mapImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(248,250,252,0.8)']}
                style={styles.mapGradient}
              />
              <View style={styles.mapOverlay}>
                <MaterialCommunityIcons name="map-marker" size={20} color={Colors.danger} />
                <Text style={styles.mapLocation}>{property.location}</Text>
              </View>
            </View>
          </View>

          {/* ─── Trust UI ────────────────────────────── */}
          <View style={[styles.section, styles.trustSection]}>
            <Text style={styles.sectionTitle}>Trust & Safety</Text>
            <View style={styles.trustBadges}>
              {landlord.isVerified && <TrustBadge type="verified_landlord" />}
              {property.isVerified
                ? <TrustBadge type="verified_property" />
                : <TrustBadge type="unverified" />
              }
              {property.rating >= 4.5 && <TrustBadge type="top_rated" />}
            </View>
            <TrustMeter score={property.trustScore} />
          </View>

          {/* ─── Landlord Card ───────────────────────── */}
          <View style={[styles.section, styles.landlordCard]}>
            <Image source={{ uri: landlord.avatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <View style={styles.landlordNameRow}>
                <Text style={styles.landlordName}>{landlord.name}</Text>
                {landlord.isVerified && (
                  <MaterialCommunityIcons name="shield-check" size={16} color={Colors.trust} />
                )}
              </View>
              <Text style={styles.landlordMeta}>
                {landlord.properties} listings · Joined {landlord.joinedDate}
              </Text>
              <View style={styles.responseRow}>
                <MaterialCommunityIcons name="clock-outline" size={13} color={Colors.muted} />
                <Text style={styles.responseText}>Responds {landlord.responseTime}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.chatIconBtn} onPress={handleChat}>
              <MaterialCommunityIcons name="message-text" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* ─── Fraud Warning for unverified ────────── */}
          {!property.isVerified && (
            <TouchableOpacity style={styles.fraudBanner} onPress={() => setShowFraud(true)}>
              <MaterialCommunityIcons name="alert-circle" size={18} color={Colors.warning} />
              <Text style={styles.fraudText}>
                ⚠️ This listing is not fully verified. Tap to learn more.
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ─── Sticky Action Bar ───────────────────────── */}
      <View style={styles.actionBar}>
        <Button
          label="Request Viewing"
          onPress={handleViewingRequest}
          variant="outline"
          style={{ flex: 1 }}
        />
        <Button
          label="Chat Owner"
          onPress={handleChat}
          variant="ghost"
          style={{ flex: 1 }}
          leftIcon={<MaterialCommunityIcons name="message-text" size={16} color={Colors.primary} />}
        />
        {property.category === 'airbnb' ? (
          <Button label="Book Now" onPress={handleBook} variant="success" style={{ flex: 1 }} />
        ) : (
          <Button label="🚚 Moving" onPress={() => setShowMoving(true)} variant="ghost" style={{ flex: 1 }} />
        )}
      </View>

      {/* ─── Modals ──────────────────────────────────── */}
      <ViewingRequestModal
        visible={showViewing}
        onClose={() => setShowViewing(false)}
        onSent={() => { setShowViewing(false); setShowMoving(true); }}
        propertyTitle={property.title}
      />
      <AirbnbBookingModal
        visible={showBooking}
        onClose={() => setShowBooking(false)}
        onConfirm={handleBookingConfirmed}
        propertyTitle={property.title}
        price={formatPrice(property.price, property.currency, property.pricePeriod)}
      />
      <FraudWarningModal
        visible={showFraud}
        onClose={() => setShowFraud(false)}
        onReport={() => setShowFraud(false)}
        onContinue={() => setShowFraud(false)}
      />
      <SavedModal visible={showSaved} onClose={() => setShowSaved(false)} />
      <BookingSuccessModal
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
        onViewMessages={handleSuccessMessages}
      />
      <MovingServiceModal
        visible={showMoving}
        onClose={() => setShowMoving(false)}
        onBook={mover => {
          setShowMoving(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: FontSize.lg, color: Colors.muted },
  carouselContainer: { height: 300, position: 'relative' },
  pager: { height: 300 },
  carouselImage: { width: '100%', height: 300 },
  backBtn: {
    position: 'absolute', top: 48, left: Spacing.base,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center',
  },
  saveBtn: {
    position: 'absolute', top: 48, right: Spacing.base,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center',
  },
  dotsRow: {
    position: 'absolute', bottom: Spacing.md,
    flexDirection: 'row', alignSelf: 'center', gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { width: 18, backgroundColor: Colors.white },
  imageGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  imageOverlay: {
    position: 'absolute', bottom: Spacing.md + 18, left: Spacing.md,
    flexDirection: 'row', gap: Spacing.sm,
  },
  catBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
  catBadgeText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: FontWeight.semibold },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(14,165,233,0.85)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full,
  },
  verifiedText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: FontWeight.semibold },
  body: { padding: Spacing.base, gap: Spacing.md, paddingBottom: 100 },
  titleRow: { gap: 6 },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text, lineHeight: 30 },
  price: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  reviewCount: { fontSize: FontSize.sm, color: Colors.muted },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { fontSize: FontSize.sm, color: Colors.muted },
  factsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  factChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    backgroundColor: Colors.primaryLight, borderRadius: Radius.full,
  },
  factText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  description: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 24 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  mapPreview: {
    height: 160, borderRadius: Radius.xl, overflow: 'hidden',
    backgroundColor: Colors.surfaceSecondary, ...Shadow.sm,
  },
  mapImage: { width: '100%', height: '100%' },
  mapGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  mapOverlay: {
    position: 'absolute', bottom: Spacing.md, left: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.white, paddingHorizontal: Spacing.md,
    paddingVertical: 7, borderRadius: Radius.full, ...Shadow.sm,
  },
  mapLocation: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  trustSection: {
    backgroundColor: Colors.surface, padding: Spacing.base,
    borderRadius: Radius.xl, ...Shadow.sm,
  },
  trustBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  landlordCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: Radius.xl, ...Shadow.sm,
  },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  landlordNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  landlordName: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  landlordMeta: { fontSize: FontSize.sm, color: Colors.muted, marginBottom: 4 },
  responseRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  responseText: { fontSize: FontSize.sm, color: Colors.muted },
  chatIconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  fraudBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.warningLight, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.warning + '40',
  },
  fraudText: { fontSize: FontSize.sm, color: Colors.text, flex: 1 },
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: Spacing.sm,
    padding: Spacing.md, backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 12,
  },
});

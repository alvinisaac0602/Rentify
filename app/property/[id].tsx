import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Dimensions, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import PagerView from '../../components/ui/PagerView';
import { Colors, CategoryMeta, CategoryType } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Property, Landlord, formatPrice } from '../../constants/mockData';
import { TrustBadge } from '../../components/ui/TrustBadge';
import { TrustMeter } from '../../components/ui/TrustMeter';
import { AmenityTag } from '../../components/ui/AmenityTag';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { MapView } from '../../components/ui/MapView';
import { Avatar } from '../../components/ui/Avatar';

const { width } = Dimensions.get('window');

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, requireAuth } = useAuth();
  const insets = useSafeAreaInsets();

  const [property, setProperty] = useState<Property | null>(null);
  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (!id) return;
      setLoading(true);

      const checkSavedStatus = async () => {
        try {
          const stored = await AsyncStorage.getItem('saved_property_ids');
          if (stored) {
            const ids = JSON.parse(stored);
            if (Array.isArray(ids) && ids.includes(id)) {
              setIsSaved(true);
            }
          }
        } catch (e) {
          console.log('Error checking saved status:', e);
        }
      };
      checkSavedStatus();

      const { onSnapshot, doc } = require('firebase/firestore');
      const { db } = require('../../config/firebase');
      const docRef = doc(db, 'properties', id);

      let unsubscribeUser: (() => void) | undefined;

      const unsubscribeProp = onSnapshot(docRef, (docSnap: any) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const propData = {
            id: docSnap.id,
            title: data.title || '',
            description: data.description || '',
            price: data.price || 0,
            currency: data.currency || 'UGX',
            pricePeriod: data.pricePeriod || 'month',
            location: data.location || '',
            category: data.category || 'apartment',
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
            isFurnished: !!data.isFurnished,
            images: Array.isArray(data.images) && data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'],
            landlordId: data.landlordId || '',
            isVerified: !!data.isVerified,
            rating: data.rating || 0,
            reviewCount: data.reviewCount || 0,
            trustScore: data.trustScore || 85,
            amenities: Array.isArray(data.amenities) ? data.amenities : [],
            latitude: data.latitude || undefined,
            longitude: data.longitude || undefined,
            createdAt: data.createdAt || new Date().toISOString(),
          } as any;
          setProperty(propData);
          setLoading(false);

          // Prefetch images immediately for instant transition
          if (Array.isArray(propData.images)) {
            propData.images.forEach((img: string) => {
              if (img) Image.prefetch(img).catch(() => {});
            });
          }

          if (unsubscribeUser) unsubscribeUser();

          const userRef = doc(db, 'users', propData.landlordId);
          const getJoinedDate = (created: any) => {
            if (!created) return 'June 2026';
            const date = new Date(created.seconds ? created.seconds * 1000 : created);
            return date.toLocaleString('default', { month: 'long', year: 'numeric' });
          };

          unsubscribeUser = onSnapshot(userRef, (userSnap: any) => {
            if (userSnap.exists()) {
              const userData = userSnap.data();
              setLandlord({
                id: propData.landlordId,
                name: userData.displayName || userData.name || 'Landlord',
                avatar: userData.avatarUrl || userData.avatar || '',
                isVerified: !!userData.isVerified,
                rating: userData.rating || 0,
                responseTime: userData.responseTime || 'typical',
                properties: userData.propertiesCount || 0,
                joinedDate: getJoinedDate(userData.createdAt),
                phone: userData.phoneNumber || userData.phone || '',
                trustScore: userData.trustScore || (userData.isVerified ? 90 : 60),
              });
            } else {
              setLandlord({
                id: propData.landlordId,
                name: 'Rentify Member',
                avatar: '',
                isVerified: false,
                rating: 0,
                responseTime: 'typical',
                properties: 0,
                joinedDate: 'Joined recently',
                phone: '',
                trustScore: 60,
              });
            }
          });
        } else {
          setLoading(false);
        }
      }, (err: any) => {
        console.error('Error listening to property detail:', err);
        setLoading(false);
      });

      return () => {
        unsubscribeProp();
        if (unsubscribeUser) unsubscribeUser();
      };
    }, [id])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg }}>
        {/* Top skeleton image block */}
        <View style={styles.skeletonImage} />
        {/* Bottom content skeleton */}
        <ScrollView style={{ flex: 1, padding: Spacing.base }} scrollEnabled={false}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonSubtitle} />
          
          {/* Quick specs chips */}
          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginVertical: Spacing.md }}>
            <View style={styles.skeletonChip} />
            <View style={styles.skeletonChip} />
            <View style={styles.skeletonChip} />
          </View>

          {/* Description paragraphs */}
          <View style={[styles.skeletonLine, { width: '90%', marginTop: Spacing.sm }]} />
          <View style={[styles.skeletonLine, { width: '95%' }]} />
          <View style={[styles.skeletonLine, { width: '85%' }]} />
          <View style={[styles.skeletonLine, { width: '40%', marginBottom: Spacing.lg }]} />

          {/* Map placeholder */}
          <View style={styles.skeletonMap} />
        </ScrollView>
      </View>
    );
  }

  if (!property || !landlord) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Property not found</Text>
      </View>
    );
  }

  const meta = CategoryMeta[property.category as CategoryType];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/' as any);
    }
  };

  const handleSave = async () => {
    if (!requireAuth('Sign in to save properties')) return;
    try {
      const stored = await AsyncStorage.getItem('saved_property_ids');
      let ids: string[] = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(ids)) ids = [];

      if (isSaved) {
        ids = ids.filter(x => x !== id);
        setIsSaved(false);
      } else {
        if (!ids.includes(id as string)) {
          ids.push(id as string);
        }
        setIsSaved(true);
        router.push('/screens/saved-confirm' as any);
      }
      await AsyncStorage.setItem('saved_property_ids', JSON.stringify(ids));
    } catch (e) {
      console.log('Error saving property:', e);
    }
  };

  const handleViewingRequest = () => {
    if (!property.isVerified) {
      router.push({
        pathname: '/screens/fraud-warning' as any,
        params: {
          propertyId: id,
          propertyTitle: property.title,
          landlordId: landlord.id,
        }
      });
      return;
    }
    if (!requireAuth('Sign in to request a viewing')) return;
    router.push(`/screens/viewing-request?propertyId=${id}&propertyTitle=${encodeURIComponent(property.title)}&landlordId=${landlord.id}` as any);
  };

  const handleChat = () => {
    if (!requireAuth('Sign in to message the owner')) return;
    router.push(`/messages/${landlord.id}?propertyId=${id}&propertyTitle=${encodeURIComponent(property.title)}` as any);
  };

  const handleBook = () => {
    if (!requireAuth('Sign in to book this space')) return;
    router.push(`/screens/booking?propertyTitle=${encodeURIComponent(property.title)}&price=${encodeURIComponent(formatPrice(property.price, property.currency, property.pricePeriod))}` as any);
  };

  const showReportSubmitted = async (reason: string) => {
    try {
      const { addDoc, collection } = require('firebase/firestore');
      const { db } = require('../../config/firebase');
      await addDoc(collection(db, 'reports'), {
        propertyId: id,
        propertyTitle: property.title,
        landlordId: landlord.id,
        reporterId: user?.id || 'anonymous',
        reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      Alert.alert(
        "Report Submitted",
        "Thank you for flagging this listing. Our moderation team will investigate this property and take action within 24 hours."
      );
    } catch (e) {
      Alert.alert("Error", "Could not submit report. Please try again.");
    }
  };

  const handleReportListing = () => {
    Alert.alert(
      "Report Listing",
      "Please select a reason for reporting this listing:",
      [
        { text: "Spam or Duplicate", onPress: () => showReportSubmitted("Spam or Duplicate") },
        { text: "Fraudulent or Scam", onPress: () => showReportSubmitted("Fraudulent or Scam") },
        { text: "Inappropriate Content", onPress: () => showReportSubmitted("Inappropriate Content") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleBlockLandlord = () => {
    Alert.alert(
      "Block Owner",
      `Are you sure you want to block ${landlord.name}? You will no longer see properties listed by them.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Block", 
          style: "destructive", 
          onPress: async () => {
            try {
              const { addDoc, collection } = require('firebase/firestore');
              const { db } = require('../../config/firebase');
              await addDoc(collection(db, 'blocks'), {
                userId: user?.id || 'anonymous',
                blockedUserId: landlord.id,
                blockedUserName: landlord.name,
                createdAt: new Date().toISOString(),
              });
              Alert.alert("Landlord Blocked", `${landlord.name} has been blocked.`);
              router.back();
            } catch (e) {
              Alert.alert("Error", "Could not block landlord. Please try again.");
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar barStyle="light-content" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
      >
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

          {/* Dot indicators */}
          <View style={styles.dotsRow}>
            {property.images.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeImage && styles.dotActive]} />
            ))}
          </View>

          {/* Back button */}
          <TouchableOpacity 
            style={[styles.backBtn, { top: Math.max(insets.top, 16) + 8 }]} 
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.white} />
          </TouchableOpacity>

          {/* Save button */}
          <TouchableOpacity 
            style={[styles.saveBtn, { top: Math.max(insets.top, 16) + 8 }]} 
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={22}
              color={isSaved ? Colors.danger : Colors.white}
            />
          </TouchableOpacity>
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
            {property.reviewCount !== undefined && property.reviewCount > 0 ? (
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={15} color={Colors.warning} />
                <Text style={styles.rating}>{property.rating}</Text>
                <Text style={styles.reviewCount}>({property.reviewCount} reviews)</Text>
              </View>
            ) : null}
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={14} color={Colors.muted} />
              <Text style={styles.location}>{property.location}</Text>
            </View>
          </View>

          {/* Quick facts */}
          {(property.bedrooms || property.size || property.unitsLeft !== undefined) && (
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
              {property.unitsLeft !== undefined && (
                <View style={[styles.factChip, property.unitsLeft <= 3 && { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <MaterialCommunityIcons 
                    name={property.unitsLeft <= 3 ? "home-alert" : "home-circle"} 
                    size={16} 
                    color={property.unitsLeft <= 3 ? '#EF4444' : Colors.primary} 
                  />
                  <Text style={[styles.factText, property.unitsLeft <= 3 && { color: '#EF4444', fontWeight: 'bold' }]}>
                    {property.unitsLeft} {property.unitsLeft === 1 ? 'unit' : 'units'} left
                  </Text>
                </View>
              )}
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
            <MapView
              latitude={property.latitude ?? (0.3476 + ((parseInt(property.id.replace(/\D/g, '') || '0', 10) % 10) * 0.002 - 0.01))}
              longitude={property.longitude ?? (32.5825 + ((parseInt(property.id.replace(/\D/g, '') || '0', 10) % 10) * 0.003 - 0.015))}
              title={property.title}
              locationName={property.location}
            />
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
            <TouchableOpacity style={styles.reportRow} onPress={handleReportListing} activeOpacity={0.7}>
              <MaterialCommunityIcons name="flag-outline" size={16} color={Colors.danger} />
              <Text style={styles.reportText}>Report this listing</Text>
            </TouchableOpacity>
          </View>

          {/* ─── Landlord Card ───────────────────────── */}
          <View style={[styles.section, styles.landlordCard]}>
            <Avatar name={landlord.name} uri={landlord.avatar} size={52} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <View style={styles.landlordNameRow}>
                <Text style={styles.landlordName}>{landlord.name}</Text>
                {landlord.isVerified && (
                  <MaterialCommunityIcons name="shield-check" size={16} color={Colors.trust} />
                )}
              </View>
              <Text style={styles.landlordMeta}>
                {landlord.properties} {landlord.properties === 1 ? 'listing' : 'listings'} · {landlord.joinedDate}
              </Text>
              <View style={styles.responseRow}>
                <MaterialCommunityIcons name="clock-outline" size={13} color={Colors.muted} />
                <Text style={styles.responseText}>Responds {landlord.responseTime}</Text>
              </View>
              {!!landlord.phone && (
                <TouchableOpacity 
                  style={[styles.responseRow, { marginTop: 4 }]} 
                  onPress={() => {
                    const { Linking } = require('react-native');
                    Linking.openURL(`tel:${landlord.phone}`).catch(() => {
                      Alert.alert('Error', 'Unable to open phone call screen');
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="phone-outline" size={13} color={Colors.primary} />
                  <Text style={[styles.responseText, { color: Colors.primary, fontWeight: 'bold' }]}>
                    {landlord.phone}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={{ gap: Spacing.sm, alignItems: 'center' }}>
              <TouchableOpacity style={styles.chatIconBtn} onPress={handleChat}>
                <MaterialCommunityIcons name="message-text" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.blockIconBtn} onPress={handleBlockLandlord}>
                <MaterialCommunityIcons name="account-cancel-outline" size={20} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── Fraud Warning for unverified ────────── */}
          {!property.isVerified && (
            <TouchableOpacity 
              style={styles.fraudBanner} 
              onPress={() => router.push({
                pathname: '/screens/fraud-warning' as any,
                params: {
                  propertyId: id,
                  propertyTitle: property.title,
                  landlordId: landlord.id,
                }
              })}
            >
              <MaterialCommunityIcons name="alert-circle" size={18} color={Colors.warning} />
              <Text style={styles.fraudText}>
                ⚠️ This listing is not fully verified. Tap to learn more.
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ─── Sticky Action Bar ───────────────────────── */}
      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, Spacing.xs), paddingTop: Spacing.sm }]}>
        <TouchableOpacity style={styles.actionTab} onPress={handleChat} activeOpacity={0.7}>
          <View style={styles.actionIconCircle}>
            <MaterialCommunityIcons name="message-text-outline" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.actionTabText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionTab} onPress={handleViewingRequest} activeOpacity={0.7}>
          <View style={styles.actionIconCircle}>
            <MaterialCommunityIcons name="calendar-clock" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.actionTabText}>Schedule</Text>
        </TouchableOpacity>

        {property.category === 'airbnb' || property.category === 'hostel' ? (
          <TouchableOpacity style={styles.actionTab} onPress={handleBook} activeOpacity={0.7}>
            <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
              <MaterialCommunityIcons name="lightning-bolt" size={24} color={Colors.success} />
            </View>
            <Text style={[styles.actionTabText, { color: Colors.success }]}>Book Stay</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionTab} onPress={() => router.push('/screens/movers' as any)} activeOpacity={0.7}>
            <View style={styles.actionIconCircle}>
              <MaterialCommunityIcons name="truck-delivery-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.actionTabText}>Find Movers</Text>
          </TouchableOpacity>
        )}
      </View>
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
    zIndex: 10, elevation: 10,
  },
  saveBtn: {
    position: 'absolute', top: 48, right: Spacing.base,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center',
    zIndex: 10, elevation: 10,
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
  reportRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: Spacing.md, paddingTop: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  reportText: {
    fontSize: FontSize.sm, color: Colors.danger, fontWeight: FontWeight.semibold,
  },
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
  blockIconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center',
  },
  fraudBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.warningLight, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.warning + '40',
  },
  fraudText: { fontSize: FontSize.sm, color: Colors.text, flex: 1 },
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 16,
  },
  actionTab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionTabText: {
    fontSize: FontSize.xs - 1,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    textAlign: 'center',
  },
  skeletonImage: {
    height: width * 0.65,
    backgroundColor: '#F1F5F9',
  },
  skeletonTitle: {
    height: 28,
    width: '70%',
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.md,
    marginTop: Spacing.md,
  },
  skeletonSubtitle: {
    height: 18,
    width: '45%',
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  skeletonChip: {
    height: 32,
    width: 80,
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.full,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.sm,
    marginVertical: 6,
  },
  skeletonMap: {
    height: 180,
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.xl,
    marginTop: Spacing.md,
  },
});

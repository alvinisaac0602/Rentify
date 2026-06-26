import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Alert, Image, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, CategoryMeta, CategoryType } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { ListingReviewModal } from '../../components/modals/ListingReviewModal';
import { useAuth } from '../../context/AuthContext';
import { createProperty, uploadPropertyImage } from '../../services/firebaseServices';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const STEPS = [
  { num: 1, label: 'Category', icon: 'shape' },
  { num: 2, label: 'Basic Info', icon: 'text-box' },
  { num: 3, label: 'Photos', icon: 'camera' },
  { num: 4, label: 'Location', icon: 'map-marker' },
  { num: 5, label: 'Price', icon: 'cash' },
];

const CATEGORIES: CategoryType[] = ['apartment', 'hostel', 'shop', 'airbnb'];
const PERIODS = ['month', 'day', 'week', 'year'];

const formatNumberWithCommas = (text: string) => {
  const cleanNumber = text.replace(/[^0-9]/g, '');
  if (!cleanNumber) return '';
  return Number(cleanNumber).toLocaleString('en-US');
};

export default function AddPropertyScreen() {
  const router = useRouter();
  const { user } = useAuth() || {};
  const [step, setStep] = useState(1);
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [furnished, setFurnished] = useState(false);
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('');
  const [division, setDivision] = useState('');
  const [landmark, setLandmark] = useState('');
  const [locating, setLocating] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [price, setPrice] = useState('');
  const [period, setPeriod] = useState('month');
  const [photos, setPhotos] = useState<string[]>([]);

  const handleSelectPhoto = async (index: number) => {
    Alert.alert(
      'Add Photo',
      'Select a source for your photo',
      [
        {
          text: 'Take Photo 📸',
          onPress: () => pickImage(index, 'camera'),
        },
        {
          text: 'Choose from Gallery 🖼️',
          onPress: () => pickImage(index, 'library'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const pickImage = async (index: number, source: 'camera' | 'library') => {
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your camera to take pictures.');
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your photos to upload pictures.');
        return;
      }
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    };

    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      setPhotos(prev => {
        const next = [...prev];
        next[index] = uri;
        return next;
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleGetCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access location was denied.');
      return;
    }

    setLocating(true);
    let resolvedCoords: { latitude: number; longitude: number } | null = null;
    try {
      // 1. Try to get last known location first (resolves instantly)
      let currentLoc = await Location.getLastKnownPositionAsync({});
      
      // 2. Fallback to current position lookup with balanced high-speed accuracy
      if (!currentLoc) {
        currentLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
      }
      
      if (currentLoc) {
        resolvedCoords = {
          latitude: currentLoc.coords.latitude,
          longitude: currentLoc.coords.longitude,
        };
        setLatitude(resolvedCoords.latitude);
        setLongitude(resolvedCoords.longitude);
      }
    } catch (coordsError) {
      console.log('Failed to fetch coords:', coordsError);
    }

    // If coordinates fetch failed completely, use default fallback coords
    if (!resolvedCoords) {
      const fallbackLat = 0.3476;
      const fallbackLng = 32.5825;
      resolvedCoords = { latitude: fallbackLat, longitude: fallbackLng };
      setLatitude(fallbackLat);
      setLongitude(fallbackLng);
    }

    // Now try reverse geocoding with a timeout
    try {
      const geocodePromise = Location.reverseGeocodeAsync(resolvedCoords);
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );

      const addressResponse = await Promise.race([geocodePromise, timeoutPromise]);
      if (addressResponse && addressResponse.length > 0) {
        const addr = addressResponse[0];
        const streetName = addr.street || addr.name || '';
        const subregion = addr.subregion || addr.district || '';
        const city = addr.city || addr.region || '';
        
        const fullAddr = [streetName, subregion].filter(Boolean).join(', ');
        
        setLocation(fullAddr || 'Near Current Location');
        setDistrict(city || '');
        if (subregion) {
          setDivision(subregion);
        }
      } else {
        setLocation(`Latitude: ${resolvedCoords.latitude.toFixed(6)}, Longitude: ${resolvedCoords.longitude.toFixed(6)}`);
      }
    } catch (geocodeError) {
      console.log('Geocoding failed/timed out, setting default fields:', geocodeError);
      
      // If coordinates are Kampala default, set text defaults. Otherwise keep location coordinates format.
      if (resolvedCoords.latitude === 0.3476 && resolvedCoords.longitude === 32.5825) {
        setLocation('Kampala Center');
        setDistrict('Kampala');
        setDivision('Central Division');
        Alert.alert(
          'Location Status',
          'GPS signal timed out. Filled with city center default values. Feel free to edit manually.',
          [{ text: 'OK' }]
        );
      } else {
        setLocation(`Latitude: ${resolvedCoords.latitude.toFixed(6)}, Longitude: ${resolvedCoords.longitude.toFixed(6)}`);
        setDistrict('Kampala');
        Alert.alert(
          'Location Status',
          'Exact coordinates linked successfully! Address details can be edited manually.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLocating(false);
    }
  };

  const canNext = () => {
    if (step === 1) return category !== null;
    if (step === 2) return title.trim().length > 3;
    if (step === 3) return true; // photos optional for demo
    if (step === 4) return location.trim().length > 2 && district.trim().length > 1;
    if (step === 5) return price.trim().length > 0;
    return false;
  };

  const handleNext = async () => {
    if (step < 5) {
      setStep(s => s + 1);
      return;
    }

    if (!user) {
      Alert.alert('Sign In Required', 'You must be signed in to list a property.');
      return;
    }

    setSubmitting(true);
    try {
      const cleanedPrice = parseFloat(price.replace(/[^0-9]/g, '')) || 0;
      
      // 1. Create property listing first
      const initialPropertyData = {
        title,
        description,
        price: cleanedPrice,
        currency: 'UGX',
        pricePeriod: period,
        location: location.trim(),
        category: category || 'apartment',
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
        isFurnished: furnished,
        images: [] as string[],
        landlordId: user.id,
        district: district.trim(),
        division: division.trim(),
        landmark: landmark.trim(),
        latitude: latitude || undefined,
        longitude: longitude || undefined,
      };

      const propertyId = await createProperty(initialPropertyData);

      // 2. Upload any valid photos to Storage and collect URLs
      const uploadedImages: string[] = [];
      const validPhotos = photos.filter(Boolean);

      for (let i = 0; i < validPhotos.length; i++) {
        const photoUri = validPhotos[i];
        try {
          const downloadUrl = await uploadPropertyImage(propertyId, photoUri, i);
          uploadedImages.push(downloadUrl);
        } catch (uploadErr) {
          console.error(`Error uploading photo ${i}:`, uploadErr);
        }
      }

      // Fallback if no custom photos were uploaded
      if (uploadedImages.length === 0) {
        uploadedImages.push('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80');
      }

      // 3. Update the property doc with the final image URLs
      const propertyRef = doc(db, 'properties', propertyId);
      await updateDoc(propertyRef, {
        images: uploadedImages
      });

      // Show review modal successfully
      setShowReview(true);
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Failed to submit property listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = (step - 1) / 4;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={step === 1 ? () => router.back() : () => setStep(s => s - 1)}
            style={styles.backBtn}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Property</Text>
          <Text style={styles.stepCounter}>{step}/5</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        {/* Step indicators */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepsRow} style={styles.stepsScroll}>
          {STEPS.map(s => (
            <TouchableOpacity
              key={s.num}
              onPress={() => s.num < step && setStep(s.num)}
              style={styles.stepItem}
            >
              <View style={[
                styles.stepCircle,
                s.num === step && styles.stepCircleActive,
                s.num < step && styles.stepCircleDone,
              ]}>
                {s.num < step
                  ? <MaterialCommunityIcons name="check" size={14} color={Colors.white} />
                  : <MaterialCommunityIcons name={s.icon as any} size={14} color={s.num === step ? Colors.white : Colors.muted} />
                }
              </View>
              <Text style={[styles.stepLabel, s.num === step && styles.stepLabelActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={styles.formScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* ── Step 1: Category ───────────────────── */}
          {step === 1 && (
            <View style={styles.formSection}>
              <Text style={styles.stepTitle}>What type of space are you listing?</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map(cat => {
                  const meta = CategoryMeta[cat];
                  const active = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      activeOpacity={0.82}
                      onPress={() => setCategory(cat)}
                      style={[styles.categoryOption, active && { borderColor: meta.color, backgroundColor: meta.lightColor }]}
                    >
                      <Text style={styles.categoryEmoji}>{meta.emoji}</Text>
                      <Text style={[styles.categoryLabel, active && { color: meta.color }]}>{meta.label}</Text>
                      <Text style={styles.categorySub}>{meta.subtitle}</Text>
                      {active && (
                        <View style={[styles.activeCheck, { backgroundColor: meta.color }]}>
                          <MaterialCommunityIcons name="check" size={12} color={Colors.white} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* ── Step 2: Basic Info ─────────────────── */}
          {step === 2 && (
            <View style={styles.formSection}>
              <Text style={styles.stepTitle}>Tell us about your space</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Property Title *</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Modern 2BR in Kololo"
                  placeholderTextColor={Colors.placeholder}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe the property, features, and surroundings…"
                  placeholderTextColor={Colors.placeholder}
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Bedrooms</Text>
                  <TextInput
                    value={bedrooms}
                    onChangeText={setBedrooms}
                    placeholder="0"
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Bathrooms</Text>
                  <TextInput
                    value={bathrooms}
                    onChangeText={setBathrooms}
                    placeholder="0"
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setFurnished(v => !v)}
                style={[styles.toggleRow, furnished && styles.toggleRowActive]}
              >
                <MaterialCommunityIcons name="sofa" size={20} color={furnished ? Colors.primary : Colors.muted} />
                <Text style={[styles.toggleText, furnished && { color: Colors.primary }]}>Furnished property</Text>
                <MaterialCommunityIcons name={furnished ? 'toggle-switch' : 'toggle-switch-off'} size={28} color={furnished ? Colors.primary : Colors.muted} />
              </TouchableOpacity>
            </View>
          )}

          {/* ── Step 3: Photos ─────────────────────── */}
          {step === 3 && (
            <View style={styles.formSection}>
              <Text style={styles.stepTitle}>Add photos of your space</Text>
              <Text style={styles.stepHint}>High-quality photos get 3× more inquiries</Text>
              <View style={styles.photoGrid}>
                {[0, 1, 2, 3, 4, 5].map(i => {
                  const photoUri = photos[i];
                  return (
                    <View key={i} style={styles.photoSlotContainer}>
                      {photoUri ? (
                        <View style={styles.photoSlot}>
                          <Image source={{ uri: photoUri }} style={styles.photoImage} />
                          <TouchableOpacity
                            style={styles.deletePhotoBadge}
                            onPress={() => removePhoto(i)}
                            activeOpacity={0.8}
                          >
                            <MaterialCommunityIcons name="close" size={14} color={Colors.white} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => handleSelectPhoto(i)}
                          style={[styles.photoSlot, i > photos.length && { opacity: 0.5 }]}
                          disabled={i > photos.length}
                        >
                          <MaterialCommunityIcons
                            name="camera-plus"
                            size={28}
                            color={i === photos.length ? Colors.primary : Colors.muted}
                          />
                          <Text style={[styles.photoSlotText, i === photos.length && { color: Colors.primary, fontWeight: '600' }]}>
                            {i === 0 ? 'Cover Photo' : `Photo ${i + 1}`}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
              <View style={styles.tipsBox}>
                <MaterialCommunityIcons name="lightbulb-outline" size={18} color={Colors.warning} />
                <Text style={styles.tipsText}>Add photos from all angles: living area, bedroom, kitchen, bathroom, exterior</Text>
              </View>
            </View>
          )}

          {/* ── Step 4: Location ───────────────────── */}
          {step === 4 && (
            <View style={styles.formSection}>
              <Text style={styles.stepTitle}>Where is the property?</Text>

              {/* GPS Button */}
              <TouchableOpacity
                style={[styles.mapPlaceholder, locating && { opacity: 0.7 }]}
                onPress={handleGetCurrentLocation}
                disabled={locating}
              >
                {locating ? (
                  <ActivityIndicator size="large" color={Colors.primary} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="map-marker-radius-outline" size={32} color={Colors.primary} />
                    <Text style={styles.mapPlaceholderText}>Use Current Location (GPS) 📍</Text>
                    <Text style={styles.mapPlaceholderSub}>Automatically fills address, district & division</Text>
                  </>
                )}
              </TouchableOpacity>

              {latitude && longitude && (
                <View style={styles.coordinatesContainer}>
                  <MaterialCommunityIcons name="check-circle" size={18} color={Colors.success} />
                  <Text style={styles.coordinatesText}>
                    Exact Location Linked: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Address *</Text>
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g. Plot 12, Kololo Hill Drive"
                  placeholderTextColor={Colors.placeholder}
                  style={styles.input}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>District *</Text>
                  <TextInput
                    value={district}
                    onChangeText={setDistrict}
                    placeholder="e.g. Kampala"
                    placeholderTextColor={Colors.placeholder}
                    style={styles.input}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Division / Sub-county</Text>
                  <TextInput
                    value={division}
                    onChangeText={setDivision}
                    placeholder="e.g. Nakawa"
                    placeholderTextColor={Colors.placeholder}
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Key Landmark / Physical Feature</Text>
                <TextInput
                  value={landmark}
                  onChangeText={setLandmark}
                  placeholder="e.g. Near Acacia Mall, opposite Shell station"
                  placeholderTextColor={Colors.placeholder}
                  style={styles.input}
                />
              </View>
            </View>
          )}

          {/* ── Step 5: Price ──────────────────────── */}
          {step === 5 && (
            <View style={styles.formSection}>
              <Text style={styles.stepTitle}>Set your price & availability</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price (UGX) *</Text>
                <View style={styles.priceInputRow}>
                  <Text style={styles.currencyLabel}>UGX</Text>
                  <TextInput
                    value={price}
                    onChangeText={val => setPrice(formatNumberWithCommas(val))}
                    placeholder="e.g. 1,500,000"
                    keyboardType="numeric"
                    style={[styles.input, { flex: 1, borderWidth: 0 }]}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price Period</Text>
                <View style={styles.periodRow}>
                  {PERIODS.map(p => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPeriod(p)}
                      style={[styles.periodChip, period === p && styles.periodChipActive]}
                    >
                      <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                        Per {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Listing Summary</Text>
                {category && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Category</Text>
                    <Text style={styles.summaryValue}>{CategoryMeta[category].label}</Text>
                  </View>
                )}
                {title && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Title</Text>
                    <Text style={styles.summaryValue} numberOfLines={1}>{title}</Text>
                  </View>
                )}
                {location && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Location</Text>
                    <Text style={styles.summaryValue} numberOfLines={1}>
                      {location}{district ? `, ${district}` : ''}{division ? ` (${division})` : ''}
                    </Text>
                  </View>
                )}
                {landmark && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Landmark</Text>
                    <Text style={styles.summaryValue} numberOfLines={1}>{landmark}</Text>
                  </View>
                )}
                {price && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Price</Text>
                    <Text style={[styles.summaryValue, { color: Colors.primary }]}>
                      UGX {price} / {period}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomBar}>
          <Button
            label={step < 5 ? `Next: ${STEPS[step].label} →` : 'Submit Listing'}
            onPress={handleNext}
            disabled={!canNext() || submitting}
            loading={submitting}
            fullWidth
            variant={step === 5 ? 'success' : 'primary'}
          />
        </View>
      </KeyboardAvoidingView>
      </View>

      <ListingReviewModal
        visible={showReview}
        onClose={() => { setShowReview(false); router.back(); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center',
  },
  title: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  stepCounter: { fontSize: FontSize.sm, color: Colors.muted, fontWeight: FontWeight.semibold },
  progressBar: {
    height: 4, backgroundColor: Colors.border, marginHorizontal: Spacing.base, borderRadius: 2,
  },
  progressFill: { height: 4, backgroundColor: Colors.primary, borderRadius: 2 },
  stepsScroll: { flexGrow: 0, marginBottom: 0 },
  stepsRow: { paddingHorizontal: Spacing.base, paddingTop: Spacing.xs, paddingBottom: Spacing.xs, gap: Spacing.base },
  stepItem: { alignItems: 'center', gap: 6, minWidth: 56 },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
  },
  stepCircleActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stepCircleDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  stepLabel: { fontSize: FontSize.xs, color: Colors.muted, fontWeight: FontWeight.medium },
  stepLabelActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  formScroll: { flex: 1 },
  formScrollContent: { paddingBottom: 120 },
  formSection: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.base, paddingTop: Spacing.sm, gap: Spacing.lg },
  stepTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  stepHint: { fontSize: FontSize.sm, color: Colors.muted, marginTop: -Spacing.sm },
  categoryGrid: { gap: Spacing.md },
  categoryOption: {
    padding: Spacing.base, borderRadius: Radius.xl,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    ...Shadow.sm, position: 'relative',
  },
  categoryEmoji: { fontSize: 28, marginBottom: 6 },
  categoryLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  categorySub: { fontSize: FontSize.sm, color: Colors.muted, marginTop: 2 },
  activeCheck: {
    position: 'absolute', top: Spacing.md, right: Spacing.md,
    width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center',
  },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    padding: Spacing.md, fontSize: FontSize.base, color: Colors.text,
    backgroundColor: Colors.surface,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  rowInputs: { flexDirection: 'row', gap: Spacing.md },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: Radius.lg,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
  },
  toggleRowActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  toggleText: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.muted },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  photoSlotContainer: {
    width: '30%',
    aspectRatio: 1,
    position: 'relative',
  },
  photoSlot: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  photoSlotText: { fontSize: FontSize.xs, color: Colors.muted, textAlign: 'center' },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  deletePhotoBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
    zIndex: 10,
  },
  tipsBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.warningLight, borderRadius: Radius.md,
    padding: Spacing.md,
  },
  tipsText: { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 19 },
  mapPlaceholder: {
    height: 150, borderRadius: Radius.xl,
    borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed',
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
  },
  mapPlaceholderText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.primary },
  mapPlaceholderSub: { fontSize: FontSize.sm, color: Colors.muted },
  priceInputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
  currencyLabel: {
    paddingHorizontal: Spacing.md, paddingVertical: 13,
    fontSize: FontSize.base, fontWeight: FontWeight.bold,
    color: Colors.muted, borderRightWidth: 1, borderRightColor: Colors.border,
  },
  periodRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  periodChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 9,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  periodChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  periodText: { fontSize: FontSize.sm, color: Colors.muted, fontWeight: FontWeight.medium },
  periodTextActive: { color: Colors.white, fontWeight: FontWeight.semibold },
  summaryCard: {
    backgroundColor: Colors.primaryLight, borderRadius: Radius.xl,
    padding: Spacing.base, gap: Spacing.sm,
  },
  summaryTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.muted },
  summaryValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, flex: 1, textAlign: 'right' },
  bottomBar: {
    padding: Spacing.base, paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface, borderTopWidth: 0.5, borderTopColor: Colors.border,
  },
  coordinatesContainer: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: Radius.lg,
    backgroundColor: Colors.successLight,
    borderWidth: 1.5, borderColor: Colors.success,
    marginTop: Spacing.sm,
  },
  coordinatesText: {
    fontSize: FontSize.sm, color: Colors.success,
    fontWeight: FontWeight.semibold,
  },
});

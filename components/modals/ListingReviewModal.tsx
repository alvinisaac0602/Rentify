import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { submitVerificationDocument } from '../../services/firebaseServices';
import * as ImagePicker from 'expo-image-picker';

interface ListingReviewModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ListingReviewModal({ visible, onClose }: ListingReviewModalProps) {
  const { user, updateUserVerification } = useAuth();
  
  const [uploading, setUploading] = useState(false);
  const [consent, setConsent] = useState(false);
  const isVerified = user?.isVerified ?? false;

  const handleStartVerification = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to complete verification.');
      return;
    }

    if (!consent) {
      Alert.alert('Consent Required', 'Please check the consent box to confirm you agree to our privacy guarantee.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your gallery to upload a verification document.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const selectedUri = result.assets[0].uri;
      setUploading(true);
      try {
        await submitVerificationDocument(user.id, selectedUri, 'identity_doc.jpeg');
        await updateUserVerification(true);
        Alert.alert(
          'Verification Submitted 🚀',
          'Your identity document has been uploaded successfully and your landlord account is now verified.'
        );
      } catch (err: any) {
        Alert.alert('Upload Failed', err.message || 'Could not upload document.');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <StatusBar style="auto" />
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.icon}>
            <MaterialCommunityIcons name="magnify-scan" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Listing Under Review 🔍</Text>
          <Text style={styles.description}>
            Your property has been submitted successfully. Our verification team will review it within 30 minutes.
          </Text>

          {/* Verification Status Badge */}
          <View style={[styles.badgeContainer, isVerified ? styles.badgeVerified : styles.badgeUnverified]}>
            <MaterialCommunityIcons 
              name={isVerified ? "shield-check" : "shield-alert-outline"} 
              size={18} 
              color={isVerified ? Colors.success : Colors.danger} 
            />
            <Text style={[styles.badgeText, { color: isVerified ? Colors.success : Colors.danger }]}>
              {isVerified ? 'Verified Landlord Account' : 'Unverified Landlord'}
            </Text>
          </View>

          {/* Verification Suggestion */}
          {!isVerified && (
            <View style={styles.suggestionBox}>
              <View style={styles.suggestionHeader}>
                <MaterialCommunityIcons name="shield-lock-open-outline" size={22} color={Colors.warning} />
                <Text style={styles.suggestionTitle}>Get Verified Badge 🛡️</Text>
              </View>
              <Text style={styles.suggestionText}>
                Verified landlords get 5× more views, trust badges on listings, and instant listing approvals.
              </Text>

              {/* Privacy Consent Box */}
              <View style={styles.privacyBox}>
                <Text style={styles.privacyTitle}>🔒 Secure Processing & Consent</Text>
                <Text style={styles.privacyText}>
                  Rentify encrypts your uploaded credentials. We only use this information to authenticate you as a landlord and prevent rental fraud. We promise to never share, sell, or misuse your private documents.
                </Text>
                <TouchableOpacity 
                  style={styles.checkboxRow}
                  onPress={() => setConsent(c => !c)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons 
                    name={consent ? "checkbox-marked" : "checkbox-blank-outline"} 
                    size={20} 
                    color={consent ? Colors.primary : Colors.muted} 
                  />
                  <Text style={styles.checkboxLabel}>
                    I consent to Rentify processing my identity document safely.
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.suggestBtn, !consent && styles.suggestBtnDisabled]} 
                onPress={handleStartVerification}
                disabled={uploading || !consent}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="upload" size={16} color={Colors.white} />
                    <Text style={styles.suggestBtnText}>Upload ID / Permit</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.steps}>
            {[
              { step: '1', text: 'Listing received', done: true },
              { step: '2', text: 'Identity verification', done: isVerified },
              { step: '3', text: 'Property confirmation', done: false },
              { step: '4', text: 'Published live', done: false },
            ].map(s => (
              <View key={s.step} style={styles.stepRow}>
                <View style={[styles.stepDot, s.done && { backgroundColor: Colors.success }]}>
                  {s.done
                    ? <MaterialCommunityIcons name="check" size={12} color={Colors.white} />
                    : <Text style={styles.stepNum}>{s.step}</Text>
                  }
                </View>
                <Text style={[styles.stepText, s.done && { color: Colors.success, fontWeight: FontWeight.semibold }]}>
                  {s.text}
                </Text>
              </View>
            ))}
          </View>
          <Button label="Got it!" onPress={onClose} fullWidth />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: Colors.overlay,
    alignItems: 'center', justifyContent: 'center', padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius['2xl'],
    padding: Spacing.xl, width: '100%', alignItems: 'center', ...Shadow.lg,
  },
  icon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl, fontWeight: FontWeight.bold,
    color: Colors.text, textAlign: 'center', marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.base, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22, marginBottom: Spacing.md,
  },
  badgeContainer: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md,
    borderRadius: Radius.full, marginBottom: Spacing.lg,
  },
  badgeVerified: { backgroundColor: Colors.successLight },
  badgeUnverified: { backgroundColor: Colors.dangerLight },
  badgeText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  suggestionBox: {
    width: '100%', backgroundColor: Colors.warningLight,
    borderRadius: Radius.xl, padding: Spacing.base, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: '#FEF3C7', gap: Spacing.sm,
  },
  suggestionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  suggestionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  suggestionText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  privacyBox: {
    backgroundColor: Colors.white,
    padding: Spacing.sm + 2, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  privacyTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary, marginBottom: 4 },
  privacyText: { fontSize: 10, color: Colors.textSecondary, lineHeight: 14, marginBottom: Spacing.xs },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  checkboxLabel: { fontSize: 10, color: Colors.text, fontWeight: FontWeight.medium, flex: 1 },
  suggestBtn: {
    backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm,
    borderRadius: Radius.lg, ...Shadow.sm,
  },
  suggestBtnDisabled: { backgroundColor: Colors.border, opacity: 0.7 },
  suggestBtnText: { color: Colors.white, fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  steps: { width: '100%', gap: Spacing.sm, marginBottom: Spacing.xl },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNum: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.muted },
  stepText: { fontSize: FontSize.base, color: Colors.textSecondary },
});

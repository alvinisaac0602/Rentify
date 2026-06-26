import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { submitVerificationDocument, submitPropertyVerificationDocument } from '../../services/firebaseServices';
import * as ImagePicker from 'expo-image-picker';

interface VerificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export function VerificationModal({ visible, onClose }: VerificationModalProps) {
  const { user, updateUserVerification } = useAuth();
  const [activeTab, setActiveTab] = useState<'landlord' | 'properties'>('landlord');
  
  // Landlord verification states
  const [landlordConsent, setLandlordConsent] = useState(false);
  const [uploadingLandlord, setUploadingLandlord] = useState(false);
  const isVerified = user?.isVerified ?? false;

  // Properties verification states
  const [properties, setProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [propertyConsent, setPropertyConsent] = useState(false);
  const [uploadingProperty, setUploadingProperty] = useState(false);

  // Fetch properties listed by this landlord
  const fetchLandlordProperties = async () => {
    if (!user) return;
    setLoadingProperties(true);
    try {
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const { db } = require('../../config/firebase');
      
      const q = query(
        collection(db, 'properties'),
        where('landlordId', '==', user.id)
      );
      const snapshot = await getDocs(q);
      const list: any[] = [];
      snapshot.forEach((docSnap: any) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setProperties(list);
    } catch (err) {
      console.error('Error fetching landlord properties:', err);
    } finally {
      setLoadingProperties(false);
    }
  };

  useEffect(() => {
    if (visible && user) {
      fetchLandlordProperties();
    }
  }, [visible, user]);

  const handleLandlordUpload = async () => {
    if (!user) return;
    if (!landlordConsent) {
      Alert.alert('Consent Required', 'Please accept the consent agreement and privacy policy to submit your document.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need photo library access to upload your verification document.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const selectedUri = result.assets[0].uri;
      setUploadingLandlord(true);
      try {
        await submitVerificationDocument(user.id, selectedUri, 'identity_doc.jpeg');
        await updateUserVerification(true);
        Alert.alert(
          'Account Verified! 🎉',
          'Your verification document has been processed successfully. Your account is now fully verified.'
        );
      } catch (err: any) {
        Alert.alert('Upload Failed', err.message || 'Could not upload document.');
      } finally {
        setUploadingLandlord(false);
      }
    }
  };

  const handlePropertyUpload = async (propertyId: string) => {
    if (!user) return;
    if (!propertyConsent) {
      Alert.alert('Consent Required', 'Please accept the consent agreement and privacy policy to submit your document.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need photo library access to upload your verification document.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const selectedUri = result.assets[0].uri;
      setUploadingProperty(true);
      try {
        await submitPropertyVerificationDocument(propertyId, user.id, selectedUri, 'property_title_doc.jpeg');
        Alert.alert(
          'Listing Verified! 🏡',
          'Your property ownership document was successfully processed and the listing is now verified.'
        );
        setSelectedPropertyId(null);
        setPropertyConsent(false);
        // Refresh properties list
        await fetchLandlordProperties();
      } catch (err: any) {
        Alert.alert('Upload Failed', err.message || 'Could not upload document.');
      } finally {
        setUploadingProperty(false);
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Trust & Verification 🛡️</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Navigation Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'landlord' && styles.activeTab]}
              onPress={() => setActiveTab('landlord')}
            >
              <Text style={[styles.tabLabel, activeTab === 'landlord' && styles.activeTabLabel]}>
                Landlord ID
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'properties' && styles.activeTab]}
              onPress={() => setActiveTab('properties')}
            >
              <Text style={[styles.tabLabel, activeTab === 'properties' && styles.activeTabLabel]}>
                My Listings
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {activeTab === 'landlord' ? (
              <View style={styles.section}>
                {isVerified ? (
                  <View style={styles.verifiedState}>
                    <View style={styles.verifiedIconCircle}>
                      <MaterialCommunityIcons name="shield-check" size={48} color={Colors.success} />
                    </View>
                    <Text style={styles.verifiedTitle}>Account Fully Verified</Text>
                    <Text style={styles.verifiedSub}>
                      Your verification document has been approved. You now have a verification shield next to your name and listings.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.unverifiedState}>
                    <Text style={styles.sectionSubtitle}>Verify Landlord Identity</Text>
                    <Text style={styles.sectionDesc}>
                      To list properties and chat with tenants, you must verify your identity. Upload a scan of your National ID, Passport, or Driver's license.
                    </Text>

                    {/* Consent Box */}
                    <View style={styles.privacyBox}>
                      <Text style={styles.privacyTitle}>🔒 Secure Processing & Consent Guarantee</Text>
                      <Text style={styles.privacyText}>
                        Rentify encrypts your uploaded credentials. We only use this information to authenticate you as a landlord and prevent rental fraud. We promise to never share, sell, or misuse your private documents.
                      </Text>
                      <TouchableOpacity 
                        style={styles.checkboxRow}
                        onPress={() => setLandlordConsent(c => !c)}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons 
                          name={landlordConsent ? "checkbox-marked" : "checkbox-blank-outline"} 
                          size={24} 
                          color={landlordConsent ? Colors.primary : Colors.muted} 
                        />
                        <Text style={styles.checkboxLabel}>
                          I consent to Rentify processing my identity document safely.
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                      style={[styles.actionBtn, !landlordConsent && styles.actionBtnDisabled]}
                      onPress={handleLandlordUpload}
                      disabled={uploadingLandlord}
                    >
                      {uploadingLandlord ? (
                        <ActivityIndicator color={Colors.white} />
                      ) : (
                        <>
                          <MaterialCommunityIcons name="cloud-upload-outline" size={20} color={Colors.white} />
                          <Text style={styles.actionBtnText}>Select & Upload ID</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.section}>
                <Text style={styles.sectionSubtitle}>Verify Property Listings</Text>
                <Text style={styles.sectionDesc}>
                  Verified property listings get up to 5x more clicks, premium trust tags, and show at the top of tenant search listings.
                </Text>

                {loadingProperties ? (
                  <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
                ) : properties.length === 0 ? (
                  <View style={styles.emptyProperties}>
                    <MaterialCommunityIcons name="home-alert-outline" size={36} color={Colors.muted} />
                    <Text style={styles.emptyText}>You haven't listed any properties yet.</Text>
                  </View>
                ) : (
                  <View style={styles.propertiesList}>
                    {properties.map((item) => (
                      <View key={item.id} style={styles.propertyItem}>
                        <View style={styles.propertyInfo}>
                          <Text style={styles.propertyTitleText} numberOfLines={1}>{item.title}</Text>
                          <Text style={styles.propertyLocationText} numberOfLines={1}>📍 {item.location}</Text>
                          <View style={styles.badgeRow}>
                            <View style={[styles.statusBadge, item.isVerified ? styles.badgeVerified : styles.badgeUnverified]}>
                              <Text style={[styles.statusBadgeText, { color: item.isVerified ? Colors.success : Colors.danger }]}>
                                {item.isVerified ? 'Verified Property' : 'Unverified Listing'}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {!item.isVerified && (
                          <TouchableOpacity 
                            style={styles.verifyPropBtn}
                            onPress={() => setSelectedPropertyId(selectedPropertyId === item.id ? null : item.id)}
                          >
                            <Text style={styles.verifyPropBtnText}>
                              {selectedPropertyId === item.id ? 'Cancel' : 'Verify'}
                            </Text>
                          </TouchableOpacity>
                        )}

                        {/* Collapsed Verification Form for selected property */}
                        {selectedPropertyId === item.id && (
                          <View style={styles.propertyDocForm}>
                            <Text style={styles.docFormTitle}>Upload ownership certificate / utility bill</Text>
                            
                            {/* Property Document Consent */}
                            <View style={styles.privacyBox}>
                              <Text style={styles.privacyTitle}>🔒 Data Security & Usage Consent</Text>
                              <Text style={styles.privacyText}>
                                Rentify encrypts property records. Ownership certificates are processed solely to verify property title ownership and prevent fake listing scams. We never share or lease your land registry records.
                              </Text>
                              <TouchableOpacity 
                                style={styles.checkboxRow}
                                onPress={() => setPropertyConsent(c => !c)}
                                activeOpacity={0.8}
                              >
                                <MaterialCommunityIcons 
                                  name={propertyConsent ? "checkbox-marked" : "checkbox-blank-outline"} 
                                  size={22} 
                                  color={propertyConsent ? Colors.primary : Colors.muted} 
                                />
                                <Text style={styles.checkboxLabel}>
                                  I consent to property ownership verification.
                                </Text>
                              </TouchableOpacity>
                            </View>

                            <TouchableOpacity 
                              style={[styles.actionBtn, !propertyConsent && styles.actionBtnDisabled]}
                              onPress={() => handlePropertyUpload(item.id)}
                              disabled={uploadingProperty}
                            >
                              {uploadingProperty ? (
                                <ActivityIndicator color={Colors.white} />
                              ) : (
                                <>
                                  <MaterialCommunityIcons name="upload" size={18} color={Colors.white} />
                                  <Text style={styles.actionBtnText}>Upload Ownership Document</Text>
                                </>
                              )}
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <Button label="Done" onPress={onClose} fullWidth style={{ marginTop: Spacing.md }} />
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
    padding: Spacing.xl, width: '100%', maxHeight: '85%', ...Shadow.lg,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  closeBtn: { padding: 4 },
  tabBar: {
    flexDirection: 'row', backgroundColor: Colors.bg,
    borderRadius: Radius.lg, padding: 4, marginBottom: Spacing.md,
  },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: Radius.md },
  activeTab: { backgroundColor: Colors.surface, ...Shadow.sm },
  tabLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.muted },
  activeTabLabel: { color: Colors.primary, fontWeight: FontWeight.bold },
  scroll: { flexGrow: 0, marginBottom: Spacing.xs },
  section: { gap: Spacing.md },
  sectionSubtitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  sectionDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  verifiedState: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.md },
  verifiedIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.successLight, alignItems: 'center', justifyContent: 'center',
  },
  verifiedTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  verifiedSub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  unverifiedState: { gap: Spacing.md },
  privacyBox: {
    backgroundColor: Colors.primaryLight + '20',
    padding: Spacing.base, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.primary + '15',
  },
  privacyTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary, marginBottom: 6 },
  privacyText: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16, marginBottom: Spacing.md },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  checkboxLabel: { fontSize: FontSize.xs, color: Colors.text, fontWeight: FontWeight.medium, flex: 1 },
  actionBtn: {
    backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md,
    borderRadius: Radius.xl, ...Shadow.sm,
  },
  actionBtnDisabled: { backgroundColor: Colors.border, opacity: 0.7 },
  actionBtnText: { color: Colors.white, fontWeight: FontWeight.bold, fontSize: FontSize.sm },
  emptyProperties: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyText: { fontSize: FontSize.sm, color: Colors.muted, textAlign: 'center' },
  propertiesList: { gap: Spacing.md },
  propertyItem: {
    backgroundColor: Colors.bg, borderRadius: Radius.xl,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.border,
  },
  propertyInfo: { gap: 4, flex: 1 },
  propertyTitleText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
  propertyLocationText: { fontSize: FontSize.xs, color: Colors.muted },
  badgeRow: { flexDirection: 'row', marginTop: 4 },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  badgeVerified: { backgroundColor: Colors.successLight },
  badgeUnverified: { backgroundColor: Colors.dangerLight },
  statusBadgeText: { fontSize: 10, fontWeight: FontWeight.bold },
  verifyPropBtn: {
    backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.md,
    paddingVertical: 6, borderRadius: Radius.lg, alignSelf: 'flex-end', marginTop: Spacing.xs,
  },
  verifyPropBtnText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  propertyDocForm: { marginTop: Spacing.md, borderTopWidth: 0.5, borderTopColor: Colors.border, paddingTop: Spacing.md, gap: Spacing.sm },
  docFormTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary },
});

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Property } from '../../constants/mockData';
import { useAuth } from '../../context/AuthContext';
import { requestPropertyVerification } from '../../services/firebaseServices';
import { VerificationModal } from '../../components/modals/VerificationModal';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function LandlordDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [furnitureOrders, setFurnitureOrders] = useState<any[]>([]);
  const [movingBookings, setMovingBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'furniture' | 'movers'>('requests');
  const [loading, setLoading] = useState(true);
  const [landlordVerified, setLandlordVerified] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verifyingPropertyId, setVerifyingPropertyId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setLoading(true);

      const qProperties = query(
        collection(db, 'properties'),
        where('landlordId', '==', user.id)
      );
      const qRequests = query(
        collection(db, 'viewingRequests'),
        where('landlordId', '==', user.id)
      );
      const qFurniture = query(
        collection(db, 'furnitureOrders')
      );
      const qMoving = query(
        collection(db, 'movingBookings')
      );

      const unsubProperties = onSnapshot(qProperties, (snap: any) => {
        const loadedProperties: Property[] = [];
        snap.forEach((docSnap: any) => {
          loadedProperties.push({ id: docSnap.id, ...docSnap.data() });
        });
        setMyProperties(loadedProperties);
        setLoading(false);
      }, (error) => {
        console.log('Error listening to properties:', error);
        setLoading(false);
      });

      const unsubRequests = onSnapshot(qRequests, (snap: any) => {
        const loadedRequests: any[] = [];
        snap.forEach((docSnap: any) => {
          loadedRequests.push({ id: docSnap.id, ...docSnap.data() });
        });
        setPendingRequests(loadedRequests);
      }, (error) => {
        console.log('Error listening to requests:', error);
      });

      const unsubFurniture = onSnapshot(qFurniture, (snap: any) => {
        const loadedFurniture: any[] = [];
        snap.forEach((docSnap: any) => {
          loadedFurniture.push({ id: docSnap.id, ...docSnap.data() });
        });
        loadedFurniture.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setFurnitureOrders(loadedFurniture);
      }, (error) => {
        console.log('Error listening to furniture orders:', error);
      });

      const unsubMoving = onSnapshot(qMoving, (snap: any) => {
        const loadedMoving: any[] = [];
        snap.forEach((docSnap: any) => {
          loadedMoving.push({ id: docSnap.id, ...docSnap.data() });
        });
        loadedMoving.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setMovingBookings(loadedMoving);
      }, (error) => {
        console.log('Error listening to moving bookings:', error);
      });

      const userRef = doc(db, 'users', user.id);
      const unsubUser = onSnapshot(userRef, (userSnap: any) => {
        if (userSnap.exists()) {
          setLandlordVerified(!!userSnap.data().isVerified);
        } else {
          setLandlordVerified(user.isVerified ?? false);
        }
      }, (error) => {
        console.log('Error listening to user doc:', error);
      });

      return () => {
        unsubProperties();
        unsubRequests();
        unsubFurniture();
        unsubMoving();
        unsubUser();
      };
    }, [user])
  );

  const handleVerifyProperty = async (property: Property) => {
    if (!user) return;
    Alert.alert(
      'Verify Property',
      `Request verification for "${property.title}"?\n\nVerification confirms this is a real, legitimate listing and adds the Rentify Verified badge.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify Now',
          onPress: async () => {
            setVerifyingPropertyId(property.id);
            try {
              await requestPropertyVerification(property.id, user.id, property.title);
              Alert.alert('✅ Verified!', `"${property.title}" now has the Rentify Verified badge.`);
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Could not verify property.');
            } finally {
              setVerifyingPropertyId(null);
            }
          }
        }
      ]
    );
  };

  const handlePromoteProperty = async (property: Property) => {
    if (!user) return;
    const now = new Date();
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(now.getMonth() + 2);

    Alert.alert(
      'Promote to Featured Listing 🌟',
      `Feature "${property.title}" for 2 months on the home page?\n\nPrice: 50,000 UGX`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay via Mobile Money/Card',
          onPress: async () => {
            try {
              const { doc, updateDoc } = require('firebase/firestore');
              const propertyRef = doc(db, 'properties', property.id);
              await updateDoc(propertyRef, {
                listingPlan: 'featured',
                isPaid: true,
                isVerified: true, // Auto-verify paid featured listings
                featuredUntil: twoMonthsFromNow.toISOString(),
                updatedAt: now.toISOString()
              });
              Alert.alert(
                '🎉 Listing Promoted!',
                `"${property.title}" is now featured on the home screen until ${twoMonthsFromNow.toLocaleDateString()}.`
              );
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Could not promote property.');
            }
          }
        }
      ]
    );
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { updateDoc } = require('firebase/firestore');
      await updateDoc(doc(db, 'viewingRequests', requestId), { status: 'approved' });
      Alert.alert('Request Approved', 'The tenant has been notified.');
    } catch (e) {
      Alert.alert('Error', 'Could not approve request.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { updateDoc } = require('firebase/firestore');
      await updateDoc(doc(db, 'viewingRequests', requestId), { status: 'declined' });
      Alert.alert('Request Declined', 'The request has been declined.');
    } catch (e) {
      Alert.alert('Error', 'Could not decline request.');
    }
  };

  const verifiedProperties = myProperties.filter(p => p.isVerified).length;
  const pendingCount = pendingRequests.filter(r => r.status === 'pending').length;
  // Calculate total e-commerce + booking income as admin stats
  const totalFurnitureIncome = furnitureOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalMonthlyIncome = myProperties.reduce((sum, p) => sum + (p.price || 0), 0) + totalFurnitureIncome;
  const formattedIncome = totalMonthlyIncome >= 1000000
    ? `${(totalMonthlyIncome / 1000000).toFixed(1)}M`
    : totalMonthlyIncome.toLocaleString();

  const stats = [
    { label: 'Total Properties', value: myProperties.length.toString(), icon: 'home-city', color: Colors.primary, bg: Colors.primaryLight },
    { label: 'Verified Listings', value: `${verifiedProperties}/${myProperties.length}`, icon: 'shield-check', color: Colors.trust, bg: '#EFF6FF' },
    { label: 'Furniture Orders', value: furnitureOrders.length.toString(), icon: 'sofa', color: Colors.warning, bg: Colors.warningLight },
    { label: 'Total Revenue', value: `${formattedIncome} UGX`, icon: 'cash', color: Colors.airbnb, bg: Colors.airbnbLight },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[Colors.hostel, '#9333EA']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.white} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerGreeting}>Landlord Dashboard 🏢</Text>
              <Text style={styles.headerSub}>{user?.name || 'My Properties'}</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/screens/notifications' as any)}>
              <MaterialCommunityIcons name="bell-outline" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <View style={styles.body}>
            {/* Stats grid */}
            <View style={styles.statsGrid}>
              {stats.map(stat => (
                <View key={stat.label} style={[styles.statCard, Shadow.sm]}>
                  <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
                    <MaterialCommunityIcons name={stat.icon as any} size={22} color={stat.color} />
                  </View>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* ── Verification Hub ─────────────────────────────────── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Verification Hub</Text>
              <Text style={styles.sectionSub}>Verified listings get 3x more views</Text>

              {/* Landlord Account Verification */}
              <View style={[styles.verifCard, landlordVerified && styles.verifCardDone]}>
                <View style={styles.verifRow}>
                  <View style={[
                    styles.verifIconCircle,
                    { backgroundColor: landlordVerified ? '#D1FAE5' : Colors.primaryLight }
                  ]}>
                    <MaterialCommunityIcons
                      name={landlordVerified ? 'shield-check' : 'shield-outline'}
                      size={22}
                      color={landlordVerified ? Colors.success : Colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.verifTitle}>Landlord Account</Text>
                    <Text style={styles.verifSub}>
                      {landlordVerified
                        ? '✅ Verified — Trusted Rentify Landlord'
                        : 'Verify your identity to unlock the verified badge'}
                    </Text>
                  </View>
                  {!landlordVerified && (
                    <TouchableOpacity
                      style={styles.verifBtn}
                      onPress={() => setShowVerificationModal(true)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.verifBtnText}>Verify</Text>
                    </TouchableOpacity>
                  )}
                  {landlordVerified && (
                    <MaterialCommunityIcons name="check-circle" size={22} color={Colors.success} />
                  )}
                </View>
              </View>

              {/* Property Verification List */}
              {myProperties.length === 0 ? (
                <View style={styles.emptyVerifCard}>
                  <Text style={styles.emptyText}>Add a property first to request verification.</Text>
                </View>
              ) : (
                myProperties.map(property => {
                  const isVerified = property.isVerified;
                  const isVerifying = verifyingPropertyId === property.id;
                  return (
                    <View key={property.id} style={[styles.verifCard, isVerified && styles.verifCardDone]}>
                      <View style={styles.verifRow}>
                        <View style={[
                          styles.verifIconCircle,
                          { backgroundColor: isVerified ? '#D1FAE5' : '#FEF3C7' }
                        ]}>
                          <MaterialCommunityIcons
                            name={(isVerified ? 'home-circle-outline' : 'home-alert-outline') as any}
                            size={20}
                            color={isVerified ? Colors.success : Colors.warning}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.verifTitle} numberOfLines={1}>{property.title}</Text>
                          <Text style={styles.verifSub}>
                            {isVerified ? '✅ Verified listing' : `${property.category} · ${property.location || 'No location'}`}
                          </Text>
                        </View>
                        {!isVerified && (
                          <TouchableOpacity
                            style={[styles.verifBtn, { backgroundColor: Colors.warning }]}
                            onPress={() => handleVerifyProperty(property)}
                            disabled={isVerifying}
                            activeOpacity={0.85}
                          >
                            {isVerifying
                              ? <ActivityIndicator size="small" color={Colors.white} />
                              : <Text style={styles.verifBtnText}>Verify</Text>
                            }
                          </TouchableOpacity>
                        )}
                        {isVerified && (
                          <MaterialCommunityIcons name="check-circle" size={22} color={Colors.success} />
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* Add Property CTA */}
            <TouchableOpacity
              style={styles.addPropertyBtn}
              onPress={() => router.push('/landlord/add-property' as any)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.hostel]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.addPropertyGradient}
              >
                <MaterialCommunityIcons name="plus-circle" size={28} color={Colors.white} />
                <View>
                  <Text style={styles.addPropertyTitle}>Add New Property</Text>
                  <Text style={styles.addPropertySub}>List in 5 simple steps</Text>
                </View>
                <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.white} style={{ marginLeft: 'auto' }} />
              </LinearGradient>
            </TouchableOpacity>

            {/* ── Requests & Orders Tab Switcher ───────────────── */}
            <View style={styles.section}>
              <View style={styles.tabHeader}>
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'requests' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('requests')}
                >
                  <Text style={[styles.tabBtnText, activeTab === 'requests' && styles.tabBtnTextActive]}>
                    Viewings ({pendingRequests.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'furniture' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('furniture')}
                >
                  <Text style={[styles.tabBtnText, activeTab === 'furniture' && styles.tabBtnTextActive]}>
                    Furniture ({furnitureOrders.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'movers' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('movers')}
                >
                  <Text style={[styles.tabBtnText, activeTab === 'movers' && styles.tabBtnTextActive]}>
                    Movers ({movingBookings.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {activeTab === 'requests' && (
                <View style={{ gap: Spacing.sm, marginTop: Spacing.sm }}>
                  {pendingRequests.length === 0 ? (
                    <View style={styles.emptyCard}>
                      <MaterialCommunityIcons name="calendar-blank-outline" size={32} color={Colors.muted} />
                      <Text style={styles.emptyText}>No viewing requests yet.</Text>
                    </View>
                  ) : (
                    pendingRequests.map(req => (
                      <View key={req.id} style={styles.requestCard}>
                        <View style={[styles.requestType, {
                          backgroundColor: req.status === 'approved' ? Colors.successLight : Colors.primaryLight,
                        }]}>
                          <MaterialCommunityIcons
                            name={req.status === 'approved' ? 'calendar-check' : 'calendar'}
                            size={18}
                            color={req.status === 'approved' ? Colors.success : Colors.primary}
                          />
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text style={styles.requestName}>{req.tenantName || req.contactName || 'Tenant'}</Text>
                          <Text style={styles.requestProperty} numberOfLines={1}>{req.propertyTitle || 'Property'}</Text>
                          <Text style={styles.requestTime}>
                            📅 {req.preferredDate || req.date || 'Upcoming'} at {req.preferredTime || req.time || 'TBD'}
                          </Text>
                          {req.tenantPhone && (
                            <TouchableOpacity
                              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}
                              onPress={() => {
                                const { Linking } = require('react-native');
                                Linking.openURL(`tel:${req.tenantPhone}`).catch(() => {});
                              }}
                            >
                              <MaterialCommunityIcons name="phone" size={12} color={Colors.primary} />
                              <Text style={{ fontSize: FontSize.xs, color: Colors.primary, fontWeight: 'bold' }}>
                                {req.tenantPhone}
                              </Text>
                            </TouchableOpacity>
                          )}
                          {req.note ? (
                            <Text style={{ fontSize: FontSize.xs, color: Colors.textSecondary, fontStyle: 'italic', marginTop: 4 }}>
                              "{req.note}"
                            </Text>
                          ) : null}
                        </View>
                        {req.status === 'pending' && (
                          <View style={styles.requestActions}>
                            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRejectRequest(req.id)}>
                              <MaterialCommunityIcons name="close" size={16} color={Colors.danger} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptRequest(req.id)}>
                              <MaterialCommunityIcons name="check" size={16} color={Colors.white} />
                            </TouchableOpacity>
                          </View>
                        )}
                        {req.status === 'approved' && (
                          <View style={[styles.statusPill, { backgroundColor: Colors.successLight }]}>
                            <Text style={{ fontSize: FontSize.xs, color: Colors.success, fontWeight: 'bold' }}>Approved</Text>
                          </View>
                        )}
                      </View>
                    ))
                  )}
                </View>
              )}

              {activeTab === 'furniture' && (
                <View style={{ gap: Spacing.sm, marginTop: Spacing.sm }}>
                  {furnitureOrders.length === 0 ? (
                    <View style={styles.emptyCard}>
                      <MaterialCommunityIcons name="sofa-outline" size={32} color={Colors.muted} />
                      <Text style={styles.emptyText}>No furniture orders placed yet.</Text>
                    </View>
                  ) : (
                    furnitureOrders.map(order => (
                      <View key={order.id} style={styles.requestCard}>
                        <View style={[styles.requestType, { backgroundColor: Colors.warningLight }]}>
                          <MaterialCommunityIcons name="cart" size={18} color={Colors.warning} />
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.requestName}>{order.customerName}</Text>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: Colors.muted }}>
                              {order.orderId}
                            </Text>
                          </View>
                          <Text style={styles.requestProperty}>
                            {order.items?.map((it: any) => `${it.qty}x ${it.name}`).join(', ')}
                          </Text>
                          <Text style={styles.requestTime}>
                            📍 {order.deliveryAddress}
                          </Text>
                          <Text style={{ fontSize: FontSize.xs, fontWeight: 'bold', color: '#D97706', marginTop: 2 }}>
                            UGX {order.totalAmount?.toLocaleString()} ({order.paymentMethod === 'mobile_money' ? 'Paid' : 'COD'})
                          </Text>
                          {order.customerPhone && (
                            <TouchableOpacity
                              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}
                              onPress={() => {
                                const { Linking } = require('react-native');
                                Linking.openURL(`tel:${order.customerPhone}`).catch(() => {});
                              }}
                            >
                              <MaterialCommunityIcons name="phone" size={12} color={Colors.primary} />
                              <Text style={{ fontSize: FontSize.xs, color: Colors.primary, fontWeight: 'bold' }}>
                                {order.customerPhone}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}

              {activeTab === 'movers' && (
                <View style={{ gap: Spacing.sm, marginTop: Spacing.sm }}>
                  {movingBookings.length === 0 ? (
                    <View style={styles.emptyCard}>
                      <MaterialCommunityIcons name="truck-outline" size={32} color={Colors.muted} />
                      <Text style={styles.emptyText}>No moving services booked yet.</Text>
                    </View>
                  ) : (
                    movingBookings.map(booking => (
                      <View key={booking.id} style={styles.requestCard}>
                        <View style={[styles.requestType, { backgroundColor: Colors.trust + '15' }]}>
                          <MaterialCommunityIcons name="truck" size={18} color={Colors.trust} />
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.requestName}>{booking.customerName}</Text>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: Colors.muted }}>
                              {booking.bookingId}
                            </Text>
                          </View>
                          <Text style={styles.requestProperty}>
                            Booked: {booking.moverName}
                          </Text>
                          <Text style={styles.requestTime}>
                            Rate: {booking.priceEstimate}
                          </Text>
                          {booking.customerPhone && (
                            <TouchableOpacity
                              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}
                              onPress={() => {
                                const { Linking } = require('react-native');
                                Linking.openURL(`tel:${booking.customerPhone}`).catch(() => {});
                              }}
                            >
                              <MaterialCommunityIcons name="phone" size={12} color={Colors.primary} />
                              <Text style={{ fontSize: FontSize.xs, color: Colors.primary, fontWeight: 'bold' }}>
                                {booking.customerPhone}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>

            {/* My Listings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Listings</Text>
              {myProperties.length === 0 ? (
                <View style={styles.emptyCard}>
                  <MaterialCommunityIcons name="home-plus-outline" size={32} color={Colors.muted} />
                  <Text style={styles.emptyText}>No properties listed yet.</Text>
                </View>
              ) : (
                myProperties.map(p => {
                  const isFeatured = p.featuredUntil && new Date(p.featuredUntil) > new Date();
                  return (
                    <View key={p.id} style={styles.listingCard}>
                      <TouchableOpacity
                        style={styles.listingRow}
                        activeOpacity={0.8}
                        onPress={() => router.push(`/property/${p.id}` as any)}
                      >
                        <View style={[styles.listingStatus, { backgroundColor: (p as any).isAvailable !== false ? Colors.successLight : Colors.dangerLight }]}>
                          <Text style={[styles.listingStatusText, { color: (p as any).isAvailable !== false ? Colors.success : Colors.danger }]}>
                            {(p as any).isAvailable !== false ? 'Available' : 'Rented'}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.listingTitle} numberOfLines={1}>{p.title}</Text>
                            {p.isVerified && (
                              <MaterialCommunityIcons name="shield-check" size={14} color={Colors.trust} />
                            )}
                          </View>
                          <Text style={styles.listingMeta}>{p.location} · {p.category}</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.muted} />
                      </TouchableOpacity>

                      <View style={styles.listingActionRow}>
                        {isFeatured ? (
                          <View style={styles.featuredBadge}>
                            <MaterialCommunityIcons name="star-circle" size={15} color="#D97706" />
                            <Text style={styles.featuredBadgeText}>Featured (Active for 2 months)</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.promoteBtn}
                            onPress={() => handlePromoteProperty(p)}
                            activeOpacity={0.8}
                          >
                            <MaterialCommunityIcons name="star-outline" size={15} color="#D97706" />
                            <Text style={styles.promoteBtnText}>Feature Listing (50,000 UGX)</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <VerificationModal
        visible={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: Spacing.base, paddingBottom: Spacing.xl },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center',
  },
  headerGreeting: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)' },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSecondary,
    padding: 4,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  tabBtnActive: {
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  notifBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center',
  },
  body: { padding: Spacing.base, gap: Spacing.base, paddingBottom: Spacing['4xl'] },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  statCard: {
    width: '47%', backgroundColor: Colors.surface,
    borderRadius: Radius.xl, padding: Spacing.md, gap: Spacing.sm, alignItems: 'flex-start',
  },
  statIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.sm, color: Colors.muted, fontWeight: FontWeight.medium },

  // Verification Hub
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  sectionSub: { fontSize: FontSize.sm, color: Colors.muted, marginTop: -8 },

  verifCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, ...Shadow.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  verifCardDone: { borderColor: Colors.success + '30', backgroundColor: '#F0FDF4' },
  verifRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  verifIconCircle: {
    width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
  },
  verifTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
  verifSub: { fontSize: FontSize.xs, color: Colors.muted, marginTop: 2, lineHeight: 16 },
  verifBtn: {
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.md,
    paddingVertical: 7, borderRadius: Radius.full,
    minWidth: 64, alignItems: 'center',
  },
  verifBtnText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.bold },

  emptyVerifCard: {
    padding: Spacing.md, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, alignItems: 'center',
    borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.border,
  },

  addPropertyBtn: { borderRadius: Radius.xl, overflow: 'hidden' },
  addPropertyGradient: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg,
  },
  addPropertyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  addPropertySub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)' },

  requestCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, ...Shadow.sm,
  },
  requestType: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  requestName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  requestProperty: { fontSize: FontSize.sm, color: Colors.muted, marginTop: 2 },
  requestTime: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium, marginTop: 2 },
  requestActions: { flexDirection: 'row', gap: Spacing.sm },
  rejectBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center',
  },
  acceptBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center',
  },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },

  listingCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    overflow: 'hidden', marginBottom: Spacing.sm, ...Shadow.sm,
  },
  listingRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md,
  },
  listingActionRow: {
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    backgroundColor: Colors.surfaceSecondary,
  },
  featuredBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  featuredBadgeText: {
    fontSize: FontSize.xs, color: '#D97706', fontWeight: FontWeight.bold,
  },
  promoteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  promoteBtnText: {
    fontSize: FontSize.xs, color: '#D97706', fontWeight: FontWeight.bold,
  },
  listingStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  listingStatusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  listingTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  listingMeta: { fontSize: FontSize.sm, color: Colors.muted, marginTop: 2 },

  centerContainer: { paddingVertical: Spacing['4xl'], justifyContent: 'center', alignItems: 'center' },
  emptyCard: {
    padding: Spacing.xl, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.border,
  },
  emptyText: { fontSize: FontSize.sm, color: Colors.muted },
});

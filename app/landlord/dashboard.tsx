import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Property } from '../../constants/mockData';
import { useAuth } from '../../context/AuthContext';

export default function LandlordDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLandlordData = async () => {
    if (!user) return;
    try {
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const { db } = require('../../config/firebase');

      // 1. Fetch properties
      const qProperties = query(
        collection(db, 'properties'),
        where('landlordId', '==', user.id)
      );
      const snapProperties = await getDocs(qProperties);
      const loadedProperties: Property[] = [];
      snapProperties.forEach((docSnap: any) => {
        loadedProperties.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      setMyProperties(loadedProperties);

      // 2. Fetch viewing requests
      const qRequests = query(
        collection(db, 'viewingRequests'),
        where('landlordId', '==', user.id)
      );
      const snapRequests = await getDocs(qRequests);
      const loadedRequests: any[] = [];
      snapRequests.forEach((docSnap: any) => {
        loadedRequests.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      setPendingRequests(loadedRequests);

    } catch (error) {
      console.log('Error fetching landlord data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandlordData();
  }, [user]);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { doc, updateDoc } = require('firebase/firestore');
      const { db } = require('../../config/firebase');
      await updateDoc(doc(db, 'viewingRequests', requestId), { status: 'approved' });
      Alert.alert('Request Approved', 'The tenant has been notified of your approval.');
      fetchLandlordData();
    } catch (e) {
      Alert.alert('Error', 'Could not approve request.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { doc, updateDoc } = require('firebase/firestore');
      const { db } = require('../../config/firebase');
      await updateDoc(doc(db, 'viewingRequests', requestId), { status: 'declined' });
      Alert.alert('Request Declined', 'The request has been successfully declined.');
      fetchLandlordData();
    } catch (e) {
      Alert.alert('Error', 'Could not decline request.');
    }
  };

  const totalMonthlyIncome = myProperties.reduce((sum, p) => sum + (p.price || 0), 0);
  const formattedIncome = totalMonthlyIncome >= 1000000 
    ? `${(totalMonthlyIncome / 1000000).toFixed(1)}M` 
    : totalMonthlyIncome.toLocaleString();

  const stats = [
    { label: 'Total Properties', value: myProperties.length.toString(), icon: 'home-city', color: Colors.primary, bg: Colors.primaryLight },
    { label: 'Occupied Units', value: '0', icon: 'check-circle', color: Colors.success, bg: Colors.successLight },
    { label: 'Pending Requests', value: pendingRequests.filter(r => r.status === 'pending').length.toString(), icon: 'clock-outline', color: Colors.warning, bg: Colors.warningLight },
    { label: 'Monthly Income', value: `~${formattedIncome}`, icon: 'cash', color: Colors.airbnb, bg: Colors.airbnbLight },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
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
            <View>
              <Text style={styles.headerGreeting}>Landlord Dashboard 🏢</Text>
              <Text style={styles.headerSub}>{user?.name || 'Samuel Okello'}</Text>
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
                <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.white} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Pending Requests */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending Requests</Text>
              {pendingRequests.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No requests received yet.</Text>
                </View>
              ) : (
                pendingRequests.map(req => (
                  <View key={req.id} style={styles.requestCard}>
                    <View style={[styles.requestType, {
                      backgroundColor: req.status === 'approved' ? Colors.successLight : Colors.primaryLight,
                    }]}>
                      <MaterialCommunityIcons
                        name={req.status === 'approved' ? 'calendar-check' : 'eye'}
                        size={18}
                        color={req.status === 'approved' ? Colors.success : Colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.requestName}>{req.tenantId === user?.id ? 'Tenant Request' : 'Viewing Request'}</Text>
                      <Text style={styles.requestProperty} numberOfLines={1}>{req.propertyTitle || 'Property'}</Text>
                      <Text style={styles.requestTime}>{req.preferredTime} · status: {req.status}</Text>
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
                  </View>
                ))
              )}
            </View>

            {/* My Listings */}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>My Listings</Text>
              </View>
              {myProperties.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>You haven't listed any properties yet.</Text>
                </View>
              ) : (
                myProperties.map(p => (
                  <TouchableOpacity 
                    key={p.id} 
                    style={styles.listingRow} 
                    activeOpacity={0.8}
                    onPress={() => router.push(`/property/${p.id}` as any)}
                  >
                    <View style={[styles.listingStatus, { backgroundColor: p.isAvailable ? Colors.successLight : Colors.dangerLight }]}>
                      <Text style={[styles.listingStatusText, { color: p.isAvailable ? Colors.success : Colors.danger }]}>
                        {p.isAvailable ? 'Available' : 'Rented'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listingTitle} numberOfLines={1}>{p.title}</Text>
                      <Text style={styles.listingMeta}>{p.location} · {p.category}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.muted} />
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>
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
  notifBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center',
    marginLeft: 'auto',
  },
  body: { padding: Spacing.base, gap: Spacing.base, paddingBottom: Spacing['4xl'] },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  statCard: {
    width: '47%', backgroundColor: Colors.surface,
    borderRadius: Radius.xl, padding: Spacing.md, gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 44, height: 44, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.sm, color: Colors.muted, fontWeight: FontWeight.medium },
  addPropertyBtn: { borderRadius: Radius.xl, overflow: 'hidden' },
  addPropertyGradient: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg,
  },
  addPropertyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  addPropertySub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)' },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  requestCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, ...Shadow.sm,
  },
  requestType: {
    width: 44, height: 44, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
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
  listingRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, ...Shadow.sm,
  },
  listingStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  listingStatusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  listingTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  listingMeta: { fontSize: FontSize.sm, color: Colors.muted, marginTop: 2 },
  centerContainer: { paddingVertical: Spacing['4xl'], justifyContent: 'center', alignItems: 'center' },
  emptyCard: {
    padding: Spacing.lg, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.border
  },
  emptyText: { fontSize: FontSize.sm, color: Colors.muted },
});

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { MOCK_PROPERTIES } from '../../constants/mockData';

const DASHBOARD_STATS = [
  { label: 'Total Properties', value: '6', icon: 'home-city', color: Colors.primary, bg: Colors.primaryLight },
  { label: 'Occupied Units', value: '4', icon: 'check-circle', color: Colors.success, bg: Colors.successLight },
  { label: 'Pending Requests', value: '3', icon: 'clock-outline', color: Colors.warning, bg: Colors.warningLight },
  { label: 'Monthly Income', value: '~14.5M', icon: 'cash', color: Colors.airbnb, bg: Colors.airbnbLight },
];

const PENDING_REQUESTS = [
  { id: 'r1', name: 'John Kasibante', property: 'Modern 3BR Apartment in Kololo', type: 'Viewing', time: '2:00 PM Today' },
  { id: 'r2', name: 'Aisha Namukasa', property: 'Open-Plan Office – Nakawa', type: 'Inquiry', time: 'Tomorrow 10AM' },
  { id: 'r3', name: 'Robert Mugisha', property: 'Serene Garden Villa', type: 'Booking', time: 'Jun 22' },
];

export default function LandlordDashboard() {
  const router = useRouter();
  const myProperties = MOCK_PROPERTIES.slice(0, 4);

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
            <View>
              <Text style={styles.headerGreeting}>Landlord Dashboard 🏢</Text>
              <Text style={styles.headerSub}>Samuel Okello</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <MaterialCommunityIcons name="bell-outline" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Stats grid */}
          <View style={styles.statsGrid}>
            {DASHBOARD_STATS.map(stat => (
              <View key={stat.label} style={[styles.statCard, ...Shadow.sm as any]}>
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
            {PENDING_REQUESTS.map(req => (
              <View key={req.id} style={styles.requestCard}>
                <View style={[styles.requestType, {
                  backgroundColor: req.type === 'Booking' ? Colors.airbnbLight
                    : req.type === 'Viewing' ? Colors.primaryLight : Colors.warningLight,
                }]}>
                  <MaterialCommunityIcons
                    name={req.type === 'Booking' ? 'calendar-check' : req.type === 'Viewing' ? 'eye' : 'message'}
                    size={18}
                    color={req.type === 'Booking' ? Colors.airbnb : req.type === 'Viewing' ? Colors.primary : Colors.warning}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.requestName}>{req.name}</Text>
                  <Text style={styles.requestProperty} numberOfLines={1}>{req.property}</Text>
                  <Text style={styles.requestTime}>{req.type} · {req.time}</Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity style={styles.rejectBtn}>
                    <MaterialCommunityIcons name="close" size={16} color={Colors.danger} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.acceptBtn}>
                    <MaterialCommunityIcons name="check" size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* My Listings */}
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>My Listings</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {myProperties.map(p => (
              <TouchableOpacity key={p.id} style={styles.listingRow} activeOpacity={0.8}>
                <View style={[styles.listingStatus, { backgroundColor: p.isAvailable ? Colors.successLight : Colors.dangerLight }]}>
                  <Text style={[styles.listingStatusText, { color: p.isAvailable ? Colors.success : Colors.danger }]}>
                    {p.isAvailable ? 'Available' : 'Rented'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listingTitle} numberOfLines={1}>{p.title}</Text>
                  <Text style={styles.listingMeta}>{p.location} · {p.category}</Text>
                </View>
                <MaterialCommunityIcons name="dots-vertical" size={20} color={Colors.muted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
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
});

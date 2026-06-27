import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

interface ViewingRequest {
  id: string;
  propertyTitle: string;
  propertyLocation: string;
  landlordName: string;
  landlordPhone?: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  message?: string;
  createdAt: string;
}

const STATUS_CONFIG = {
  pending:   { color: Colors.warning,   bg: '#FEF3C7', icon: 'clock-outline',         label: 'Pending' },
  confirmed: { color: Colors.success,   bg: '#D1FAE5', icon: 'check-circle-outline',  label: 'Confirmed' },
  cancelled: { color: Colors.danger,    bg: '#FEE2E2', icon: 'close-circle-outline',  label: 'Cancelled' },
  completed: { color: Colors.trust,     bg: '#EFF6FF', icon: 'flag-checkered',        label: 'Completed' },
};

export default function MyViewingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [viewings, setViewings] = useState<ViewingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadViewings = useCallback(async () => {
    if (!user) {
      setViewings([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const q = query(
        collection(db, 'viewingRequests'),
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const list: ViewingRequest[] = [];
      snap.forEach(doc => {
        const d = doc.data();
        list.push({
          id: doc.id,
          propertyTitle: d.propertyTitle || 'Property Viewing',
          propertyLocation: d.propertyLocation || d.location || '',
          landlordName: d.landlordName || d.contactName || 'Landlord',
          landlordPhone: d.landlordPhone || d.contactPhone,
          date: d.preferredDate || d.date || '',
          time: d.preferredTime || d.time || '',
          status: d.status || 'pending',
          message: d.message || d.notes,
          createdAt: d.createdAt
            ? new Date(d.createdAt?.seconds ? d.createdAt.seconds * 1000 : d.createdAt).toLocaleDateString()
            : 'Recently',
        });
      });
      setViewings(list);
    } catch (err) {
      console.log('Error loading viewings:', err);
      setViewings([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { loadViewings(); }, [loadViewings]));

  const renderItem = ({ item }: { item: ViewingRequest }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    return (
      <View style={styles.card}>
        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: cfg.bg }]}>
          <MaterialCommunityIcons name={cfg.icon as any} size={14} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>

        {/* Property info */}
        <View style={styles.cardBody}>
          <Text style={styles.propertyTitle} numberOfLines={1}>{item.propertyTitle}</Text>
          {item.propertyLocation ? (
            <View style={styles.row}>
              <MaterialCommunityIcons name="map-marker-outline" size={13} color={Colors.muted} />
              <Text style={styles.metaText}>{item.propertyLocation}</Text>
            </View>
          ) : null}

          {/* Date & Time */}
          <View style={styles.dateTimeRow}>
            <View style={styles.dtChip}>
              <MaterialCommunityIcons name="calendar-outline" size={14} color={Colors.primary} />
              <Text style={styles.dtText}>{item.date || 'Date TBD'}</Text>
            </View>
            <View style={styles.dtChip}>
              <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.primary} />
              <Text style={styles.dtText}>{item.time || 'Time TBD'}</Text>
            </View>
          </View>

          {/* Landlord contact */}
          <View style={styles.landlordRow}>
            <View style={styles.landlordAvatar}>
              <MaterialCommunityIcons name="account" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.landlordName}>{item.landlordName}</Text>
              {item.landlordPhone ? (
                <Text style={styles.landlordPhone}>{item.landlordPhone}</Text>
              ) : null}
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.muted} />
          </View>

          {/* Message if any */}
          {item.message ? (
            <View style={styles.messageBox}>
              <Text style={styles.messageText} numberOfLines={2}>"{item.message}"</Text>
            </View>
          ) : null}

          <Text style={styles.requestedAt}>Requested {item.createdAt}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, '#3B82F6']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>My Viewings</Text>
          <Text style={styles.headerSub}>
            {loading ? 'Loading…' : `${viewings.length} viewing${viewings.length !== 1 ? 's' : ''} scheduled`}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadViewings}>
          <MaterialCommunityIcons name="refresh" size={20} color={Colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your viewings…</Text>
        </View>
      ) : viewings.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={44} color={Colors.muted} />
          </View>
          <Text style={styles.emptyTitle}>No viewings yet</Text>
          <Text style={styles.emptySubtitle}>
            Browse properties and request a viewing to schedule an appointment with a landlord.
          </Text>
          <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/explore' as any)}>
            <Text style={styles.exploreBtnText}>Browse Properties</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={viewings}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing.lg,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  refreshBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadingText: { fontSize: FontSize.sm, color: Colors.muted },
  list: { padding: Spacing.base, gap: Spacing.md, paddingBottom: 100 },

  card: {
    backgroundColor: Colors.surface, borderRadius: 18,
    overflow: 'hidden', ...Shadow.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    paddingHorizontal: Spacing.base, paddingVertical: 7,
  },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  cardBody: { padding: Spacing.base, gap: Spacing.sm },

  propertyTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FontSize.xs, color: Colors.muted, flex: 1 },

  dateTimeRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: 2 },
  dtChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm,
    paddingVertical: 5, borderRadius: Radius.full,
  },
  dtText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.primary },

  landlordRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border,
    marginTop: Spacing.xs,
  },
  landlordAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  landlordName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
  landlordPhone: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 1 },

  messageBox: {
    backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.md,
    padding: Spacing.sm, borderLeftWidth: 3, borderLeftColor: Colors.primary + '60',
  },
  messageText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontStyle: 'italic', lineHeight: 17 },
  requestedAt: { fontSize: FontSize.xs, color: Colors.muted, marginTop: 2 },

  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xl, paddingBottom: 80,
  },
  emptyIconCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
  },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  emptySubtitle: {
    fontSize: FontSize.sm, color: Colors.muted,
    textAlign: 'center', lineHeight: 20, marginBottom: Spacing.xl,
  },
  exploreBtn: {
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl,
    paddingVertical: 14, borderRadius: Radius.full, ...Shadow.sm,
  },
  exploreBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: FontWeight.bold },
});

import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { db } from '../../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

export default function BookingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { propertyTitle, price } = useLocalSearchParams<{ propertyTitle?: string; price?: string }>();
  const [nights, setNights] = useState(2);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = async () => {
    setConfirmed(true);
    try {
      if (user) {
        await addDoc(collection(db, 'bookings'), {
          propertyTitle: propertyTitle || '',
          price: price || '',
          nights: nights,
          userId: user.id,
          status: 'confirmed',
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.log('Error adding booking:', e);
    }
    setTimeout(() => {
      router.replace('/screens/booking-success' as any);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      {!confirmed ? (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Confirm Your Stay 🏨</Text>
          {propertyTitle && (
            <Text style={styles.propertyName} numberOfLines={2}>{propertyTitle}</Text>
          )}

          <View style={styles.nightsRow}>
            <Text style={styles.nightsLabel}>Number of nights</Text>
            <View style={styles.nightsControl}>
              <TouchableOpacity
                onPress={() => setNights(n => Math.max(1, n - 1))}
                style={styles.nightBtn}
              >
                <MaterialCommunityIcons name="minus" size={18} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={styles.nightsValue}>{nights}</Text>
              <TouchableOpacity
                onPress={() => setNights(n => n + 1)}
                style={styles.nightBtn}
              >
                <MaterialCommunityIcons name="plus" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{price} × {nights} night{nights > 1 ? 's' : ''}</Text>
              <Text style={styles.summaryValue}>Calculated at checkout</Text>
            </View>
            <View style={styles.divider} />
            <View style={[styles.summaryRow, { marginTop: 2 }]}>
              <Text style={[styles.summaryLabel, { fontWeight: FontWeight.bold, color: Colors.text }]}>Total estimate</Text>
              <Text style={[styles.summaryValue, { color: Colors.airbnb, fontWeight: FontWeight.bold }]}>
                {nights} night{nights > 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Button label="Confirm Booking" onPress={handleConfirm} variant="success" style={{ flex: 1 }} />
            <Button label="Cancel" onPress={() => router.back()} variant="outline" style={{ flex: 1 }} />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.confirmedContainer}>
          <View style={styles.confirmedIcon}>
            <Text style={styles.confirmedEmoji}>🎉</Text>
          </View>
          <Text style={styles.confirmedTitle}>Booking Confirmed!</Text>
          <Text style={styles.confirmedMsg}>Details sent to your messages.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  body: { padding: Spacing.xl, gap: Spacing.md, paddingBottom: 40 },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text },
  propertyName: { fontSize: FontSize.sm, color: Colors.muted },
  nightsRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: Spacing.sm,
  },
  nightsLabel: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  nightsControl: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  nightBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  nightsValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, minWidth: 30, textAlign: 'center' },
  summaryCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.border,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.base, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  confirmedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
  confirmedIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.successLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md, ...Shadow.md,
  },
  confirmedEmoji: { fontSize: 40 },
  confirmedTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text },
  confirmedMsg: { fontSize: FontSize.base, color: Colors.muted, textAlign: 'center' },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { MOVER_PROVIDERS } from '../../constants/mockData';
import { useAuth } from '../../context/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function MoversScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookingMoverId, setBookingMoverId] = useState<string | null>(null);

  const handleBookMover = async (mover: typeof MOVER_PROVIDERS[0]) => {
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'Please log in or sign up to book moving services.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/screens/auth' as any) }
        ]
      );
      return;
    }

    Alert.alert(
      `Confirm Booking`,
      `Request a booking with ${mover.name}?\n\nAn agent will call you at ${user.phone || 'your registered number'} to coordinate.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Booking',
          onPress: async () => {
            setBookingMoverId(mover.id);
            try {
              const bookingData = {
                bookingId: `RT-MOVE-${Math.floor(100000 + Math.random() * 900000)}`,
                userId: user.id,
                customerName: user.name || 'Rentify User',
                customerPhone: user.phone || '',
                moverId: mover.id,
                moverName: mover.name,
                priceEstimate: mover.priceEstimate,
                status: 'pending',
                createdAt: new Date().toISOString(),
              };

              // 1. Save moving booking request to Firestore
              await addDoc(collection(db, 'movingBookings'), bookingData);

              // 2. Alert and call option
              Alert.alert(
                '🎉 Request Placed!',
                `${mover.name} has received your request. You can also call them directly:`,
                [
                  {
                    text: '📞 Call Mover (0789186476)',
                    onPress: () => {
                      const { Linking } = require('react-native');
                      Linking.openURL("tel:0789186476").catch(() => {
                        Alert.alert("Error", "Could not place call to 0789186476");
                      });
                    }
                  },
                  { text: 'Done', style: 'default' }
                ]
              );
            } catch (e: any) {
              console.log('Error creating moving booking:', e);
              Alert.alert('Booking Failed', 'Unable to place request. Please try again.');
            } finally {
              setBookingMoverId(null);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Moving Services</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Need Help Moving In? 🚚</Text>
        <Text style={styles.subtitle}>Choose a verified mover near you</Text>

        {MOVER_PROVIDERS.map(mover => (
          <View key={mover.id} style={styles.moverCard}>
            <View style={styles.moverLeft}>
              <View style={styles.moverAvatar}>
                <MaterialCommunityIcons name="truck" size={24} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.moverNameRow}>
                  <Text style={styles.moverName}>{mover.name}</Text>
                  {mover.isVerified && (
                    <MaterialCommunityIcons name="shield-check" size={15} color={Colors.trust} />
                  )}
                </View>
                <Text style={styles.moverPrice}>{mover.priceEstimate}</Text>
                <View style={styles.ratingRow}>
                  <MaterialCommunityIcons name="star" size={13} color={Colors.warning} />
                  <Text style={styles.moverRating}>{mover.rating}</Text>
                  <Text style={styles.moverTime}>· {mover.responseTime}</Text>
                </View>
              </View>
            </View>
            {bookingMoverId === mover.id ? (
              <ActivityIndicator color={Colors.primary} style={{ marginRight: 12 }} />
            ) : (
              <Button label="Book" onPress={() => handleBookMover(mover)} size="sm" />
            )}
          </View>
        ))}

        {/* ── Furniture & beddings upsell ─────────────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/screens/furniture-shop?from=movers' as any)}
          style={styles.upsellCard}
        >
          <LinearGradient
            colors={['#D97706', '#F59E0B']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.upsellGradient}
          >
            <Text style={{ fontSize: 26 }}>🛋️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.upsellTitle}>Need Furniture Too?</Text>
              <Text style={styles.upsellSub}>Beds, sofas & beddings delivered to your door</Text>
            </View>
            <MaterialCommunityIcons name="arrow-right" size={18} color="rgba(255,255,255,0.9)" />
          </LinearGradient>
        </TouchableOpacity>

        <Button label="No Thanks" onPress={() => router.back()} variant="ghost" fullWidth style={{ marginTop: Spacing.sm }} />
      </ScrollView>
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
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  body: { padding: Spacing.base, gap: Spacing.sm, paddingBottom: 40 },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.muted, marginBottom: Spacing.md },
  moverCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md, borderRadius: Radius.xl,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  moverLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  moverAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  moverNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  moverName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  moverPrice: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium, marginBottom: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  moverRating: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  moverTime: { fontSize: FontSize.sm, color: Colors.muted },
  upsellCard: { borderRadius: Radius.xl, overflow: 'hidden', marginTop: Spacing.md, ...Shadow.sm },
  upsellGradient: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.base },
  upsellTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#fff' },
  upsellSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
});

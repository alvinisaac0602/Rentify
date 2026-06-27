import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

export default function BookingSuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      <View style={styles.body}>
        <Text style={styles.confetti}>🎉</Text>
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>
          Details have been sent to your Messages. Your host will reach out shortly.
        </Text>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="message-text" size={22} color={Colors.primary} />
          <Text style={styles.infoText}>Check your Messages for next steps</Text>
        </View>

        {/* Furniture upsell */}
        <TouchableOpacity
          style={styles.upsellCard}
          activeOpacity={0.88}
          onPress={() => router.push('/screens/furniture-shop?from=booking' as any)}
        >
          <LinearGradient
            colors={['#D97706', '#F59E0B']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.upsellGradient}
          >
            <Text style={styles.upsellEmoji}>🛋️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.upsellTitle}>Furnish Your New Place</Text>
              <Text style={styles.upsellSub}>Beds, sofas & beddings — delivered fast</Text>
            </View>
            <MaterialCommunityIcons name="arrow-right" size={18} color="rgba(255,255,255,0.9)" />
          </LinearGradient>
        </TouchableOpacity>

        <Button
          label="View Messages 💬"
          onPress={() => { router.dismissAll?.(); router.push('/messages' as any); }}
          fullWidth
          style={{ marginBottom: Spacing.sm }}
        />
        <Button
          label="Back to Listings"
          onPress={() => { router.dismissAll?.(); }}
          variant="ghost"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: {
    flex: 1, padding: Spacing.xl, alignItems: 'center',
    justifyContent: 'center', gap: Spacing.md,
  },
  confetti: { fontSize: 64, marginBottom: Spacing.sm },
  title: {
    fontSize: FontSize['2xl'], fontWeight: FontWeight.bold,
    color: Colors.text, textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.base, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primaryLight, borderRadius: Radius.md,
    padding: Spacing.base, width: '100%',
  },
  infoText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.medium, flex: 1 },
  upsellCard: { width: '100%', borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
  upsellGradient: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.base },
  upsellEmoji: { fontSize: 24 },
  upsellTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#fff' },
  upsellSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
});

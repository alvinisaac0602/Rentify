import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

export default function BookingSuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
});

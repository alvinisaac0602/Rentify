import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../ui/Button';

interface BookingSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  onViewMessages: () => void;
}

export function BookingSuccessModal({ visible, onClose, onViewMessages }: BookingSuccessModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <StatusBar style="auto" />
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.confetti}>🎉</Text>
          <Text style={styles.title}>Booking Confirmed!</Text>
          <Text style={styles.subtitle}>
            Details have been sent to your Messages. Your host will reach out shortly.
          </Text>

          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="message-text" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>Check your Messages for next steps</Text>
          </View>

          <Button
            label="View Messages 💬"
            onPress={onViewMessages}
            fullWidth
            style={{ marginBottom: Spacing.sm }}
          />
          <Button label="Back to Listings" onPress={onClose} variant="ghost" fullWidth />
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
  confetti: { fontSize: 52, marginBottom: Spacing.md },
  title: {
    fontSize: FontSize['2xl'], fontWeight: FontWeight.bold,
    color: Colors.text, textAlign: 'center', marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.base, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22, marginBottom: Spacing.lg,
  },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primaryLight, borderRadius: Radius.md,
    padding: Spacing.md, width: '100%', marginBottom: Spacing.xl,
  },
  infoText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.medium },
});

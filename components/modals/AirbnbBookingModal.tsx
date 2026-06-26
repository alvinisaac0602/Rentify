import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../ui/Button';

interface AirbnbBookingModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  propertyTitle: string;
  price: string;
}

export function AirbnbBookingModal({ visible, onClose, onConfirm, propertyTitle, price }: AirbnbBookingModalProps) {
  const [nights, setNights] = useState(2);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => { setConfirmed(false); onConfirm(); }, 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <StatusBar style="auto" />
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        {!confirmed ? (
          <>
            <Text style={styles.title}>Confirm Your Stay 🏨</Text>
            <Text style={styles.propertyName} numberOfLines={2}>{propertyTitle}</Text>

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
              <Button label="Cancel" onPress={onClose} variant="outline" style={{ flex: 1 }} />
            </View>
          </>
        ) : (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Text style={styles.successEmoji}>🎉</Text>
            </View>
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successMsg}>Details sent to your messages.</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: Colors.overlay },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: Spacing.xl, paddingTop: Spacing.md, ...Shadow.lg,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg,
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 4 },
  propertyName: { fontSize: FontSize.sm, color: Colors.muted, marginBottom: Spacing.lg },
  nightsRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.lg,
  },
  nightsLabel: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  nightsControl: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  nightBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  nightsValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, minWidth: 28, textAlign: 'center' },
  summaryCard: {
    backgroundColor: Colors.bg, borderRadius: Radius.lg,
    padding: Spacing.base, marginBottom: Spacing.lg,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.base, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  successContainer: { alignItems: 'center', paddingVertical: Spacing['3xl'], gap: Spacing.md },
  successIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.successLight, alignItems: 'center', justifyContent: 'center',
  },
  successEmoji: { fontSize: 36 },
  successTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  successMsg: { fontSize: FontSize.base, color: Colors.muted, textAlign: 'center' },
});

import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../ui/Button';

interface ListingReviewModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ListingReviewModal({ visible, onClose }: ListingReviewModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.icon}>
            <MaterialCommunityIcons name="magnify-scan" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Listing Under Review 🔍</Text>
          <Text style={styles.description}>
            Your property has been submitted successfully. Our verification team will review it within 24–48 hours.
          </Text>
          <View style={styles.steps}>
            {[
              { step: '1', text: 'Listing received', done: true },
              { step: '2', text: 'Identity verification', done: false },
              { step: '3', text: 'Property confirmation', done: false },
              { step: '4', text: 'Published live', done: false },
            ].map(s => (
              <View key={s.step} style={styles.stepRow}>
                <View style={[styles.stepDot, s.done && { backgroundColor: Colors.success }]}>
                  {s.done
                    ? <MaterialCommunityIcons name="check" size={12} color={Colors.white} />
                    : <Text style={styles.stepNum}>{s.step}</Text>
                  }
                </View>
                <Text style={[styles.stepText, s.done && { color: Colors.success, fontWeight: FontWeight.semibold }]}>
                  {s.text}
                </Text>
              </View>
            ))}
          </View>
          <Button label="Got it!" onPress={onClose} fullWidth />
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
  icon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl, fontWeight: FontWeight.bold,
    color: Colors.text, textAlign: 'center', marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.base, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22, marginBottom: Spacing.lg,
  },
  steps: { width: '100%', gap: Spacing.sm, marginBottom: Spacing.xl },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNum: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.muted },
  stepText: { fontSize: FontSize.base, color: Colors.textSecondary },
});

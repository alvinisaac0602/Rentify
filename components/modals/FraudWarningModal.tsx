import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../ui/Button';

interface FraudWarningModalProps {
  visible: boolean;
  onClose: () => void;
  onReport: () => void;
  onContinue: () => void;
}

export function FraudWarningModal({ visible, onClose, onReport, onContinue }: FraudWarningModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <StatusBar style="auto" />
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.warningIcon}>
            <MaterialCommunityIcons name="alert-circle" size={36} color={Colors.warning} />
          </View>
          <Text style={styles.title}>⚠️ Unverified Listing</Text>
          <Text style={styles.description}>
            This listing has not been fully verified by Rentify. Proceed with extra caution — never pay without a physical inspection.
          </Text>

          <View style={styles.checklist}>
            {[
              'Never pay before viewing',
              'Always verify ownership documents',
              'Report suspicious activity',
            ].map(tip => (
              <View key={tip} style={styles.checkRow}>
                <MaterialCommunityIcons name="alert-outline" size={14} color={Colors.warning} />
                <Text style={styles.checkText}>{tip}</Text>
              </View>
            ))}
          </View>

          <Button
            label="🚨 Report This Listing"
            onPress={onReport}
            variant="danger"
            fullWidth
            style={{ marginBottom: Spacing.sm }}
          />
          <Button
            label="Continue Anyway"
            onPress={onContinue}
            variant="ghost"
            fullWidth
          />
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
  warningIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.warningLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl, fontWeight: FontWeight.bold,
    color: Colors.text, textAlign: 'center', marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.base, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22, marginBottom: Spacing.lg,
  },
  checklist: {
    width: '100%', gap: Spacing.sm,
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  checkText: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.medium },
});

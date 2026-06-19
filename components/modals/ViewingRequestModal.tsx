import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../ui/Button';

interface ViewingRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSent: () => void;
  propertyTitle: string;
}

const TIMES = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'];

export function ViewingRequestModal({ visible, onClose, onSent, propertyTitle }: ViewingRequestModalProps) {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!selectedTime) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onSent();
    }, 2200);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        {!sent ? (
          <>
            <Text style={styles.title}>Request a Viewing 📅</Text>
            <Text style={styles.subtitle} numberOfLines={2}>{propertyTitle}</Text>

            <Text style={styles.label}>Choose a preferred time</Text>
            <View style={styles.timeGrid}>
              {TIMES.map(t => (
                <TouchableOpacity
                  key={t}
                  activeOpacity={0.78}
                  onPress={() => setSelectedTime(t)}
                  style={[styles.timeChip, selectedTime === t && styles.timeChipActive]}
                >
                  <Text style={[styles.timeText, selectedTime === t && styles.timeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="E.g. I'm interested in 2 bedrooms only..."
              placeholderTextColor={Colors.placeholder}
              style={styles.noteInput}
              multiline
              numberOfLines={3}
            />

            <Button
              label="Send Viewing Request"
              onPress={handleSend}
              disabled={!selectedTime}
              fullWidth
            />
          </>
        ) : (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <MaterialCommunityIcons name="send-check" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.successTitle}>Viewing Request Sent 📩</Text>
            <Text style={styles.successMessage}>
              The owner will respond shortly. Check your messages for updates.
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.xl,
    paddingTop: Spacing.md,
    ...Shadow.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  timeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  timeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  timeTextActive: {
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
  noteInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.base,
    color: Colors.text,
    backgroundColor: Colors.bg,
    marginBottom: Spacing.base,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    gap: Spacing.md,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

const TIMES = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'];

export default function ViewingRequestScreen() {
  const router = useRouter();
  const { propertyTitle } = useLocalSearchParams<{ propertyTitle?: string }>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!selectedTime) return;
    setSent(true);
    setTimeout(() => {
      router.replace('/screens/movers' as any);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request a Viewing</Text>
        <View style={{ width: 40 }} />
      </View>

      {!sent ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Request a Viewing 📅</Text>
          {propertyTitle && (
            <Text style={styles.subtitle} numberOfLines={2}>{propertyTitle}</Text>
          )}

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
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <MaterialCommunityIcons name="send-check" size={44} color={Colors.primary} />
          </View>
          <Text style={styles.successTitle}>Viewing Request Sent 📩</Text>
          <Text style={styles.successMessage}>
            The owner will respond shortly. Check your messages for updates.
          </Text>
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
  body: { padding: Spacing.xl, gap: Spacing.sm, paddingBottom: 40 },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: FontSize.sm, color: Colors.muted, marginBottom: Spacing.lg },
  label: {
    fontSize: FontSize.sm, fontWeight: FontWeight.semibold,
    color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm,
  },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  timeChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 9,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  timeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  timeTextActive: { color: Colors.white, fontWeight: FontWeight.semibold },
  noteInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    padding: Spacing.md, fontSize: FontSize.base, color: Colors.text,
    backgroundColor: Colors.surface, marginBottom: Spacing.lg,
    textAlignVertical: 'top', minHeight: 90,
  },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
  successIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md, ...Shadow.md,
  },
  successTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text, textAlign: 'center' },
  successMessage: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});

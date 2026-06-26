import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

export default function FraudWarningScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Warning</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.warningIcon}>
          <MaterialCommunityIcons name="alert-circle" size={44} color={Colors.warning} />
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
              <MaterialCommunityIcons name="alert-outline" size={16} color={Colors.warning} />
              <Text style={styles.checkText}>{tip}</Text>
            </View>
          ))}
        </View>

        <Button
          label="🚨 Report This Listing"
          onPress={() => router.back()}
          variant="danger"
          fullWidth
          style={{ marginBottom: Spacing.sm }}
        />
        <Button
          label="Continue Anyway"
          onPress={() => router.back()}
          variant="ghost"
          fullWidth
        />
      </View>
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
  body: {
    flex: 1, padding: Spacing.xl, alignItems: 'center',
    justifyContent: 'center', gap: Spacing.md,
  },
  warningIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.warningLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  title: {
    fontSize: FontSize['2xl'], fontWeight: FontWeight.bold,
    color: Colors.text, textAlign: 'center',
  },
  description: {
    fontSize: FontSize.base, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  checklist: {
    width: '100%', gap: Spacing.sm,
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md, padding: Spacing.base,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  checkText: { fontSize: FontSize.base, color: Colors.text, fontWeight: FontWeight.medium, flex: 1 },
});

import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

export default function SavedConfirmScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      <View style={styles.inner}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="heart" size={36} color={Colors.white} />
        </View>

        <Text style={styles.title}>Saved to Collection</Text>
        <Text style={styles.subtitle}>
          This listing has been added to your favorites. You can access it anytime from your Saved screen.
        </Text>

        <View style={styles.btnRow}>
          <Button
            label="View Saved"
            onPress={() => { router.back(); router.push('/saved' as any); }}
            fullWidth
            style={{ marginBottom: Spacing.sm }}
          />
          <Button
            label="Continue Browsing"
            onPress={() => router.back()}
            variant="outline"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  inner: {
    flex: 1, padding: Spacing.xl, alignItems: 'center',
    justifyContent: 'center', gap: Spacing.md,
  },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.danger, alignItems: 'center',
    justifyContent: 'center', marginBottom: Spacing.md,
    ...Shadow.md,
  },
  title: {
    fontSize: FontSize['2xl'], fontWeight: FontWeight.bold,
    color: Colors.text, textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.base, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  btnRow: { width: '100%', gap: Spacing.sm, marginTop: Spacing.md },
});

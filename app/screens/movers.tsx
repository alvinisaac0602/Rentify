import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { MOVER_PROVIDERS } from '../../constants/mockData';

export default function MoversScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Moving Services</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Need Help Moving In? 🚚</Text>
        <Text style={styles.subtitle}>Choose a verified mover near you</Text>

        {MOVER_PROVIDERS.map(mover => (
          <View key={mover.id} style={styles.moverCard}>
            <View style={styles.moverLeft}>
              <View style={styles.moverAvatar}>
                <MaterialCommunityIcons name="truck" size={24} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.moverNameRow}>
                  <Text style={styles.moverName}>{mover.name}</Text>
                  {mover.isVerified && (
                    <MaterialCommunityIcons name="shield-check" size={15} color={Colors.trust} />
                  )}
                </View>
                <Text style={styles.moverPrice}>{mover.priceEstimate}</Text>
                <View style={styles.ratingRow}>
                  <MaterialCommunityIcons name="star" size={13} color={Colors.warning} />
                  <Text style={styles.moverRating}>{mover.rating}</Text>
                  <Text style={styles.moverTime}>· {mover.responseTime}</Text>
                </View>
              </View>
            </View>
            <Button
              label="Book"
              onPress={() => router.back()}
              size="sm"
            />
          </View>
        ))}

        <Button
          label="No Thanks"
          onPress={() => router.back()}
          variant="ghost"
          fullWidth
          style={{ marginTop: Spacing.sm }}
        />
      </ScrollView>
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
  body: { padding: Spacing.base, gap: Spacing.sm, paddingBottom: 40 },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.muted, marginBottom: Spacing.md },
  moverCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md, borderRadius: Radius.xl,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    ...Shadow.sm,
  },
  moverLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  moverAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  moverNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  moverName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  moverPrice: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium, marginBottom: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  moverRating: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  moverTime: { fontSize: FontSize.sm, color: Colors.muted },
});

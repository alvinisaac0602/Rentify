import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { MOCK_PROPERTIES } from '../../constants/mockData';
import { PropertyCard } from '../../components/ui/PropertyCard';
import { useAuth } from '../../context/AuthContext';

export default function SavedScreen() {
  const { isGuest, requireAuth } = useAuth();
  const router = useRouter();
  const [savedIds, setSavedIds] = useState<string[]>(['p1', 'p9', 'p4']);

  const savedProperties = MOCK_PROPERTIES.filter(p => savedIds.includes(p.id));

  const handleRemove = (id: string) => {
    setSavedIds(prev => prev.filter(x => x !== id));
  };

  if (isGuest) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ height: Spacing.sm }} />

        {/* Guest Center Mode */}
        <View style={styles.centerContainer}>
          <LinearGradient
            colors={[Colors.primaryLight, 'rgba(235, 245, 255, 0.25)']}
            style={styles.guestCard}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="heart-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.guestTitle}>Unlock Your Collection</Text>
            <Text style={styles.guestSubtitle}>
              Sign in to save and monitor apartments, offices, and shops that fit your requirements.
            </Text>
            
            <TouchableOpacity
              style={styles.signInBtn}
              activeOpacity={0.85}
              onPress={() => requireAuth('Sign in to view your saved properties')}
            >
              <Text style={styles.signInText}>Sign In / Register</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>{savedProperties.length} spaces secured</Text>
        </View>
        {savedProperties.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => setSavedIds([])}
            activeOpacity={0.75}
          >
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {savedProperties.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons name="heart-broken-outline" size={38} color={Colors.muted} />
          </View>
          <Text style={styles.emptyTitle}>Your collection is empty</Text>
          <Text style={styles.emptySubtitle}>
            Browse properties and tap the heart icon to save listings that catch your eye.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/explore' as any)}
          >
            <Text style={styles.exploreBtnText}>Browse Listings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedProperties}
          keyExtractor={p => p.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <PropertyCard
                property={item}
                isSaved
                onSave={() => handleRemove(item.id)}
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing.md,
  },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.xs, color: Colors.muted, fontWeight: FontWeight.medium, marginTop: 2 },
  clearBtn: { paddingVertical: 4, paddingHorizontal: Spacing.sm },
  clearText: { fontSize: FontSize.sm, color: Colors.danger, fontWeight: FontWeight.semibold },
  list: { padding: Spacing.base, gap: Spacing.md, paddingBottom: 120 },
  cardWrapper: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    ...Shadow.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: 40,
  },
  guestCard: {
    padding: Spacing.xl,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary + '15',
    ...Shadow.sm,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  guestTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  guestSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  signInBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 13,
    borderRadius: Radius.full,
    width: '100%',
    alignItems: 'center',
    ...Shadow.sm,
  },
  signInText: { color: Colors.white, fontSize: FontSize.base, fontWeight: FontWeight.bold },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 80,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.xs },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  exploreBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 13,
    borderRadius: Radius.full,
    ...Shadow.sm,
  },
  exploreBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: FontWeight.bold },
});

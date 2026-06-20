import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, CategoryType } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { MOCK_PROPERTIES } from '../../constants/mockData';
import { CategoryCard } from '../../components/ui/CategoryCard';
import { PropertyCard } from '../../components/ui/PropertyCard';
import { useWelcomeModal } from '../../hooks/useWelcomeModal';
import { useAuth } from '../../context/AuthContext';

const LOCATIONS = ['Kampala', 'Ntinda', 'Kira', 'Nakawa', 'Kololo', 'Entebbe'];
const CATEGORIES: CategoryType[] = ['apartment', 'hostel', 'shop', 'airbnb'];

export default function HomeScreen() {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const { shouldShow, dismiss } = useWelcomeModal();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Kampala');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Check if onboarding has been seen — redirect if not
  useEffect(() => {
    AsyncStorage.getItem('onboarding_done').then(val => {
      if (!val) router.replace('/onboarding' as any);
      else if (shouldShow) router.push('/screens/welcome' as any);
    });
  }, []);

  const featuredProperties = MOCK_PROPERTIES.filter(p => p.isVerified).slice(0, 6);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}` as any);
    } else {
      router.push('/explore' as any);
    }
  };

  const handleSave = (id: string) => {
    if (!requireAuth('Sign in to save properties')) return;
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    router.push('/screens/saved-confirm' as any);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setRefreshing(false);
  };

  const getGreetingText = () => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good day';
    if (hour >= 5 && hour < 12) {
      timeGreeting = 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good afternoon';
    } else if (hour >= 17 && hour < 22) {
      timeGreeting = 'Good evening';
    } else {
      timeGreeting = 'Good night';
    }
    return `${timeGreeting} from ${selectedLocation}! 👋`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <LinearGradient
          colors={[Colors.primary, '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreetingText()}</Text>
              <Text style={styles.tagline}>Find your perfect space</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <MaterialCommunityIcons name="bell-outline" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity activeOpacity={0.92} onPress={handleSearch} style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.muted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search apartments, hostels, shops, Airbnbs…"
              placeholderTextColor={Colors.placeholder}
              style={styles.searchInput}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close-circle" size={18} color={Colors.muted} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationScroll}>
            {LOCATIONS.map(loc => (
              <TouchableOpacity
                key={loc}
                onPress={() => setSelectedLocation(loc)}
                style={[styles.locationPill, selectedLocation === loc && styles.locationPillActive]}
              >
                <MaterialCommunityIcons
                  name="map-marker"
                  size={12}
                  color={selectedLocation === loc ? Colors.white : 'rgba(255,255,255,0.7)'}
                />
                <Text style={[styles.locationText, selectedLocation === loc && styles.locationTextActive]}>
                  {loc}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What are you looking for?</Text>
          </View>
          <View style={styles.categoryGrid}>
            {CATEGORIES.slice(0, 2).map(cat => (
              <View key={cat} style={{ flex: 1 }}><CategoryCard category={cat} /></View>
            ))}
          </View>
          <View style={styles.categoryGrid}>
            {CATEGORIES.slice(2, 4).map(cat => (
              <View key={cat} style={{ flex: 1 }}><CategoryCard category={cat} /></View>
            ))}
          </View>

          <View style={styles.trustBanner}>
            <LinearGradient
              colors={[Colors.trustLight, Colors.primaryLight]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.trustGradient}
            >
              <MaterialCommunityIcons name="shield-check" size={28} color={Colors.trust} />
              <View style={{ flex: 1 }}>
                <Text style={styles.trustTitle}>Trust First, Always</Text>
                <Text style={styles.trustSubtitle}>Every listing verified by our team</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/explore' as any)}>
                <Text style={styles.trustCta}>Learn more →</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Listings</Text>
            <TouchableOpacity onPress={() => router.push('/explore' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredProperties}
            keyExtractor={p => p.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            ItemSeparatorComponent={() => <View style={{ width: Spacing.md }} />}
            renderItem={({ item }) => (
              <View style={{ width: 240 }}>
                <PropertyCard property={item} isSaved={savedIds.includes(item.id)} onSave={() => handleSave(item.id)} />
              </View>
            )}
          />

          <View style={styles.statsRow}>
            {[
              { label: 'Verified Listings', value: '2,400+', icon: 'shield-check', color: Colors.trust },
              { label: 'Happy Tenants', value: '15K+', icon: 'account-group', color: Colors.success },
              { label: 'Districts Covered', value: '12', icon: 'map-marker-multiple', color: Colors.warning },
            ].map(s => (
              <View key={s.label} style={styles.statCard}>
                <MaterialCommunityIcons name={s.icon as any} size={22} color={s.color} />
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Near {selectedLocation}</Text>
            <TouchableOpacity onPress={() => router.push('/explore' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.nearbyGrid}>
            {MOCK_PROPERTIES.slice(4, 8).map(p => (
              <View key={p.id}>
                <PropertyCard property={p} isSaved={savedIds.includes(p.id)} onSave={() => handleSave(p.id)} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  headerGradient: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.xl + 4, gap: Spacing.md },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', fontWeight: FontWeight.medium },
  tagline: { fontSize: FontSize['2xl'], color: Colors.white, fontWeight: FontWeight.bold, marginTop: 2 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.white, borderRadius: Radius.xl, paddingHorizontal: Spacing.md, paddingVertical: 6, ...Shadow.md },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  locationScroll: { marginTop: 4 },
  locationPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', marginRight: Spacing.sm },
  locationPillActive: { backgroundColor: 'rgba(255,255,255,0.25)', borderColor: Colors.white },
  locationText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', fontWeight: FontWeight.medium },
  locationTextActive: { color: Colors.white, fontWeight: FontWeight.semibold },
  body: { padding: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing['4xl'] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.base, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  categoryGrid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  trustBanner: { marginVertical: Spacing.sm, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
  trustGradient: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.base },
  trustTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.trust },
  trustSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  trustCta: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  horizontalList: { paddingRight: Spacing.base },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginVertical: Spacing.sm },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', gap: 4, ...Shadow.sm },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs, color: Colors.muted, textAlign: 'center', fontWeight: FontWeight.medium },
  nearbyGrid: { gap: Spacing.md },
});

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { TrustBadge } from '../../components/ui/TrustBadge';

const MENU_ITEMS = [
  { icon: 'home-city-outline', label: 'My Properties', sublabel: 'Manage your listings', action: 'landlord' },
  { icon: 'heart-outline', label: 'Saved Properties', sublabel: 'Your favorites collection', action: 'saved' },
  { icon: 'message-text-outline', label: 'Messages', sublabel: 'Chats with landlords & tenants', action: 'messages' },
  { icon: 'calendar-clock-outline', label: 'Viewing Requests', sublabel: 'Upcoming viewings schedule', action: null },
  { icon: 'shield-check-outline', label: 'Verification Status', sublabel: 'Increase your tenant trust score', action: null },
  { icon: 'help-circle-outline', label: 'Help & Support', sublabel: 'Frequently asked questions', action: null },
  { icon: 'information-outline', label: 'About Rentify', sublabel: 'App version 1.2.0', action: null },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isGuest, requireAuth, signOut, toggleLandlordMode, isLandlord } = useAuth();

  const handleMenuPress = (action: string | null) => {
    if (!action) return;
    if (action === 'landlord') {
      if (!requireAuth('Sign in to access landlord features')) return;
      router.push('/landlord/dashboard' as any);
    } else if (action === 'saved') {
      router.push('/saved');
    } else if (action === 'messages') {
      router.push('/messages' as any);
    }
  };

  if (isGuest) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ height: Spacing.sm }} />

        {/* Guest View card */}
        <View style={styles.guestCenter}>
          <LinearGradient
            colors={[Colors.primary, '#6366F1']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.guestCard}
          >
            <View style={styles.guestIconCircle}>
              <MaterialCommunityIcons name="account-circle-outline" size={42} color={Colors.primary} />
            </View>
            <Text style={styles.guestTitle}>Rentify Profile</Text>
            <Text style={styles.guestSubtitle}>
              Sign in to manage your bookings, message owners, list properties, and complete secure rentals.
            </Text>
            
            <TouchableOpacity
              style={styles.guestSignInBtn}
              activeOpacity={0.9}
              onPress={() => requireAuth('Create a free Rentify account')}
            >
              <Text style={styles.guestSignInText}>Sign In / Register</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Guest basic options */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.slice(5).map(item => (
            <TouchableOpacity key={item.label} style={styles.menuItem} onPress={() => handleMenuPress(item.action)}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight }]}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color={Colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSublabel}>{item.sublabel}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.muted} />
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={[styles.header, { justifyContent: 'flex-end' }]}>
          <TouchableOpacity style={styles.cogBtn} activeOpacity={0.75}>
            <MaterialCommunityIcons name="cog-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={[Colors.primary, '#4F46E5']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.profileGradient}
          >
            <Image
              source={{ uri: user?.avatar ?? 'https://i.pravatar.cc/150?img=10' }}
              style={styles.avatar}
            />
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.badgeRow}>
              <TrustBadge type="verified_landlord" size="sm" />
            </View>
          </LinearGradient>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            {[
              { label: 'Favorites', value: '3', icon: 'heart-outline', color: Colors.danger },
              { label: 'Viewings', value: '2', icon: 'calendar-outline', color: Colors.primary },
              { label: 'Bookings', value: '1', icon: 'checkbox-marked-circle-outline', color: Colors.success },
            ].map(s => (
              <View key={s.label} style={styles.statItem}>
                <MaterialCommunityIcons name={s.icon as any} size={18} color={s.color} />
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Switch Landlord Mode card */}
        <TouchableOpacity
          style={[styles.landlordToggle, isLandlord && styles.landlordToggleActive]}
          onPress={toggleLandlordMode}
          activeOpacity={0.9}
        >
          <View style={[styles.toggleIconCircle, isLandlord && styles.toggleIconCircleActive]}>
            <MaterialCommunityIcons
              name="home-switch-outline"
              size={20}
              color={isLandlord ? Colors.primary : Colors.white}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.landlordToggleText, isLandlord && { color: Colors.white }]}>
              {isLandlord ? 'Switch to Tenant View' : 'Switch to Landlord View'}
            </Text>
            <Text style={[styles.landlordToggleSub, isLandlord && { color: 'rgba(255,255,255,0.78)' }]}>
              {isLandlord ? 'Currently managing your properties' : 'List and manage properties on Rentify'}
            </Text>
          </View>
          <MaterialCommunityIcons
            name={isLandlord ? "toggle-switch" : "toggle-switch-off-outline"}
            size={36}
            color={isLandlord ? Colors.white : Colors.muted}
          />
        </TouchableOpacity>

        {/* Menu Cards */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index === MENU_ITEMS.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={() => handleMenuPress(item.action)}
              activeOpacity={0.75}
            >
              <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight }]}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color={Colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSublabel}>{item.sublabel}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.muted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out btn */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={signOut}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="logout-variant" size={20} color={Colors.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
  cogBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center',
  },
  profileCard: {
    marginHorizontal: Spacing.base, borderRadius: 20,
    overflow: 'hidden', ...Shadow.md, marginBottom: Spacing.base,
    backgroundColor: Colors.surface,
  },
  profileGradient: { alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.md, gap: Spacing.xs },
  avatar: { width: 78, height: 78, borderRadius: 39, borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)' },
  profileName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white, marginTop: 4 },
  profileEmail: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)' },
  badgeRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  statsBar: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  statLabel: { fontSize: FontSize.xs, color: Colors.muted, fontWeight: FontWeight.medium },
  landlordToggle: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginHorizontal: Spacing.base, marginBottom: Spacing.base,
    padding: Spacing.md, borderRadius: 16,
    backgroundColor: Colors.surface, borderWidth: 1.2, borderColor: Colors.border,
    ...Shadow.sm,
  },
  landlordToggleActive: {
    backgroundColor: Colors.primary, borderColor: Colors.primary,
  },
  toggleIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  toggleIconCircleActive: {
    backgroundColor: Colors.white,
  },
  landlordToggleText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  landlordToggleSub: { fontSize: FontSize.xs, color: Colors.muted, marginTop: 2 },
  menuSection: {
    backgroundColor: Colors.surface, marginHorizontal: Spacing.base,
    borderRadius: 20, ...Shadow.sm, marginBottom: Spacing.base,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md - 1,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 38, height: 38, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  menuSublabel: { fontSize: FontSize.xs, color: Colors.muted, marginTop: 2 },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, padding: Spacing.md, marginHorizontal: Spacing.base,
    borderRadius: 16, backgroundColor: Colors.dangerLight,
    borderWidth: 1.2, borderColor: Colors.danger + '22',
  },
  signOutText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.danger },
  guestCenter: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: 40,
  },
  guestCard: {
    padding: Spacing.xl,
    borderRadius: 24,
    alignItems: 'center',
    ...Shadow.md,
  },
  guestIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  guestTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.white, marginBottom: Spacing.xs },
  guestSubtitle: {
    fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)',
    textAlign: 'center', lineHeight: 20, marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  guestSignInBtn: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 13,
    borderRadius: Radius.full,
    width: '100%',
    alignItems: 'center',
    ...Shadow.sm,
  },
  guestSignInText: { color: Colors.primary, fontSize: FontSize.base, fontWeight: FontWeight.bold },
});

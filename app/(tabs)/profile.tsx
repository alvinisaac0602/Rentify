import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Switch, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { TrustBadge } from '../../components/ui/TrustBadge';
import { Avatar } from '../../components/ui/Avatar';
import { uploadAvatarImage } from '../../services/firebaseServices';
import { useTheme } from '../../context/ThemeContext';
import { VerificationModal } from '../../components/modals/VerificationModal';
import { FeedbackModal } from '../../components/modals/FeedbackModal';

const MENU_ITEMS = [
  { icon: 'home-city-outline', labelKey: 'my_properties', sublabel: 'Manage your listings', action: 'landlord' },
  { icon: 'heart-outline', labelKey: 'saved_properties', sublabel: 'Your favorites collection', action: 'saved' },
  { icon: 'message-text-outline', labelKey: 'messages', sublabel: 'Chats with landlords & tenants', action: 'messages' },
  { icon: 'calendar-clock-outline', labelKey: 'viewing_requests', sublabel: 'Upcoming viewings schedule', action: null },
  { icon: 'shield-check-outline', labelKey: 'verification_status', sublabel: 'Increase your tenant trust score', action: 'verification' },
  { icon: 'comment-quote-outline', labelKey: 'give_feedback', sublabel: 'Share suggestions or report bugs', action: 'feedback' },
  { icon: 'file-document-outline', labelKey: 'privacy_terms', sublabel: 'Privacy Policy & Terms of Service', action: 'legal' },
  { icon: 'shield-alert-outline', labelKey: 'delete_account', sublabel: 'Permanently remove your account and data', action: 'delete_account' },
  { icon: 'information-outline', labelKey: 'about_rentify', sublabel: 'App version 1.2.0', action: null },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isGuest, requireAuth, signOut, toggleLandlordMode, isLandlord, updateUserAvatar } = useAuth();
  const { theme, toggleTheme, language, setLanguage, t } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'en': return 'English';
      case 'es': return 'Español';
      case 'fr': return 'Français';
      case 'de': return 'Deutsch';
      case 'sw': return 'Kiswahili';
      default: return 'English';
    }
  };

  const handleLanguagePress = () => {
    Alert.alert(
      t('select_language'),
      '',
      [
        { text: 'English', onPress: () => setLanguage('en') },
        { text: 'Español', onPress: () => setLanguage('es') },
        { text: 'Français', onPress: () => setLanguage('fr') },
        { text: 'Deutsch', onPress: () => setLanguage('de') },
        { text: 'Kiswahili', onPress: () => setLanguage('sw') },
        { text: t('cancel'), style: 'cancel' }
      ]
    );
  };

  const handlePickAvatar = async () => {
    if (!user) return;

    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photos to update your profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const selectedUri = result.assets[0].uri;
      setUploading(true);
      try {
        const downloadUrl = await uploadAvatarImage(user.id, selectedUri);
        await updateUserAvatar(downloadUrl);
        Alert.alert(t('success'), t('profile_photo_updated'));
      } catch (err: any) {
        Alert.alert('Upload Error', err.message || 'Failed to upload profile photo.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your Rentify account? This action cannot be undone, and all your listings, saved properties, and messages will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Permanent", 
          style: "destructive", 
          onPress: () => {
            signOut();
            Alert.alert("Account Deleted", "Your account and all associated data have been permanently removed.");
          } 
        }
      ]
    );
  };

  const handleMenuPress = (action: string | null) => {
    if (!action) return;
    if (action === 'landlord') {
      if (!requireAuth('Sign in to access landlord features')) return;
      router.push('/landlord/dashboard' as any);
    } else if (action === 'saved') {
      router.push('/saved');
    } else if (action === 'messages') {
      router.push('/messages' as any);
    } else if (action === 'legal') {
      router.push('/screens/legal' as any);
    } else if (action === 'verification') {
      if (!requireAuth('Sign in to view verification status')) return;
      setShowVerification(true);
    } else if (action === 'feedback') {
      setShowFeedback(true);
    } else if (action === 'delete_account') {
      handleDeleteAccount();
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
          {MENU_ITEMS.filter(item => item.action !== 'delete_account' && item.action !== 'landlord' && item.action !== 'saved' && item.action !== 'messages').map(item => (
            <TouchableOpacity key={item.labelKey} style={styles.menuItem} onPress={() => handleMenuPress(item.action)}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight }]}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color={Colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{t(item.labelKey)}</Text>
                <Text style={styles.menuSublabel}>{item.sublabel}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.muted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Guest Settings Options */}
        <View style={styles.menuSection}>
          {/* Dark Mode */}
          <View style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight }]}>
              <MaterialCommunityIcons name="weather-night" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>{t('dark_mode')}</Text>
              <Text style={styles.menuSublabel}>{theme === 'dark' ? 'Enabled' : 'Disabled'}</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>

          {/* Language */}
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={handleLanguagePress} activeOpacity={0.75}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight }]}>
              <MaterialCommunityIcons name="translate" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>{t('language')}</Text>
              <Text style={styles.menuSublabel}>{getLanguageLabel(language)}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.muted} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header Spacer */}
        <View style={{ height: Spacing.md }} />

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={[Colors.primary, '#4F46E5']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.profileGradient}
          >
            <TouchableOpacity 
              onPress={handlePickAvatar} 
              activeOpacity={0.8} 
              style={styles.avatarContainer}
              disabled={uploading}
            >
              <Avatar
                name={user?.name || ''}
                uri={user?.avatar}
                size={78}
                style={styles.avatar}
              />
              {uploading ? (
                <View style={[styles.editBadge, { backgroundColor: '#FFFFFF' }]}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                </View>
              ) : (
                <View style={styles.editBadge}>
                  <MaterialCommunityIcons name="camera" size={12} color={Colors.primary} />
                </View>
              )}
            </TouchableOpacity>
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
              key={item.labelKey}
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
                <Text style={styles.menuLabel}>{t(item.labelKey)}</Text>
                <Text style={styles.menuSublabel}>{item.sublabel}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.muted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings Options */}
        <View style={styles.menuSection}>
          {/* Dark Mode */}
          <View style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight }]}>
              <MaterialCommunityIcons name="weather-night" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>{t('dark_mode')}</Text>
              <Text style={styles.menuSublabel}>{theme === 'dark' ? 'Enabled' : 'Disabled'}</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>

          {/* Language */}
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={handleLanguagePress} activeOpacity={0.75}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight }]}>
              <MaterialCommunityIcons name="translate" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>{t('language')}</Text>
              <Text style={styles.menuSublabel}>{getLanguageLabel(language)}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Sign Out btn */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={signOut}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="logout-variant" size={20} color={Colors.danger} />
          <Text style={styles.signOutText}>{t('sign_out')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <VerificationModal 
        visible={showVerification} 
        onClose={() => setShowVerification(false)} 
      />

      <FeedbackModal 
        visible={showFeedback} 
        onClose={() => setShowFeedback(false)} 
      />
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
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  avatar: { width: 78, height: 78, borderRadius: 39, borderWidth: 3, borderColor: 'rgba(255,255,255,0.7)' },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
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

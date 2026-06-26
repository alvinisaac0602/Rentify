import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';

type TabType = 'privacy' | 'terms';

export default function LegalScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('privacy');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Legal Agreements</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'privacy' && styles.activeTab]}
          onPress={() => setActiveTab('privacy')}
        >
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.activeTabText]}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'terms' && styles.activeTab]}
          onPress={() => setActiveTab('terms')}
        >
          <Text style={[styles.tabText, activeTab === 'terms' && styles.activeTabText]}>Terms of Service</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'privacy' ? (
          <View style={styles.textSection}>
            <Text style={styles.h1}>Privacy Policy</Text>
            <Text style={styles.meta}>Last Updated: June 26, 2026</Text>
            
            <Text style={styles.p}>
              At Rentify, we are committed to protecting your privacy. This Privacy Policy describes how we collect, use, and share your personal information when you use our mobile application.
            </Text>

            <Text style={styles.h2}>1. Information We Collect</Text>
            <Text style={styles.p}>
              We collect information you provide directly to us, such as your username, email address, phone number, and profile picture when registering. We also collect listings details, viewing notes, and communication logs.
            </Text>

            <Text style={styles.h2}>2. How We Use Information</Text>
            <Text style={styles.p}>
              We use your information to operate and improve Rentify, process viewing and booking requests, facilitate landlord-tenant communication, increase security (trust scores), and comply with legal requirements.
            </Text>

            <Text style={styles.h2}>3. Account Deletion Rights</Text>
            <Text style={styles.p}>
              You have the right to request deletion of your account and all associated personal data at any time. When you select 'Delete Account' in your profile settings, your personal data is permanently deleted from our databases.
            </Text>

            <Text style={styles.h2}>4. Security</Text>
            <Text style={styles.p}>
              We use appropriate technical and organizational measures to safeguard your personal data against unauthorized access, loss, or alteration.
            </Text>
          </View>
        ) : (
          <View style={styles.textSection}>
            <Text style={styles.h1}>Terms of Service</Text>
            <Text style={styles.meta}>Last Updated: June 26, 2026</Text>

            <Text style={styles.p}>
              Welcome to Rentify. By accessing or using our mobile application, you agree to comply with and be bound by these Terms of Service.
            </Text>

            <Text style={styles.h2}>1. User Accounts</Text>
            <Text style={styles.p}>
              You must provide accurate information when creating an account. You are solely responsible for all activities that occur under your account. We reserve the right to suspend accounts violating our guidelines.
            </Text>

            <Text style={styles.h2}>2. Acceptable Use Policy</Text>
            <Text style={styles.p}>
              You may not post fraudulent properties, spam other users, submit abusive reviews, or engage in malicious behavior. We enforce a zero-tolerance policy against objectionable content.
            </Text>

            <Text style={styles.h2}>3. Content Moderation & Reporting</Text>
            <Text style={styles.p}>
              Rentify features a moderation mechanism allowing any user to flag listings. If a listing is reported for fraud or inappropriate content, our moderation team will review and take down offending listings or block accounts within 24 hours.
            </Text>

            <Text style={styles.h2}>4. Limitation of Liability</Text>
            <Text style={styles.p}>
              Rentify acts as a listing platform and is not liable for transactions, disputes, or agreements made directly between landlords and tenants.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  tabsContainer: {
    flexDirection: 'row', padding: 4, marginHorizontal: Spacing.base,
    marginVertical: Spacing.md, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.lg,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.md },
  activeTab: { backgroundColor: Colors.white, ...Shadow.sm },
  tabText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  activeTabText: { color: Colors.primary },
  content: { padding: Spacing.xl },
  textSection: { gap: Spacing.md },
  h1: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text },
  meta: { fontSize: FontSize.xs, color: Colors.muted, marginBottom: Spacing.xs },
  h2: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text, marginTop: Spacing.md },
  p: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22 },
});

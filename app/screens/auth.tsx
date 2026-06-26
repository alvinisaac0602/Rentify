import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, authModalMessage } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (mode === 'login') {
      if (!email) return;
      setLoading(true);
      try {
        await signIn(email);
        router.back();
      } catch (err: any) {
        Alert.alert("Sign In Error", err.message || "Failed to sign in. Please verify your internet connection or email.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!username || !email || !phone) return;
      setLoading(true);
      try {
        await signIn(email, undefined, username, phone);
        router.back();
      } catch (err: any) {
        Alert.alert("Registration Error", err.message || "Failed to register. Please check your credentials.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand block */}
          <LinearGradient
            colors={[Colors.primary, '#7C3AED']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.brandBlock}
          >
            <Text style={styles.brandEmoji}>🏡</Text>
            <Text style={styles.brandName}>Rentify</Text>
          </LinearGradient>

          <Text style={styles.title}>
            {mode === 'login' ? 'Welcome back 👋' : 'Create account 🏠'}
          </Text>
          {!!authModalMessage && (
            <View style={styles.messageBanner}>
              <MaterialCommunityIcons name="information" size={16} color={Colors.primary} />
              <Text style={styles.messageText}>{authModalMessage}</Text>
            </View>
          )}

          {/* Username (register) */}
          {mode === 'register' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="account-outline" size={20} color={Colors.muted} />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="e.g. johndoe"
                  placeholderTextColor={Colors.placeholder}
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>
            </View>
          )}

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="email-outline" size={20} color={Colors.muted} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={Colors.placeholder}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>
          </View>

          {/* Phone Number (register) */}
          {mode === 'register' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="phone-outline" size={20} color={Colors.muted} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="e.g. +1 234 567 8900"
                  placeholderTextColor={Colors.placeholder}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </View>
            </View>
          )}

          <Button
            label={loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            style={{ marginTop: Spacing.md, marginBottom: Spacing.md }}
          />

          <TouchableOpacity onPress={() => setMode(m => m === 'login' ? 'register' : 'login')}>
            <Text style={styles.switchText}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.switchAction}>
                {mode === 'login' ? 'Register' : 'Sign In'}
              </Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            By continuing, you agree to Rentify's{' '}
            <Text style={{ color: Colors.primary }}>Terms</Text> and{' '}
            <Text style={{ color: Colors.primary }}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    flexDirection: 'row', justifyContent: 'flex-end',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
  },
  closeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center',
  },
  body: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
    alignItems: 'stretch',
  },
  brandBlock: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: Spacing.lg,
    gap: 2,
  },
  brandEmoji: { fontSize: 28 },
  brandName: {
    fontSize: FontSize.sm, fontWeight: FontWeight.bold,
    color: Colors.white, letterSpacing: 0.5,
  },
  title: {
    fontSize: FontSize['2xl'], fontWeight: FontWeight.bold,
    color: Colors.text, textAlign: 'center', marginBottom: Spacing.md,
  },
  messageBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primaryLight, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  messageText: { fontSize: FontSize.sm, color: Colors.primary, flex: 1, fontWeight: FontWeight.medium },
  inputGroup: { marginBottom: Spacing.md },
  inputLabel: {
    fontSize: FontSize.sm, fontWeight: FontWeight.semibold,
    color: Colors.text, marginBottom: 7,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  input: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  switchText: { textAlign: 'center', fontSize: FontSize.sm, color: Colors.muted },
  switchAction: { color: Colors.primary, fontWeight: FontWeight.semibold },
  terms: {
    textAlign: 'center', fontSize: FontSize.xs, color: Colors.muted,
    marginTop: Spacing.md, lineHeight: 18,
  },
});

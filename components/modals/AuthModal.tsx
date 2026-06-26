import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../ui/Button';

export function AuthModal() {
  const { showAuthModal, authModalMessage, signIn, dismissAuthModal } = useAuth();
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
      } catch (err: any) {
        Alert.alert("Registration Error", err.message || "Failed to register. Please check your credentials.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal
      visible={showAuthModal}
      animationType="slide"
      transparent
      onRequestClose={dismissAuthModal}
    >
      <StatusBar style="auto" />
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={dismissAuthModal} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrapper}
      >
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {mode === 'login' ? 'Welcome back 👋' : 'Create account 🏠'}
              </Text>
              {authModalMessage ? (
                <Text style={styles.message}>{authModalMessage}</Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={dismissAuthModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="close" size={22} color={Colors.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Username (register only) */}
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

            {/* Phone Number (register only) */}
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
                {mode === 'login'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
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
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.overlay,
  },
  sheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.xl,
    paddingTop: Spacing.md,
    ...Shadow.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  message: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: 7,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.bg,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  switchText: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.muted,
  },
  switchAction: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  terms: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
});

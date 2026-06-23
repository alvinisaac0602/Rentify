import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../ui/Button';

export function AuthModal() {
  const { showAuthModal, authModalMessage, signIn, dismissAuthModal } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email, password);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      // In production: use expo-apple-authentication
      await signIn('apple.user@icloud.com', 'apple-token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={showAuthModal}
      animationType="slide"
      transparent
      onRequestClose={dismissAuthModal}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={dismissAuthModal} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            {/* Social Sign-in Row */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.googleBtn} activeOpacity={0.82}>
                <AntDesign name="google" size={20} color="#4285F4" />
                <Text style={styles.googleText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.appleBtn} onPress={handleAppleSignIn} activeOpacity={0.85}>
                <AntDesign name="apple" size={20} color={Colors.white} />
                <Text style={styles.appleText}>Apple</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Name (register only) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="account-outline" size={20} color={Colors.muted} />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="John Doe"
                    placeholderTextColor={Colors.placeholder}
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

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={Colors.muted} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.placeholder}
                  secureTextEntry={!showPass}
                  style={[styles.input, { flex: 1 }]}
                />
                <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                  <MaterialCommunityIcons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.muted} />
                </TouchableOpacity>
              </View>
            </View>

            <Button
              label={loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
              onPress={handleSubmit}
              loading={loading}
              fullWidth
              style={{ marginTop: Spacing.sm, marginBottom: Spacing.md }}
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
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: 2,
  },
  googleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, padding: 13, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface, ...Shadow.sm,
  },
  googleText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  appleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, padding: 13, borderRadius: Radius.lg,
    backgroundColor: '#000000', ...Shadow.sm,
  },
  appleText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.white },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.base,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: FontSize.sm,
    color: Colors.muted,
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

import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
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
            {/* Google Button */}
            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.82}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Name (register only) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="account" size={18} color={Colors.muted} />
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
                <MaterialCommunityIcons name="email" size={18} color={Colors.muted} />
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
                <MaterialCommunityIcons name="lock" size={18} color={Colors.muted} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.placeholder}
                  secureTextEntry={!showPass}
                  style={[styles.input, { flex: 1 }]}
                />
                <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                  <MaterialCommunityIcons name={showPass ? 'eye-off' : 'eye'} size={18} color={Colors.muted} />
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
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: 13,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    ...Shadow.sm,
  },
  googleIcon: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#4285F4',
  },
  googleText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
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

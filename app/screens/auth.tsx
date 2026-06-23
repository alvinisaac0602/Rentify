import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, authModalMessage } = useAuth();
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
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      // In production: use expo-apple-authentication
      await signIn('apple.user@icloud.com', 'apple-token');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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

          {/* Social Buttons Row */}
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
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Name (register) */}
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
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.md,
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
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.sm, marginVertical: Spacing.base,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: FontSize.sm, color: Colors.muted },
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

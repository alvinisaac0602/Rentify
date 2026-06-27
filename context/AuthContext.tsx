import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isLandlord: boolean;
  phone?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  isLandlord: boolean;
  showAuthModal: boolean;
  authModalMessage: string;
  signIn: (email: string, password?: string, name?: string, phone?: string) => Promise<void>;
  signUp: (email: string, password?: string, name?: string, phone?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => void;
  requireAuth: (message?: string) => boolean;
  dismissAuthModal: () => void;
  toggleLandlordMode: () => void;
  updateUserVerification: (isVerified: boolean) => Promise<void>;
  updateUserAvatar: (avatarUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Pure TS MD5 implementation to generate Gravatar hashes dynamically
function md5(str: string): string {
  const k = [], s = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
  for (let i = 0; i < 64; i++) {
    k[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
  }
  let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476;
  const words: number[] = [];
  const byteLen = str.length;
  for (let i = 0; i < byteLen; i++) {
    words[i >> 2] |= (str.charCodeAt(i) & 0xff) << ((i % 4) * 8);
  }
  words[byteLen >> 2] |= 0x80 << ((byteLen % 4) * 8);
  const wordLen = ((byteLen + 8) >> 6) * 16 + 14;
  words[wordLen] = byteLen * 8;
  for (let q = 0; q < words.length; q += 16) {
    let a = h0, b = h1, c = h2, d = h3;
    for (let i = 0; i < 64; i++) {
      let f, g;
      if (i < 16) {
        f = (b & c) | (~b & d); g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c); g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d; g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d); g = (7 * i) % 16;
      }
      const temp = d;
      d = c;
      c = b;
      const x = (a + f + k[i] + (words[q + g] || 0)) | 0;
      b = (b + ((x << s[((i >> 2) * 4) + (i % 4)]) | (x >>> (32 - s[((i >> 2) * 4) + (i % 4)])))) | 0;
      a = temp;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
  }
  const hex = (n: number) => {
    let s = "";
    for (let i = 0; i < 4; i++) {
      const b = (n >> (i * 8)) & 0xff;
      s += (b < 16 ? "0" : "") + b.toString(16);
    }
    return s;
  };
  return hex(h0) + hex(h1) + hex(h2) + hex(h3);
}

// Deterministic password generation for passwordless UI flow in mobile apps
const getPasswordForEmail = (email: string) => {
  return `${email.split('@')[0]}RentifyAppSecure123!`;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authModalMessage, setAuthModalMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const routerRef = useRef<ReturnType<typeof useRouter> | null>(null);

  const isGuest = user === null;
  const isLandlord = user?.isLandlord ?? false;

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        const fallbackGravatar = `https://www.gravatar.com/avatar/${md5(firebaseUser.email?.trim().toLowerCase() || '')}?d=retro&s=150`;

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            id: firebaseUser.uid,
            name: userData.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            avatar: userData.avatarUrl || fallbackGravatar,
            isLandlord: userData.isLandlord ?? false,
            phone: userData.phoneNumber || '',
            isVerified: userData.isVerified ?? false,
          });
        } else {
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            avatar: fallbackGravatar,
            isLandlord: false,
            phone: '',
            isVerified: false,
          });
        }

        try {
          const { registerForPushNotificationsAsync } = require('../services/notificationService');
          registerForPushNotificationsAsync(firebaseUser.uid).catch((e: any) => console.log('Push notifications error:', e));
        } catch (err) {
          console.log('Failed to import notificationService:', err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = useCallback(async (email: string, password?: string, name?: string, phone?: string) => {
    const pwd = password || getPasswordForEmail(email);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, pwd);

      const emailClean = email.trim().toLowerCase();
      const gravatarUrl = `https://www.gravatar.com/avatar/${md5(emailClean)}?d=retro&s=150`;

      // Store user record in Firestore
      await setDoc(doc(db, 'users', credential.user.uid), {
        displayName: name || email.split('@')[0],
        email: email,
        phoneNumber: phone || '',
        avatarUrl: gravatarUrl,
        isLandlord: false,
        trustScore: 85,
        blockedUsers: [],
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error("This email is already in use by another account.");
      } else if (err.code === 'auth/invalid-email') {
        throw new Error("Please enter a valid email address.");
      } else if (err.code === 'auth/weak-password') {
        throw new Error("Your password is too weak. Please use at least 6 characters.");
      } else {
        throw new Error(err.message || "Failed to create your account. Please try again.");
      }
    }
  }, []);

  const signIn = useCallback(async (email: string, password?: string, name?: string, phone?: string) => {
    const pwd = password || getPasswordForEmail(email);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, pwd);
      // Ensure user document exists in Firestore, create it if missing
      const docRef = doc(db, 'users', credential.user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        const emailClean = email.trim().toLowerCase();
        const gravatarUrl = `https://www.gravatar.com/avatar/${md5(emailClean)}?d=retro&s=150`;
        await setDoc(docRef, {
          displayName: name || email.split('@')[0],
          email: email,
          phoneNumber: phone || '',
          avatarUrl: gravatarUrl,
          isLandlord: false,
          trustScore: 85,
          blockedUsers: [],
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        throw new Error("Incorrect email or password. Please verify your credentials or register for an account.");
      } else if (err.code === 'auth/wrong-password') {
        throw new Error("Incorrect password. Please try again.");
      } else if (err.code === 'auth/invalid-email') {
        throw new Error("Please enter a valid email address.");
      } else if (err.code === 'auth/user-disabled') {
        throw new Error("This account has been disabled. Please contact support.");
      } else {
        throw new Error(err.message || "Sign in failed. Please verify your network connection.");
      }
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        throw new Error("No account found with this email address.");
      } else if (err.code === 'auth/invalid-email') {
        throw new Error("Please enter a valid email address.");
      } else {
        throw new Error(err.message || "Failed to send password reset email. Please try again.");
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }, []);

  const requireAuth = useCallback((message = 'Sign in to continue') => {
    if (user) return true;
    setAuthModalMessage(message);
    routerRef.current?.push('/screens/auth' as any);
    return false;
  }, [user]);

  const dismissAuthModal = useCallback(() => {
    routerRef.current?.back();
  }, []);

  const toggleLandlordMode = useCallback(async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, { isLandlord: !user.isLandlord }, { merge: true });
      setUser(prev => prev ? { ...prev, isLandlord: !prev.isLandlord } : null);
    } catch (err) {
      console.error('Error toggling landlord mode:', err);
    }
  }, [user]);

  const updateUserAvatar = useCallback(async (avatarUrl: string) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { avatarUrl });
      setUser(prev => prev ? { ...prev, avatar: avatarUrl } : null);
    } catch (err) {
      console.error('Error updating user avatar:', err);
    }
  }, [user]);

  const updateUserVerification = useCallback(async (isVerified: boolean) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, isVerified } : null);
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, { isVerified }, { merge: true });
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, isGuest, isLandlord,
      showAuthModal: false,
      authModalMessage,
      signIn, signUp, resetPassword, signOut, requireAuth, dismissAuthModal, toggleLandlordMode, updateUserAvatar, updateUserVerification,
    }}>
      <RouterRegistrar routerRef={routerRef} />
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Helper that captures the router ref inside the provider tree
function RouterRegistrar({ routerRef }: { routerRef: React.MutableRefObject<any> }) {
  const router = useRouter();
  routerRef.current = router;
  return null;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

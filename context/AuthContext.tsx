import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
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
  signOut: () => void;
  requireAuth: (message?: string) => boolean;
  dismissAuthModal: () => void;
  toggleLandlordMode: () => void;
  updateUserVerification: (isVerified: boolean) => Promise<void>;
  updateUserAvatar: (avatarUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

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
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            id: firebaseUser.uid,
            name: userData.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            avatar: userData.avatarUrl || 'https://i.pravatar.cc/150?img=10',
            isLandlord: userData.isLandlord ?? false,
            phone: userData.phoneNumber || '',
            isVerified: userData.isVerified ?? false,
          });
        } else {
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            avatar: 'https://i.pravatar.cc/150?img=10',
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

  const signUp = async (email: string, name?: string, phone?: string) => {
    const password = getPasswordForEmail(email);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Store user record in Firestore
      await setDoc(doc(db, 'users', credential.user.uid), {
        displayName: name || email.split('@')[0],
        email: email,
        phoneNumber: phone || '',
        isLandlord: false,
        trustScore: 85,
        blockedUsers: [],
        createdAt: new Date().toISOString()
      });
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        // Fallback to signIn if account already exists
        await signIn(email, undefined, name, phone);
      } else {
        throw err;
      }
    }
  };

  const signIn = useCallback(async (email: string, _password?: string, name?: string, phone?: string) => {
    const password = getPasswordForEmail(email);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      // Verify user document exists in Firestore, and create it if missing
      const docRef = doc(db, 'users', credential.user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          displayName: name || email.split('@')[0],
          email: email,
          phoneNumber: phone || '',
          isLandlord: false,
          trustScore: 85,
          blockedUsers: [],
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        // Automatically sign up if account doesn't exist yet
        await signUp(email, name, phone);
      } else {
        throw err;
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
      await setDoc(userRef, {
        isLandlord: !user.isLandlord
      }, { merge: true });
      setUser(prev => prev ? { ...prev, isLandlord: !prev.isLandlord } : null);
    } catch (err) {
      console.error('Error toggling landlord mode:', err);
    }
  }, [user]);

  const updateUserAvatar = useCallback(async (avatarUrl: string) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, avatar: avatarUrl } : null);
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      avatarUrl: avatarUrl
    }, { merge: true });
  }, [user]);

  const updateUserVerification = useCallback(async (isVerified: boolean) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, isVerified } : null);
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      isVerified
    }, { merge: true });
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, isGuest, isLandlord,
      showAuthModal: false,
      authModalMessage,
      signIn, signOut, requireAuth, dismissAuthModal, toggleLandlordMode, updateUserAvatar, updateUserVerification,
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

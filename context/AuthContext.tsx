import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { useRouter } from 'expo-router';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isLandlord: boolean;
}

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  isLandlord: boolean;
  // kept for compatibility with AuthScreen
  showAuthModal: boolean;
  authModalMessage: string;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  requireAuth: (message?: string) => boolean;
  dismissAuthModal: () => void;
  toggleLandlordMode: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authModalMessage, setAuthModalMessage] = useState('');
  const routerRef = useRef<ReturnType<typeof useRouter> | null>(null);

  const isGuest = user === null;
  const isLandlord = user?.isLandlord ?? false;

  const signIn = useCallback(async (email: string, _password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({
      id: 'u1',
      name: email.split('@')[0].replace(/[._]/g, ' '),
      email,
      avatar: 'https://i.pravatar.cc/150?img=10',
      isLandlord: false,
    });
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
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

  const toggleLandlordMode = useCallback(() => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, isLandlord: !prev.isLandlord } : null);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, isGuest, isLandlord,
      showAuthModal: false,
      authModalMessage,
      signIn, signOut, requireAuth, dismissAuthModal, toggleLandlordMode,
    }}>
      <RouterRegistrar routerRef={routerRef} />
      {children}
    </AuthContext.Provider>
  );
}

// Tiny helper that captures the router ref inside the provider tree
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

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');

  const isGuest = user === null;
  const isLandlord = user?.isLandlord ?? false;

  const signIn = useCallback(async (email: string, _password: string) => {
    // Mocked auth — replace with real API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({
      id: 'u1',
      name: email.split('@')[0].replace(/[._]/g, ' '),
      email,
      avatar: 'https://i.pravatar.cc/150?img=10',
      isLandlord: false,
    });
    setShowAuthModal(false);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  /**
   * Call before any gated action.
   * Returns true if user is authenticated, false if modal was shown.
   */
  const requireAuth = useCallback((message = 'Sign in to continue') => {
    if (user) return true;
    setAuthModalMessage(message);
    setShowAuthModal(true);
    return false;
  }, [user]);

  const dismissAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  const toggleLandlordMode = useCallback(() => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, isLandlord: !prev.isLandlord } : null);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, isGuest, isLandlord, showAuthModal, authModalMessage,
      signIn, signOut, requireAuth, dismissAuthModal, toggleLandlordMode,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

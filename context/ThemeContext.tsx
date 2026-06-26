import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setThemeState } from '../constants/colors';

export type ThemeMode = 'light' | 'dark';
export type LanguageMode = 'en' | 'es' | 'fr' | 'de' | 'sw'; // English, Spanish, French, German, Swahili

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  language: LanguageMode;
  setLanguage: (lang: LanguageMode) => Promise<void>;
  t: (key: string) => string;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const TRANSLATIONS: Record<LanguageMode, Record<string, string>> = {
  en: {
    // Bottom Tabs / Navigation
    home: 'Home',
    explore: 'Explore',
    post: 'Post',
    saved: 'Saved',
    profile: 'Profile',
    // Profile features
    my_properties: 'My Properties',
    saved_properties: 'Saved Properties',
    messages: 'Messages',
    viewing_requests: 'Viewing Requests',
    verification_status: 'Verification Status',
    help_support: 'Help & Support',
    privacy_terms: 'Privacy & Terms',
    delete_account: 'Delete Account',
    about_rentify: 'About Rentify',
    dark_mode: 'Dark Mode',
    language: 'Language',
    sign_out: 'Sign Out',
    theme: 'Theme',
    select_language: 'Select Language',
    cancel: 'Cancel',
    success: 'Success',
    profile_photo_updated: 'Profile photo updated successfully!',
    give_feedback: 'Give Feedback',
  },
  es: {
    home: 'Inicio',
    explore: 'Explorar',
    post: 'Publicar',
    saved: 'Guardados',
    profile: 'Perfil',
    my_properties: 'Mis Propiedades',
    saved_properties: 'Propiedades Guardadas',
    messages: 'Mensajes',
    viewing_requests: 'Solicitudes de Visita',
    verification_status: 'Estado de Verificación',
    help_support: 'Ayuda y Soporte',
    privacy_terms: 'Privacidad y Términos',
    delete_account: 'Eliminar Cuenta',
    about_rentify: 'Acerca de Rentify',
    dark_mode: 'Modo Oscuro',
    language: 'Idioma',
    sign_out: 'Cerrar Sesión',
    theme: 'Tema',
    select_language: 'Seleccionar idioma',
    cancel: 'Cancelar',
    success: 'Éxito',
    profile_photo_updated: '¡Foto de perfil actualizada con éxito!',
    give_feedback: 'Dar sugerencias',
  },
  fr: {
    home: 'Accueil',
    explore: 'Explorer',
    post: 'Publier',
    saved: 'Enregistrés',
    profile: 'Profil',
    my_properties: 'Mes Propriétés',
    saved_properties: 'Propriétés Enregistrées',
    messages: 'Messages',
    viewing_requests: 'Demandes de Visite',
    verification_status: 'Statut de Vérification',
    help_support: 'Aide & Support',
    privacy_terms: 'Confidentialité & Conditions',
    delete_account: 'Supprimer le Compte',
    about_rentify: 'À propos de Rentify',
    dark_mode: 'Mode Sombre',
    language: 'Langue',
    sign_out: 'Déconnexion',
    theme: 'Thème',
    select_language: 'Choisir la langue',
    cancel: 'Annuler',
    success: 'Succès',
    profile_photo_updated: 'Photo de profil mise à jour avec succès!',
    give_feedback: 'Donner des commentaires',
  },
  de: {
    home: 'Startseite',
    explore: 'Entdecken',
    post: 'Posten',
    saved: 'Gespeichert',
    profile: 'Profil',
    my_properties: 'Meine Immobilien',
    saved_properties: 'Gespeicherte Immobilien',
    messages: 'Nachrichten',
    viewing_requests: 'Besichtigungsanfragen',
    verification_status: 'Verifizierungsstatus',
    help_support: 'Hilfe & Support',
    privacy_terms: 'Datenschutz & Bedingungen',
    delete_account: 'Konto löschen',
    about_rentify: 'Über Rentify',
    dark_mode: 'Dunkelmodus',
    language: 'Sprache',
    sign_out: 'Abmelden',
    theme: 'Design',
    select_language: 'Sprache auswählen',
    cancel: 'Abbrechen',
    success: 'Erfolgreich',
    profile_photo_updated: 'Profilbild erfolgreich aktualisiert!',
    give_feedback: 'Feedback geben',
  },
  sw: {
    home: 'Nyumbani',
    explore: 'Gundua',
    post: 'Chapisha',
    saved: 'Zilizohifadhiwa',
    profile: 'Wasifu',
    my_properties: 'Mali Zangu',
    saved_properties: 'Mali Zilizohifadhiwa',
    messages: 'Ujumbe',
    viewing_requests: 'Maombi ya Kutembelea',
    verification_status: 'Hali ya Uthibitisho',
    help_support: 'Msaada na Usaidizi',
    privacy_terms: 'Faragha na Masharti',
    delete_account: 'Futa Akaunti',
    about_rentify: 'Kuhusu Rentify',
    dark_mode: 'Hali ya Usiku',
    language: 'Lugha',
    sign_out: 'Ondoka',
    theme: 'Mandhari',
    select_language: 'Chagua Lugha',
    cancel: 'Ghairi',
    success: 'Imefanikiwa',
    profile_photo_updated: 'Picha ya wasifu imesasishwa kikamilifu!',
    give_feedback: 'Toa Maoni',
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [language, setLanguageState] = useState<LanguageMode>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('theme_preference');
        if (storedTheme === 'light' || storedTheme === 'dark') {
          setTheme(storedTheme);
          setThemeState(storedTheme);
        }
        const storedLang = await AsyncStorage.getItem('language_preference');
        if (storedLang) {
          setLanguageState(storedLang as LanguageMode);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const toggleTheme = async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    setThemeState(nextTheme);
    try {
      await AsyncStorage.setItem('theme_preference', nextTheme);
    } catch (err) {
      console.error(err);
    }
  };

  const setLanguage = async (lang: LanguageMode) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem('language_preference', lang);
    } catch (err) {
      console.error(err);
    }
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  if (loading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, language, setLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

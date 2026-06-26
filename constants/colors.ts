// Rentify Design System — Color Tokens

let activeTheme: 'light' | 'dark' = 'light';

export const setThemeState = (theme: 'light' | 'dark') => {
  activeTheme = theme;
};

export const getThemeState = () => activeTheme;

export const Colors = {
  // ─── Category Colors ─────────────────────────────────────────
  apartment: '#2563EB',      // Blue
  apartmentLight: '#DBEAFE',
  apartmentDark: '#1E40AF',

  hostel: '#7C3AED',          // Purple
  hostelLight: '#EDE9FE',
  hostelDark: '#5B21B6',

  shop: '#EA580C',           // Orange
  shopLight: '#FFEDD5',
  shopDark: '#C2410C',

  airbnb: '#16A34A',         // Green
  airbnbLight: '#DCFCE7',
  airbnbDark: '#15803D',

  // ─── Brand ───────────────────────────────────────────────────
  get primary() { return activeTheme === 'light' ? '#1A56DB' : '#3B82F6'; },
  get primaryLight() { return activeTheme === 'light' ? '#EBF5FF' : '#1E293B'; },
  get primaryDark() { return activeTheme === 'light' ? '#1239A1' : '#60A5FA'; },

  // ─── Status ──────────────────────────────────────────────────
  success: '#22C55E',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  trust: '#0EA5E9',
  trustLight: '#E0F2FE',

  // ─── Neutrals ────────────────────────────────────────────────
  get white() { return activeTheme === 'light' ? '#FFFFFF' : '#1E293B'; },
  get bg() { return activeTheme === 'light' ? '#F8FAFC' : '#0F172A'; },
  get surface() { return activeTheme === 'light' ? '#FFFFFF' : '#1E293B'; },
  get surfaceSecondary() { return activeTheme === 'light' ? '#F1F5F9' : '#334155'; },
  get border() { return activeTheme === 'light' ? '#E2E8F0' : '#475569'; },
  get borderLight() { return activeTheme === 'light' ? '#F1F5F9' : '#334155'; },

  // ─── Text ────────────────────────────────────────────────────
  get text() { return activeTheme === 'light' ? '#0F172A' : '#F8FAFC'; },
  get textSecondary() { return activeTheme === 'light' ? '#475569' : '#CBD5E1'; },
  get muted() { return activeTheme === 'light' ? '#94A3B8' : '#64748B'; },
  get placeholder() { return activeTheme === 'light' ? '#CBD5E1' : '#475569'; },

  // ─── Overlay ─────────────────────────────────────────────────
  get overlay() { return activeTheme === 'light' ? 'rgba(15, 23, 42, 0.55)' : 'rgba(15, 23, 42, 0.75)'; },
  get overlayLight() { return activeTheme === 'light' ? 'rgba(15, 23, 42, 0.25)' : 'rgba(15, 23, 42, 0.45)'; },
  get cardOverlay() { return activeTheme === 'light' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(15, 23, 42, 0.6)'; },
};

export type CategoryType = 'apartment' | 'hostel' | 'shop' | 'airbnb';

export const CategoryMeta: Record<CategoryType, {
  label: string;
  icon: string;
  color: string;
  lightColor: string;
  darkColor: string;
  subtitle: string;
  emoji: string;
}> = {
  apartment: {
    label: 'Apartments',
    icon: 'home',
    color: Colors.apartment,
    lightColor: Colors.apartmentLight,
    darkColor: Colors.apartmentDark,
    subtitle: 'Long-term',
    emoji: '🏠',
  },
  hostel: {
    label: 'Hostels',
    icon: 'bed',
    color: Colors.hostel,
    lightColor: Colors.hostelLight,
    darkColor: Colors.hostelDark,
    subtitle: 'Budget stays',
    emoji: '🛏️',
  },
  shop: {
    label: 'Shops',
    icon: 'store',
    color: Colors.shop,
    lightColor: Colors.shopLight,
    darkColor: Colors.shopDark,
    subtitle: 'Commercial',
    emoji: '🏪',
  },
  airbnb: {
    label: 'Airbnbs',
    icon: 'home-city',
    color: Colors.airbnb,
    lightColor: Colors.airbnbLight,
    darkColor: Colors.airbnbDark,
    subtitle: 'Short-stay',
    emoji: '🏨',
  },
};

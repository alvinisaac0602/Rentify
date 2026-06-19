// Rentify Design System — Color Tokens

export const Colors = {
  // ─── Category Colors ─────────────────────────────────────────
  apartment: '#2563EB',      // Blue
  apartmentLight: '#DBEAFE',
  apartmentDark: '#1E40AF',

  office: '#7C3AED',         // Purple
  officeLight: '#EDE9FE',
  officeDark: '#5B21B6',

  shop: '#EA580C',           // Orange
  shopLight: '#FFEDD5',
  shopDark: '#C2410C',

  airbnb: '#16A34A',         // Green
  airbnbLight: '#DCFCE7',
  airbnbDark: '#15803D',

  // ─── Brand ───────────────────────────────────────────────────
  primary: '#1A56DB',
  primaryLight: '#EBF5FF',
  primaryDark: '#1239A1',

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
  white: '#FFFFFF',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // ─── Text ────────────────────────────────────────────────────
  text: '#0F172A',
  textSecondary: '#475569',
  muted: '#94A3B8',
  placeholder: '#CBD5E1',

  // ─── Overlay ─────────────────────────────────────────────────
  overlay: 'rgba(15, 23, 42, 0.55)',
  overlayLight: 'rgba(15, 23, 42, 0.25)',
  cardOverlay: 'rgba(15, 23, 42, 0.4)',
};

export type CategoryType = 'apartment' | 'office' | 'shop' | 'airbnb';

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
  office: {
    label: 'Offices',
    icon: 'office-building',
    color: Colors.office,
    lightColor: Colors.officeLight,
    darkColor: Colors.officeDark,
    subtitle: 'Workspaces',
    emoji: '🏢',
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

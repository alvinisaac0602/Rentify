import { CategoryType } from './colors';

// ─── Core Interfaces ───────────────────────────────────────────────────────

export interface Property {
  id: string;
  title: string;
  category: CategoryType;
  price: number;
  pricePeriod: 'month' | 'day' | 'week' | 'year';
  currency: string;
  location: string;
  district: string;
  description: string;
  images: string[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isFurnished: boolean;
  bedrooms?: number;
  bathrooms?: number;
  size?: number; // sqm
  amenities: string[];
  trustScore: number;
  landlordId: string;
  isAvailable: boolean;
  createdAt: string;
  latitude?: number;
  longitude?: number;
  unitsLeft?: number;
  // ── Listing monetisation fields ─────────────────────────────────
  listingPlan?: 'free' | 'basic' | 'featured'; // paid tier
  isPaid?: boolean;                              // has an active payment
  featuredUntil?: string | null;                // ISO date — null = not featured
  expiresAt?: string | null;                    // ISO date — null = never expires (paid)
  verificationStatus?: 'unverified' | 'pending' | 'verified';
}

export interface Landlord {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  rating: number;
  responseTime: string;
  properties: number;
  joinedDate: string;
  phone: string;
  trustScore: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  propertyTitle: string;
  propertyId: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: 'text' | 'viewing_request' | 'booking';
}

export interface Mover {
  id: string;
  name: string;
  rating: number;
  priceEstimate: string;
  isVerified: boolean;
  description: string;
  responseTime: string;
}

// ─── Static Constants & Metadata ───────────────────────────────────────────

export const MOVER_PROVIDERS: Mover[] = [
  {
    id: 'mv1',
    name: 'Swift Movers Uganda',
    rating: 4.8,
    priceEstimate: 'UGX 120,000 – 250,000',
    isVerified: true,
    description: 'Professional movers with 5+ years experience. We handle fragile items with care.',
    responseTime: '< 30 min',
  },
  {
    id: 'mv2',
    name: 'Kampala Express Logistics',
    rating: 4.5,
    priceEstimate: 'UGX 80,000 – 180,000',
    isVerified: true,
    description: 'Affordable and reliable. Trucks available 7 days a week.',
    responseTime: '< 1 hour',
  },
  {
    id: 'mv3',
    name: 'Nakawa Movers',
    rating: 3.9,
    priceEstimate: 'UGX 60,000 – 120,000',
    isVerified: false,
    description: 'Budget-friendly option for small to medium moves.',
    responseTime: 'Same day',
  },
];

export const DISTRICTS = ['All', 'Kampala', 'Wakiso', 'Mukono', 'Entebbe'];

// ─── Shared Helper Functions ───────────────────────────────────────────────

export const formatPrice = (amount: number, currency: string, period: string): string => {
  const formatted = new Intl.NumberFormat('en-UG').format(amount);
  const periodMap: Record<string, string> = {
    month: '/mo', day: '/day', week: '/wk', year: '/yr',
  };
  return `${currency} ${formatted}${periodMap[period] || ''}`;
};

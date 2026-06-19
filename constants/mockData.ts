import { CategoryType } from './colors';

// ─── Property Listings ───────────────────────────────────────────────────────

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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const UNSPLASH_APTS = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
];
const UNSPLASH_OFFICE = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
];
const UNSPLASH_SHOP = [
  'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80',
  'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
];
const UNSPLASH_BNB = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
];

export const MOCK_LANDLORDS: Landlord[] = [
  {
    id: 'l1',
    name: 'Samuel Okello',
    avatar: 'https://i.pravatar.cc/150?img=33',
    isVerified: true,
    rating: 4.9,
    responseTime: '< 1 hour',
    properties: 6,
    joinedDate: '2021',
    phone: '+256 701 234 567',
    trustScore: 94,
  },
  {
    id: 'l2',
    name: 'Grace Nakato',
    avatar: 'https://i.pravatar.cc/150?img=47',
    isVerified: true,
    rating: 4.7,
    responseTime: '< 2 hours',
    properties: 3,
    joinedDate: '2022',
    phone: '+256 782 345 678',
    trustScore: 88,
  },
  {
    id: 'l3',
    name: 'David Ssempa',
    avatar: 'https://i.pravatar.cc/150?img=15',
    isVerified: false,
    rating: 3.8,
    responseTime: 'Same day',
    properties: 2,
    joinedDate: '2023',
    phone: '+256 753 456 789',
    trustScore: 62,
  },
];

export const MOCK_PROPERTIES: Property[] = [
  // ── Apartments ──────────────────────────────────────────────────
  {
    id: 'p1',
    title: 'Modern 3BR Apartment in Kololo',
    category: 'apartment',
    price: 1800000,
    pricePeriod: 'month',
    currency: 'UGX',
    location: 'Kololo, Kampala',
    district: 'Kampala',
    description: 'A stunning 3-bedroom apartment in the heart of Kololo with breathtaking city views. Features a spacious living area, fully equipped kitchen, and private balcony. Walking distance to embassies and top restaurants.',
    images: UNSPLASH_APTS,
    rating: 4.8,
    reviewCount: 24,
    isVerified: true,
    isFurnished: true,
    bedrooms: 3,
    bathrooms: 2,
    size: 180,
    amenities: ['WiFi', 'Generator', 'Parking', 'Security', 'CCTV', 'Gym', 'Swimming Pool', 'Balcony', 'Air Conditioning'],
    trustScore: 94,
    landlordId: 'l1',
    isAvailable: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'p2',
    title: 'Cozy Studio in Ntinda',
    category: 'apartment',
    price: 650000,
    pricePeriod: 'month',
    currency: 'UGX',
    location: 'Ntinda, Kampala',
    district: 'Kampala',
    description: 'Perfect starter apartment in the vibrant Ntinda neighborhood. Close to supermarkets, restaurants, and public transport.',
    images: [UNSPLASH_APTS[1], UNSPLASH_APTS[2], UNSPLASH_APTS[3]],
    rating: 4.3,
    reviewCount: 11,
    isVerified: true,
    isFurnished: false,
    bedrooms: 1,
    bathrooms: 1,
    size: 45,
    amenities: ['WiFi', 'Security', 'Water Tank', 'Parking'],
    trustScore: 82,
    landlordId: 'l2',
    isAvailable: true,
    createdAt: '2024-02-10',
  },
  {
    id: 'p3',
    title: 'Luxury 2BR in Nakasero',
    category: 'apartment',
    price: 2500000,
    pricePeriod: 'month',
    currency: 'UGX',
    location: 'Nakasero, Kampala',
    district: 'Kampala',
    description: 'Ultra-modern 2-bedroom apartment with high-end finishes in Kampala\'s most prestigious address.',
    images: [UNSPLASH_APTS[2], UNSPLASH_APTS[0], UNSPLASH_APTS[1]],
    rating: 4.9,
    reviewCount: 18,
    isVerified: true,
    isFurnished: true,
    bedrooms: 2,
    bathrooms: 2,
    size: 120,
    amenities: ['WiFi', 'Generator', 'Parking', 'Security', 'CCTV', 'Gym', 'Smart TV', 'Air Conditioning', 'Balcony'],
    trustScore: 97,
    landlordId: 'l1',
    isAvailable: true,
    createdAt: '2024-01-28',
  },
  // ── Offices ─────────────────────────────────────────────────────
  {
    id: 'p4',
    title: 'Open-Plan Office Space – Nakawa',
    category: 'office',
    price: 3500000,
    pricePeriod: 'month',
    currency: 'UGX',
    location: 'Nakawa, Kampala',
    district: 'Kampala',
    description: 'Modern open-plan office space for up to 20 people. High-speed fiber internet, meeting rooms, and reception desk included. Perfect for startups and SMEs.',
    images: UNSPLASH_OFFICE,
    rating: 4.6,
    reviewCount: 9,
    isVerified: true,
    isFurnished: true,
    size: 250,
    amenities: ['Fiber Internet', 'Meeting Rooms', 'Reception', 'Parking', 'Generator', 'Air Conditioning', 'Kitchen', 'CCTV'],
    trustScore: 91,
    landlordId: 'l2',
    isAvailable: true,
    createdAt: '2024-01-05',
  },
  {
    id: 'p5',
    title: 'Private Office Suite – Garden City',
    category: 'office',
    price: 5200000,
    pricePeriod: 'month',
    currency: 'UGX',
    location: 'Garden City, Kampala',
    district: 'Kampala',
    description: 'Premium private office suite in Kampala\'s most iconic commercial building. Fully furnished with executive fittings.',
    images: [UNSPLASH_OFFICE[1], UNSPLASH_OFFICE[2], UNSPLASH_OFFICE[0]],
    rating: 4.8,
    reviewCount: 14,
    isVerified: true,
    isFurnished: true,
    size: 80,
    amenities: ['Fiber Internet', 'Private Meeting Room', 'Reception', 'Parking', 'Generator', 'Air Conditioning', 'Lounge'],
    trustScore: 95,
    landlordId: 'l1',
    isAvailable: true,
    createdAt: '2024-01-20',
  },
  {
    id: 'p6',
    title: 'Coworking Desk – Kiwatule',
    category: 'office',
    price: 280000,
    pricePeriod: 'month',
    currency: 'UGX',
    location: 'Kiwatule, Kampala',
    district: 'Kampala',
    description: 'Hot desk in a vibrant coworking space. Great community, regular events, and flexible monthly plans.',
    images: [UNSPLASH_OFFICE[2], UNSPLASH_OFFICE[0], UNSPLASH_OFFICE[1]],
    rating: 4.2,
    reviewCount: 31,
    isVerified: false,
    isFurnished: true,
    amenities: ['WiFi', 'Printing', 'Lounge', 'Coffee', 'Events'],
    trustScore: 58,
    landlordId: 'l3',
    isAvailable: true,
    createdAt: '2024-03-01',
  },
  // ── Shops ────────────────────────────────────────────────────────
  {
    id: 'p7',
    title: 'Retail Stall – Owino Market',
    category: 'shop',
    price: 400000,
    pricePeriod: 'month',
    currency: 'UGX',
    location: 'Owino Market, Kampala',
    district: 'Kampala',
    description: 'Prime retail stall in Uganda\'s busiest market. High foot traffic, excellent visibility. Power connection available.',
    images: UNSPLASH_SHOP,
    rating: 4.0,
    reviewCount: 7,
    isVerified: true,
    isFurnished: false,
    size: 12,
    amenities: ['Electricity', 'Security', 'Water Access'],
    trustScore: 78,
    landlordId: 'l2',
    isAvailable: true,
    createdAt: '2024-02-20',
  },
  {
    id: 'p8',
    title: 'Boutique Storefront – Acacia Mall',
    category: 'shop',
    price: 8500000,
    pricePeriod: 'month',
    currency: 'UGX',
    location: 'Acacia Mall, Kampala',
    district: 'Kampala',
    description: 'Premium storefront in one of Kampala\'s top shopping malls. Glass-fronted display, air conditioning, and dedicated stockroom.',
    images: [UNSPLASH_SHOP[1], UNSPLASH_SHOP[2], UNSPLASH_SHOP[0]],
    rating: 4.7,
    reviewCount: 5,
    isVerified: true,
    isFurnished: false,
    size: 60,
    amenities: ['Air Conditioning', 'Security', 'Stockroom', 'WiFi', 'Generator', 'CCTV'],
    trustScore: 93,
    landlordId: 'l1',
    isAvailable: true,
    createdAt: '2024-01-10',
  },
  // ── Airbnbs ──────────────────────────────────────────────────────
  {
    id: 'p9',
    title: 'Serene Garden Villa – Munyonyo',
    category: 'airbnb',
    price: 250000,
    pricePeriod: 'day',
    currency: 'UGX',
    location: 'Munyonyo, Kampala',
    district: 'Kampala',
    description: 'Wake up to lakeside views in this private garden villa. Includes a private pool, lush gardens, and a fully equipped kitchen. Ideal for families or weekend getaways.',
    images: UNSPLASH_BNB,
    rating: 4.9,
    reviewCount: 42,
    isVerified: true,
    isFurnished: true,
    bedrooms: 3,
    bathrooms: 2,
    size: 200,
    amenities: ['Pool', 'Garden', 'WiFi', 'Parking', 'CCTV', 'Smart TV', 'Kitchen', 'Generator', 'Lake View'],
    trustScore: 98,
    landlordId: 'l1',
    isAvailable: true,
    createdAt: '2023-11-01',
  },
  {
    id: 'p10',
    title: 'City View Penthouse – Naguru',
    category: 'airbnb',
    price: 180000,
    pricePeriod: 'day',
    currency: 'UGX',
    location: 'Naguru, Kampala',
    district: 'Kampala',
    description: 'Stylish penthouse with panoramic views of Kampala skyline. King-size bed, rooftop terrace, and daily cleaning service.',
    images: [UNSPLASH_BNB[1], UNSPLASH_BNB[2], UNSPLASH_BNB[0]],
    rating: 4.7,
    reviewCount: 28,
    isVerified: true,
    isFurnished: true,
    bedrooms: 1,
    bathrooms: 1,
    size: 75,
    amenities: ['WiFi', 'Rooftop Terrace', 'Smart TV', 'Air Conditioning', 'Daily Cleaning', 'City View'],
    trustScore: 92,
    landlordId: 'l2',
    isAvailable: true,
    createdAt: '2023-12-15',
  },
  {
    id: 'p11',
    title: 'Budget Studio Stay – Kisementi',
    category: 'airbnb',
    price: 80000,
    pricePeriod: 'day',
    currency: 'UGX',
    location: 'Kisementi, Kampala',
    district: 'Kampala',
    description: 'Clean and affordable studio in central Kampala. Walking distance to restaurants, nightlife, and supermarkets.',
    images: [UNSPLASH_BNB[2], UNSPLASH_BNB[0]],
    rating: 4.1,
    reviewCount: 16,
    isVerified: false,
    isFurnished: true,
    bedrooms: 1,
    bathrooms: 1,
    size: 35,
    amenities: ['WiFi', 'Security', 'Kitchen'],
    trustScore: 55,
    landlordId: 'l3',
    isAvailable: true,
    createdAt: '2024-03-10',
  },
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    senderId: 'l1',
    senderName: 'Samuel Okello',
    senderAvatar: 'https://i.pravatar.cc/150?img=33',
    lastMessage: 'Hi! The apartment is still available. When would you like to view it?',
    timestamp: '10:32 AM',
    unread: 2,
    propertyTitle: 'Modern 3BR Apartment in Kololo',
    propertyId: 'p1',
  },
  {
    id: 'm2',
    senderId: 'l2',
    senderName: 'Grace Nakato',
    senderAvatar: 'https://i.pravatar.cc/150?img=47',
    lastMessage: 'Your viewing request has been confirmed for tomorrow at 2PM.',
    timestamp: 'Yesterday',
    unread: 0,
    propertyTitle: 'Open-Plan Office Space – Nakawa',
    propertyId: 'p4',
  },
  {
    id: 'm3',
    senderId: 'l1',
    senderName: 'Samuel Okello',
    senderAvatar: 'https://i.pravatar.cc/150?img=33',
    lastMessage: 'Thank you for booking the villa! Enjoy your stay 🙏',
    timestamp: 'Mon',
    unread: 1,
    propertyTitle: 'Serene Garden Villa – Munyonyo',
    propertyId: 'p9',
  },
];

export const MOCK_CHAT: ChatMessage[] = [
  { id: 'c1', senderId: 'l1', text: 'Hello! Thanks for your interest in the apartment. It\'s a great place!', timestamp: '10:00 AM', type: 'text' },
  { id: 'c2', senderId: 'me', text: 'Hi Samuel! I\'d love to arrange a viewing. Is this weekend possible?', timestamp: '10:05 AM', type: 'text' },
  { id: 'c3', senderId: 'l1', text: 'Absolutely! Saturday or Sunday works well for me. Which do you prefer?', timestamp: '10:08 AM', type: 'text' },
  { id: 'c4', senderId: 'me', text: 'Saturday afternoon would be perfect. Around 2PM?', timestamp: '10:12 AM', type: 'text' },
  { id: 'c5', senderId: 'l1', text: 'Saturday at 2PM is confirmed ✅ I\'ll send you the exact address shortly.', timestamp: '10:32 AM', type: 'text' },
  { id: 'c6', senderId: 'me', text: '', timestamp: '10:33 AM', type: 'viewing_request' },
];

export const MOCK_MOVERS: Mover[] = [
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

export const DISTRICTS = ['All', 'Kampala', 'Wakiso', 'Mukono', 'Kira', 'Ntinda', 'Entebbe'];

export const formatPrice = (amount: number, currency: string, period: string): string => {
  const formatted = new Intl.NumberFormat('en-UG').format(amount);
  const periodMap: Record<string, string> = {
    month: '/mo', day: '/day', week: '/wk', year: '/yr',
  };
  return `${currency} ${formatted}${periodMap[period] || ''}`;
};

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  currency: string;
  rating: number;
  reviews: number;
  image: string;
  tag: string | null;
  isVerified: boolean;
  seller: string;
  deliveryDays: number;
  description: string;
}

export const SEED_PRODUCTS: Omit<Product, 'id'>[] = [
  // Beds & Frames
  { name: 'Queen Wooden Bed Frame', category: 'Beds & Frames', price: 480000, originalPrice: 620000, currency: 'UGX', rating: 4.7, reviews: 38, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80', tag: 'Best Seller', isVerified: true, seller: 'Kampala Furniture Hub', deliveryDays: 2, description: 'Handcrafted premium mahogany wood queen size bed frame. Elegant design, durable structures, and matches both modern and classic bedroom decors.' },
  { name: 'Single Metal Bed Frame', category: 'Beds & Frames', price: 195000, originalPrice: 250000, currency: 'UGX', rating: 4.3, reviews: 22, image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80', tag: null, isVerified: true, seller: 'Ntinda Furniture', deliveryDays: 1, description: 'Strong steel tube construction with powder-coated finish. Perfect for student rooms, single apartments, and budget-friendly setups.' },
  { name: 'King Size Platform Bed', category: 'Beds & Frames', price: 750000, originalPrice: 900000, currency: 'UGX', rating: 4.9, reviews: 14, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80', tag: 'Premium', isVerified: true, seller: 'Elite Home UG', deliveryDays: 3, description: 'Low profile luxury platform bed frame with premium tufted fabric headboard. Solid wood slat support system requires no box spring.' },
  // Sofas
  { name: '3-Seater L-Shaped Sofa', category: 'Sofas', price: 1200000, originalPrice: 1500000, currency: 'UGX', rating: 4.8, reviews: 56, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80', tag: 'Popular', isVerified: true, seller: 'Kampala Furniture Hub', deliveryDays: 3, description: 'Comfortable sectional L-shaped sofa upholstered in high quality, stain-resistant fabric. Includes 3 accent pillows and reversible chaise configuration.' },
  { name: '2-Seater Fabric Sofa', category: 'Sofas', price: 680000, originalPrice: null, currency: 'UGX', rating: 4.5, reviews: 29, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80', tag: null, isVerified: false, seller: 'Budget Furniture KLA', deliveryDays: 2, description: 'Compact and cozy double seater couch perfect for studios and cozy apartments. Features high density foam cushions and sturdy wooden legs.' },
  // Mattresses
  { name: 'Orthopedic Foam Mattress (6")', category: 'Mattresses', price: 320000, originalPrice: 400000, currency: 'UGX', rating: 4.6, reviews: 91, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80', tag: 'Best Seller', isVerified: true, seller: 'Sleep Well Uganda', deliveryDays: 1, description: 'Recommended orthopedic mattress offering firm back support and pressure relief. Covered in breathable premium quilted fabric.' },
  { name: 'Spring Pocket Mattress (8")', category: 'Mattresses', price: 580000, originalPrice: 720000, currency: 'UGX', rating: 4.8, reviews: 43, image: 'https://images.unsplash.com/photo-1601832860882-7cee2f16dd6e?w=400&q=80', tag: 'Premium', isVerified: true, seller: 'Sleep Well Uganda', deliveryDays: 2, description: 'Pocketed spring design minimizes motion transfer for a peaceful sleep. Layered with luxury memory foam topper for plush comfort.' },
  // Beddings
  { name: '6-Piece Bedding Set (Queen)', category: 'Beddings', price: 145000, originalPrice: 180000, currency: 'UGX', rating: 4.4, reviews: 67, image: 'https://images.unsplash.com/photo-1586798271654-0471bb1b0517?w=400&q=80', tag: 'New Arrival', isVerified: true, seller: 'Home Textiles UG', deliveryDays: 1, description: 'All-inclusive premium soft bedding bundle. Contains 1 flat sheet, 1 fitted sheet, 2 pillowcases, and 1 lightweight matching duvet cover.' },
  { name: 'Egyptian Cotton Duvet', category: 'Beddings', price: 98000, originalPrice: null, currency: 'UGX', rating: 4.7, reviews: 34, image: 'https://images.unsplash.com/photo-1615875605825-5eb9bb5d52ac?w=400&q=80', tag: null, isVerified: true, seller: 'Home Textiles UG', deliveryDays: 1, description: 'Hypoallergenic 100% Egyptian cotton duvet inner with box stitch quilting to prevent filling shifts. Super soft and warm.' },
  { name: 'Pillow Set (4-Pack)', category: 'Beddings', price: 55000, originalPrice: 70000, currency: 'UGX', rating: 4.3, reviews: 112, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&q=80', tag: null, isVerified: true, seller: 'Home Textiles UG', deliveryDays: 1, description: 'Fluffy microfiber fiberfill sleeping pillows. Resilient structure provides ideal head and neck support for side, back, or stomach sleepers.' },
  // Wardrobes
  { name: '3-Door Sliding Wardrobe', category: 'Wardrobes', price: 890000, originalPrice: 1100000, currency: 'UGX', rating: 4.6, reviews: 19, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', tag: 'Popular', isVerified: true, seller: 'Kampala Furniture Hub', deliveryDays: 4, description: 'Modern spacious wardrobe with sliding doors, built-in dresser mirror, multiple hanging rods, and drawers for folded garments.' },
  { name: '2-Door Wooden Wardrobe', category: 'Wardrobes', price: 420000, originalPrice: 520000, currency: 'UGX', rating: 4.4, reviews: 28, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', tag: null, isVerified: false, seller: 'Ntinda Furniture', deliveryDays: 3, description: 'Compact wooden storage cupboard featuring two standard doors, single hanging bar, and top shelf compartment.' },
  // Dining
  { name: '4-Seater Dining Set', category: 'Dining', price: 650000, originalPrice: 800000, currency: 'UGX', rating: 4.5, reviews: 24, image: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=400&q=80', tag: null, isVerified: true, seller: 'Elite Home UG', deliveryDays: 3, description: 'Family dining set featuring a polished hardwood top table and four comfortable cushioned dining chairs.' },
  // Study
  { name: 'Study Desk + Chair Combo', category: 'Study', price: 240000, originalPrice: 300000, currency: 'UGX', rating: 4.6, reviews: 47, image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80', tag: 'Student Pick', isVerified: true, seller: 'Budget Furniture KLA', deliveryDays: 2, description: 'Ergonomic wooden writing desk with built-in storage drawer combined with an adjustable swivel mesh office chair.' },
];

export const PRODUCTS: Product[] = SEED_PRODUCTS.map((p, idx) => ({
  id: `p${idx + 1}`,
  ...p,
})) as Product[];

const fmt = (n: number) => `UGX ${new Intl.NumberFormat('en-UG').format(n)}`;

export default function FurnitureShopScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [dbLoading, setDbLoading] = useState<boolean>(true);

  const isPostMove = from === 'booking' || from === 'movers';

  // Load products from Firestore, seed if empty
  const fetchProducts = async () => {
    try {
      setDbLoading(true);
      const colRef = collection(db, 'furnitureProducts');
      const snap = await getDocs(colRef);
      
      let fetched: Product[] = [];
      if (snap.empty) {
        // Seed Firestore collection
        console.log('Seeding furnitureProducts database...');
        for (let i = 0; i < SEED_PRODUCTS.length; i++) {
          const docId = `p${i + 1}`;
          await setDoc(doc(db, 'furnitureProducts', docId), SEED_PRODUCTS[i]);
          fetched.push({ id: docId, ...SEED_PRODUCTS[i] } as Product);
        }
      } else {
        fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      }
      setProducts(fetched);
    } catch (e) {
      console.log('Error loading furniture products from DB:', e);
    } finally {
      setDbLoading(false);
    }
  };

  const loadCartAndWishlist = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('furniture_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        setCart({});
      }
      const savedWish = await AsyncStorage.getItem('furniture_wishlist');
      if (savedWish) {
        setWishlist(new Set(JSON.parse(savedWish)));
      }
    } catch (e) {
      console.log('Error loading cart/wishlist', e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadCartAndWishlist();
      fetchProducts(); // Refresh listings in case admin added/deleted them
    }, [])
  );

  const saveCart = async (newCart: Record<string, number>) => {
    try {
      await AsyncStorage.setItem('furniture_cart', JSON.stringify(newCart));
    } catch (e) {
      console.log('Error saving cart', e);
    }
  };

  const filtered = products.filter(p => {
    return !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const addToCart = (id: string) => {
    const newCart = { ...cart, [id]: (cart[id] || 0) + 1 };
    setCart(newCart);
    saveCart(newCart);
  };

  const toggleWishlist = async (id: string) => {
    const next = new Set(wishlist);
    next.has(id) ? next.delete(id) : next.add(id);
    setWishlist(next);
    try {
      await AsyncStorage.setItem('furniture_wishlist', JSON.stringify(Array.from(next)));
    } catch (e) {
      console.log('Error saving wishlist', e);
    }
  };

  const handleCheckout = () => {
    router.push('/screens/furniture-cart');
  };

  const renderProduct = ({ item: p }: { item: Product }) => {
    const inCart = cart[p.id] || 0;
    const isWished = wishlist.has(p.id);
    const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
    return (
      <TouchableOpacity 
        style={styles.productCard} 
        activeOpacity={0.9} 
        onPress={() => router.push(`/screens/furniture-detail?id=${p.id}` as any)}
      >
        <View style={styles.productImageWrap}>
          <Image source={{ uri: p.image }} style={styles.productImage} resizeMode="cover" />
          {p.tag && (
            <View style={[styles.productTag, { backgroundColor: p.tag === 'Premium' ? Colors.warning : Colors.primary }]}>
              <Text style={styles.productTagText}>{p.tag}</Text>
            </View>
          )}
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}
          <TouchableOpacity style={styles.wishBtn} onPress={() => toggleWishlist(p.id)}>
            <MaterialCommunityIcons name={isWished ? 'heart' : 'heart-outline'} size={18} color={isWished ? Colors.danger : Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          {p.isVerified && (
            <View style={styles.verifiedRow}>
              <MaterialCommunityIcons name="shield-check" size={11} color={Colors.trust} />
              <Text style={styles.verifiedText}>{p.seller}</Text>
            </View>
          )}
          <Text style={styles.productName} numberOfLines={2}>{p.name}</Text>
          <View style={styles.ratingRow}>
            <MaterialCommunityIcons name="star" size={12} color={Colors.warning} />
            <Text style={styles.ratingText}>{p.rating}</Text>
            <Text style={styles.reviewsText}>({p.reviews})</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{fmt(p.price)}</Text>
            {p.originalPrice && <Text style={styles.originalPrice}>{fmt(p.originalPrice)}</Text>}
          </View>
          <View style={styles.deliveryRow}>
            <MaterialCommunityIcons name="truck-fast-outline" size={12} color={Colors.success} />
            <Text style={styles.deliveryText}>Delivery in {p.deliveryDays} day{p.deliveryDays > 1 ? 's' : ''}</Text>
          </View>
          
          <View onStartShouldSetResponder={() => true}>
            {inCart === 0 ? (
              <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(p.id)} activeOpacity={0.85}>
                <MaterialCommunityIcons name="cart-plus" size={15} color={Colors.white} />
                <Text style={styles.addBtnText}>Add to Cart</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => {
                  const val = Math.max(0, (cart[p.id] || 0) - 1);
                  const nextCart = { ...cart };
                  if (val === 0) {
                    delete nextCart[p.id];
                  } else {
                    nextCart[p.id] = val;
                  }
                  setCart(nextCart);
                  saveCart(nextCart);
                }}>
                  <MaterialCommunityIcons name="minus" size={16} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{inCart}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(p.id)}>
                  <MaterialCommunityIcons name="plus" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" backgroundColor="#D97706" translucent={false} />
      
      {/* Header */}
      <LinearGradient colors={['#D97706', '#F59E0B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>🛋️ Furniture & Beddings</Text>
          <Text style={styles.headerSub}>Furnish your new space today</Text>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={handleCheckout}>
          <MaterialCommunityIcons name="cart-outline" size={22} color={Colors.white} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* Post-move banner */}
      {isPostMove && (
        <View style={styles.postMoveBanner}>
          <Text style={styles.postMoveEmoji}>🎉</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.postMoveTitle}>Time to furnish your new place!</Text>
            <Text style={styles.postMoveSub}>Get essentials delivered in a few seconds.</Text>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchWrap}>
        <MaterialCommunityIcons name="magnify" size={18} color={Colors.muted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search furniture, beddings, or categories…"
          placeholderTextColor={Colors.placeholder}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={16} color={Colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results count & Checkout pill */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          {dbLoading ? 'Loading products...' : `${filtered.length} products`}
        </Text>
        {cartCount > 0 && (
          <TouchableOpacity style={styles.checkoutPill} onPress={handleCheckout}>
            <MaterialCommunityIcons name="cart-check" size={14} color={Colors.white} />
            <Text style={styles.checkoutPillText}>Checkout ({cartCount})</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Product grid */}
      {dbLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#D97706" size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          numColumns={2}
          renderItem={renderProduct}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing.lg },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.85)', marginTop: 1 },
  cartBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  cartBadge: { position: 'absolute', top: 0, right: 0, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.danger, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold },

  postMoveBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginHorizontal: Spacing.base, marginTop: Spacing.md,
    backgroundColor: '#FEF3C7', borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: '#FDE68A',
  },
  postMoveEmoji: { fontSize: 24 },
  postMoveTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#92400E' },
  postMoveSub: { fontSize: FontSize.xs, color: '#B45309', marginTop: 2 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.base, marginTop: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: FontSize.sm, color: Colors.text },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  resultsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, marginVertical: Spacing.sm },
  resultsText: { fontSize: FontSize.sm, color: Colors.muted, fontWeight: FontWeight.medium },
  checkoutPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.success, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full,
  },
  checkoutPillText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: FontWeight.bold },

  grid: { paddingHorizontal: Spacing.sm, paddingBottom: 100 },
  columnWrapper: { gap: Spacing.sm, marginBottom: Spacing.sm },

  productCard: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, overflow: 'hidden',
    ...Shadow.sm, borderWidth: 1, borderColor: Colors.border,
  },
  productImageWrap: { height: 140, position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  productTag: {
    position: 'absolute', top: 8, left: 8,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full,
  },
  productTagText: { fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold },
  discountBadge: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: Colors.danger, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full,
  },
  discountText: { fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold },
  wishBtn: {
    position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center',
  },
  productInfo: { padding: Spacing.sm, gap: 4 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  verifiedText: { fontSize: 10, color: Colors.trust, fontWeight: FontWeight.medium },
  productName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, lineHeight: 18 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 11, fontWeight: FontWeight.semibold, color: Colors.text },
  reviewsText: { fontSize: 10, color: Colors.muted },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' },
  price: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#D97706' },
  originalPrice: { fontSize: 10, color: Colors.muted, textDecorationLine: 'line-through' },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deliveryText: { fontSize: 10, color: Colors.success, fontWeight: FontWeight.medium },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    backgroundColor: '#D97706', borderRadius: Radius.full, paddingVertical: 7, marginTop: 4,
  },
  addBtnText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: FontWeight.bold },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.2, borderColor: '#D97706', borderRadius: Radius.full, paddingHorizontal: Spacing.sm, marginTop: 4 },
  qtyBtn: { padding: 5 },
  qtyText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
});

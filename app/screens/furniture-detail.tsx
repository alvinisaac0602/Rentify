import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Product } from './furniture-shop';

const fmt = (n: number) => `UGX ${new Intl.NumberFormat('en-UG').format(n)}`;

export default function FurnitureDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [product, setProduct] = useState<Product | null>(null);
  const [inCart, setInCart] = useState<number>(0);
  const [isWished, setIsWished] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProductDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const docRef = doc(db, 'furnitureProducts', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() } as Product);
      }
    } catch (e) {
      console.log('Error fetching product detail:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  useEffect(() => {
    if (product) {
      loadCartAndWishlist();
    }
  }, [product]);

  const loadCartAndWishlist = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('furniture_cart');
      if (savedCart && product) {
        const cartObj = JSON.parse(savedCart);
        setInCart(cartObj[product.id] || 0);
      }
      const savedWish = await AsyncStorage.getItem('furniture_wishlist');
      if (savedWish && product) {
        const wishList = JSON.parse(savedWish) as string[];
        setIsWished(wishList.includes(product.id));
      }
    } catch (e) {
      console.log('Error loading detailed state', e);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      const savedCart = await AsyncStorage.getItem('furniture_cart');
      const cartObj = savedCart ? JSON.parse(savedCart) : {};
      const newQty = (cartObj[product.id] || 0) + 1;
      cartObj[product.id] = newQty;
      setInCart(newQty);
      await AsyncStorage.setItem('furniture_cart', JSON.stringify(cartObj));
    } catch (e) {
      console.log('Error adding detailed cart', e);
    }
  };

  const handleRemoveFromCart = async () => {
    if (!product) return;
    try {
      const savedCart = await AsyncStorage.getItem('furniture_cart');
      const cartObj = savedCart ? JSON.parse(savedCart) : {};
      const newQty = Math.max(0, (cartObj[product.id] || 0) - 1);
      if (newQty === 0) {
        delete cartObj[product.id];
      } else {
        cartObj[product.id] = newQty;
      }
      setInCart(newQty);
      await AsyncStorage.setItem('furniture_cart', JSON.stringify(cartObj));
    } catch (e) {
      console.log('Error removing detailed cart', e);
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
    try {
      const savedWish = await AsyncStorage.getItem('furniture_wishlist');
      const wishList: string[] = savedWish ? JSON.parse(savedWish) : [];
      let updated: string[];
      if (wishList.includes(product.id)) {
        updated = wishList.filter(x => x !== product.id);
        setIsWished(false);
      } else {
        updated = [...wishList, product.id];
        setIsWished(true);
      }
      await AsyncStorage.setItem('furniture_wishlist', JSON.stringify(updated));
    } catch (e) {
      console.log('Error toggling detailed wishlist', e);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D97706" />
        <Text style={styles.loadingText}>Loading Product Details...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Product not found.</Text>
      </SafeAreaView>
    );
  }

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" backgroundColor="#D97706" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/screens/furniture-cart')}>
          <MaterialCommunityIcons name="cart-outline" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Product Image and Overlay Tags */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.mainImage} resizeMode="cover" />
          
          {product.tag && (
            <View style={[styles.tagBadge, { backgroundColor: product.tag === 'Premium' ? Colors.warning : Colors.primary }]}>
              <Text style={styles.tagBadgeText}>{product.tag}</Text>
            </View>
          )}

          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Detailed Card Body */}
        <View style={styles.detailsCard}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryName}>{product.category}</Text>
            <TouchableOpacity onPress={toggleWishlist}>
              <MaterialCommunityIcons 
                name={isWished ? 'heart' : 'heart-outline'} 
                size={26} 
                color={isWished ? Colors.danger : Colors.muted} 
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.productTitle}>{product.name}</Text>

          {/* Seller / Trust Badge */}
          <View style={styles.sellerRow}>
            <MaterialCommunityIcons name="shield-check" size={16} color={Colors.trust} />
            <Text style={styles.sellerName}>Seller: {product.seller}</Text>
            <View style={styles.trustBadge}>
              <Text style={styles.trustBadgeText}>Verified Partner</Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingSection}>
            <MaterialCommunityIcons name="star" size={18} color={Colors.warning} />
            <Text style={styles.ratingVal}>{product.rating}</Text>
            <Text style={styles.reviewsCount}>({product.reviews} reviews)</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionHeading}>Product Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>

          {/* Features / Information Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoTile}>
              <MaterialCommunityIcons name="truck-fast" size={24} color="#D97706" />
              <Text style={styles.infoTileTitle}>Delivery</Text>
              <Text style={styles.infoTileSub}>{product.deliveryDays} Day{product.deliveryDays > 1 ? 's' : ''}</Text>
            </View>

            <View style={styles.infoTile}>
              <MaterialCommunityIcons name="cash-check" size={24} color="#D97706" />
              <Text style={styles.infoTileTitle}>Payment</Text>
              <Text style={styles.infoTileSub}>COD / MM</Text>
            </View>

            <View style={styles.infoTile}>
              <MaterialCommunityIcons name="shield-lock" size={24} color="#D97706" />
              <Text style={styles.infoTileTitle}>Warranty</Text>
              <Text style={styles.infoTileSub}>1 Year</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buy Action Row */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.priceVal}>{fmt(product.price)}</Text>
        </View>

        <View style={styles.actionBtnContainer}>
          {inCart === 0 ? (
            <TouchableOpacity style={styles.buyBtn} onPress={handleAddToCart} activeOpacity={0.85}>
              <MaterialCommunityIcons name="cart-plus" size={20} color={Colors.white} />
              <Text style={styles.buyBtnText}>Add to Cart</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.quantityContainer}>
              <TouchableOpacity style={styles.qtyActionBtn} onPress={handleRemoveFromCart}>
                <MaterialCommunityIcons name="minus" size={20} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.qtyDisplayVal}>{inCart}</Text>
              <TouchableOpacity style={styles.qtyActionBtn} onPress={handleAddToCart}>
                <MaterialCommunityIcons name="plus" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  loadingText: { fontSize: FontSize.base, color: Colors.muted },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#D97706', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
  },
  headerBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },

  scrollBody: { paddingBottom: 150 },

  imageContainer: {
    width: '100%', height: 260, position: 'relative',
    backgroundColor: Colors.border,
  },
  mainImage: { width: '100%', height: '100%' },
  tagBadge: {
    position: 'absolute', top: 12, left: 12,
    paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.lg,
  },
  tagBadgeText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: FontWeight.bold },
  discountBadge: {
    position: 'absolute', bottom: 12, left: 12,
    backgroundColor: Colors.danger, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.lg,
  },
  discountText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: FontWeight.bold },

  detailsCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    marginTop: -20, padding: Spacing.base, gap: Spacing.md,
    ...Shadow.md,
  },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryName: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold, textTransform: 'uppercase' },
  productTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, lineHeight: 28 },

  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' },
  sellerName: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  trustBadge: {
    backgroundColor: Colors.trustLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm,
  },
  trustBadgeText: { fontSize: 10, color: Colors.trust, fontWeight: FontWeight.bold },

  ratingSection: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  ratingVal: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
  reviewsCount: { fontSize: FontSize.xs, color: Colors.muted },

  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.xs },

  sectionHeading: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  descriptionText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22 },

  infoGrid: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  infoTile: {
    flex: 1, backgroundColor: Colors.bg,
    borderRadius: Radius.lg, padding: Spacing.md,
    alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.border,
  },
  infoTileTitle: { fontSize: FontSize.xs, color: Colors.muted, fontWeight: FontWeight.semibold },
  infoTileSub: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    ...Shadow.md,
  },
  priceContainer: { gap: 2 },
  priceLabel: { fontSize: FontSize.xs, color: Colors.muted },
  priceVal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#D97706' },

  actionBtnContainer: { flex: 1, marginLeft: Spacing.xl },
  buyBtn: {
    backgroundColor: '#D97706', borderRadius: Radius.xl,
    paddingVertical: 12, flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: Spacing.xs,
  },
  buyBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: FontWeight.bold },

  quantityContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#D97706', borderRadius: Radius.xl, padding: 4,
  },
  qtyActionBtn: {
    padding: 8, borderRadius: Radius.lg,
  },
  qtyDisplayVal: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.white },
});

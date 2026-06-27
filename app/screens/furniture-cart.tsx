import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { PRODUCTS, Product } from './furniture-shop';

const fmt = (n: number) => `UGX ${new Intl.NumberFormat('en-UG').format(n)}`;

export default function FurnitureCartScreen() {
  const router = useRouter();
  const authContext = useAuth();
  const user = authContext?.user;

  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);

  // Delivery & payment form states
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'mobile_money'>('cash_on_delivery');

  useEffect(() => {
    loadCart();
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('furniture_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.log('Error loading cart', e);
    }
  };

  const updateCartQty = async (id: string, qty: number) => {
    const nextCart = { ...cart };
    if (qty <= 0) {
      delete nextCart[id];
    } else {
      nextCart[id] = qty;
    }
    setCart(nextCart);
    try {
      await AsyncStorage.setItem('furniture_cart', JSON.stringify(nextCart));
    } catch (e) {
      console.log('Error updating cart quantity', e);
    }
  };

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const product = PRODUCTS.find(p => p.id === id);
    return product ? { product, qty } : null;
  }).filter((x): x is { product: Product; qty: number } => x !== null);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const deliveryFee = subtotal > 500000 || subtotal === 0 ? 0 : 15000;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Required Info', 'Please enter your Full Name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Required Info', 'Please enter your Phone Number.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Required Info', 'Please enter your Delivery Address.');
      return;
    }

    setLoading(true);

    try {
      const orderId = `RT-FURN-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderData = {
        orderId,
        userId: user?.id || 'guest',
        customerName: name,
        customerPhone: phone,
        deliveryAddress: address,
        paymentMethod,
        paymentStatus: paymentMethod === 'mobile_money' ? 'completed' : 'pending',
        items: cartItems.map(item => ({
          id: item.product.id,
          name: item.product.name,
          category: item.product.category,
          price: item.product.price,
          qty: item.qty,
          image: item.product.image,
        })),
        subtotal,
        deliveryFee,
        totalAmount: total,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // 1. Save order to firestore for the Admin dashboard to monitor
      await addDoc(collection(db, 'furnitureOrders'), orderData);

      // 2. Save last order details to AsyncStorage for the receipt screen
      await AsyncStorage.setItem('last_furniture_order', JSON.stringify(orderData));

      // 3. Clear cart
      await AsyncStorage.removeItem('furniture_cart');
      setCart({});

      // 4. Navigate to receipt screen
      router.push('/screens/furniture-receipt');
    } catch (e: any) {
      console.log('Error creating furniture order', e);
      Alert.alert('Order Failed', 'Something went wrong: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" backgroundColor="#D97706" translucent={false} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="cart-off" size={64} color={Colors.muted} />
            <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptySub}>Browse our high-quality catalog to add items.</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => router.back()}>
              <Text style={styles.shopBtnText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Cart Items List */}
            <Text style={styles.sectionTitle}>Order Items ({cartItems.length})</Text>
            <View style={styles.itemsCard}>
              {cartItems.map(({ product, qty }) => (
                <View key={product.id} style={styles.itemRow}>
                  <Image source={{ uri: product.image }} style={styles.itemImage} resizeMode="cover" />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{product.name}</Text>
                    <Text style={styles.itemCat}>{product.category}</Text>
                    <Text style={styles.itemPrice}>{fmt(product.price)}</Text>
                  </View>
                  <View style={styles.qtyContainer}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartQty(product.id, qty - 1)}>
                      <MaterialCommunityIcons name="minus" size={14} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{qty}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartQty(product.id, qty + 1)}>
                      <MaterialCommunityIcons name="plus" size={14} color={Colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Delivery Info */}
            <Text style={styles.sectionTitle}>Delivery Information</Text>
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={Colors.placeholder}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="e.g. +256 700 000 000"
                  placeholderTextColor={Colors.placeholder}
                  keyboardType="phone-pad"
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Delivery Address</Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Street, Apartment details, Kampala..."
                  placeholderTextColor={Colors.placeholder}
                  multiline
                  numberOfLines={2}
                  style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                />
              </View>
            </View>

            {/* Payment Method */}
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentCard}>
              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === 'cash_on_delivery' && styles.paymentOptionActive]}
                onPress={() => setPaymentMethod('cash_on_delivery')}
              >
                <MaterialCommunityIcons 
                  name={paymentMethod === 'cash_on_delivery' ? 'radiobox-marked' : 'radiobox-blank'} 
                  size={20} 
                  color={paymentMethod === 'cash_on_delivery' ? '#D97706' : Colors.muted} 
                />
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <Text style={styles.paymentTitle}>Cash on Delivery (COD)</Text>
                  <Text style={styles.paymentSub}>Pay safely when the order reaches your doorstep.</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === 'mobile_money' && styles.paymentOptionActive]}
                onPress={() => setPaymentMethod('mobile_money')}
              >
                <MaterialCommunityIcons 
                  name={paymentMethod === 'mobile_money' ? 'radiobox-marked' : 'radiobox-blank'} 
                  size={20} 
                  color={paymentMethod === 'mobile_money' ? '#D97706' : Colors.muted} 
                />
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <Text style={styles.paymentTitle}>Mobile Money / Cards</Text>
                  <Text style={styles.paymentSub}>Instant billing via MTN MoMo, Airtel, or Visa/Mastercard.</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Pricing Summary */}
            <Text style={styles.sectionTitle}>Price Details</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryVal}>{fmt(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryVal}>{deliveryFee === 0 ? 'FREE' : fmt(deliveryFee)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={[styles.summaryRow, { marginTop: Spacing.xs }]}>
                <Text style={styles.grandTotalLabel}>Order Total</Text>
                <Text style={styles.grandTotalVal}>{fmt(total)}</Text>
              </View>
            </View>

            {/* Place Order CTA */}
            <TouchableOpacity 
              style={styles.orderBtn} 
              onPress={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-decagram" size={20} color={Colors.white} />
                  <Text style={styles.orderBtnText}>
                    {paymentMethod === 'mobile_money' ? 'Pay Now & Place Order' : 'Confirm Order'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#D97706', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },

  scrollContainer: { paddingHorizontal: Spacing.base, paddingBottom: 60 },

  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text, marginTop: Spacing.lg, marginBottom: Spacing.sm },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  emptySub: { fontSize: FontSize.sm, color: Colors.muted, textAlign: 'center', paddingHorizontal: Spacing.xl },
  shopBtn: { backgroundColor: '#D97706', borderRadius: Radius.xl, paddingVertical: 12, paddingHorizontal: 32, ...Shadow.sm },
  shopBtnText: { color: Colors.white, fontWeight: FontWeight.bold, fontSize: FontSize.base },

  itemsCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.md, gap: Spacing.md, ...Shadow.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  itemImage: { width: 64, height: 64, borderRadius: Radius.md },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  itemCat: { fontSize: 10, color: Colors.muted, textTransform: 'uppercase', fontWeight: FontWeight.bold },
  itemPrice: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#D97706' },

  qtyContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md },
  qtyBtn: { padding: 6 },
  qtyText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, paddingHorizontal: 8, color: Colors.text },

  formCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.md, gap: Spacing.md, ...Shadow.sm },
  inputGroup: { gap: 4 },
  inputLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  textInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 8, fontSize: FontSize.sm, color: Colors.text,
    backgroundColor: Colors.bg,
  },

  paymentCard: { gap: Spacing.sm },
  paymentOption: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    borderRadius: Radius.xl, backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border, ...Shadow.sm,
  },
  paymentOptionActive: { borderColor: '#D97706', backgroundColor: '#FFFBEB' },
  paymentTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
  paymentSub: { fontSize: FontSize.xs, color: Colors.muted, marginTop: 2 },

  summaryCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.md, gap: Spacing.sm, ...Shadow.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  summaryVal: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.semibold },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  grandTotalLabel: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  grandTotalVal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#D97706' },

  orderBtn: {
    backgroundColor: '#D97706', borderRadius: Radius.xl,
    paddingVertical: 14, flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.xl,
    ...Shadow.sm,
  },
  orderBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: FontWeight.bold },
});

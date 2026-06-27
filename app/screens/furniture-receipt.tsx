import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';

const fmt = (n: number) => `UGX ${new Intl.NumberFormat('en-UG').format(n)}`;

export default function FurnitureReceiptScreen() {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    try {
      const savedOrder = await AsyncStorage.getItem('last_furniture_order');
      if (savedOrder) {
        setOrder(JSON.parse(savedOrder));
      }
    } catch (e) {
      console.log('Error loading receipt order', e);
    }
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Generating Receipt...</Text>
      </SafeAreaView>
    );
  }

  const isPaid = order.paymentMethod === 'mobile_money';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" backgroundColor="#10B981" translucent={false} />

      {/* Success Banner */}
      <View style={styles.successBanner}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="check-bold" size={32} color="#10B981" />
        </View>
        <Text style={styles.successTitle}>Order Placed Successfully!</Text>
        <Text style={styles.successSub}>We shall contact you in a few seconds</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Receipt details */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptLogo}>🏠 RENTIFY SHOP</Text>
            <Text style={styles.receiptId}>Receipt: {order.orderId}</Text>
          </View>
          
          <View style={styles.dividerDashed} />

          {/* Customer details */}
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>Deliver To:</Text>
            <Text style={styles.detailsVal}>{order.customerName}</Text>
            <Text style={styles.detailsVal}>{order.customerPhone}</Text>
            <Text style={styles.detailsVal}>{order.deliveryAddress}</Text>
          </View>

          <View style={styles.dividerDashed} />

          {/* Items List */}
          <View style={styles.itemsSection}>
            <Text style={styles.detailsTitle}>Items Ordered:</Text>
            {order.items.map((item: any) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemName}>
                  {item.name} <Text style={styles.itemQty}>x{item.qty}</Text>
                </Text>
                <Text style={styles.itemPrice}>{fmt(item.price * item.qty)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.dividerDashed} />

          {/* Payment Method & Summary */}
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Mode:</Text>
              <Text style={styles.summaryVal}>
                {order.paymentMethod === 'mobile_money' ? '📱 Mobile Money' : '💵 Cash on Delivery'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status:</Text>
              <View style={[styles.statusBadge, { backgroundColor: isPaid ? '#D1FAE5' : '#FEF3C7' }]}>
                <Text style={[styles.statusBadgeText, { color: isPaid ? '#065F46' : '#92400E' }]}>
                  {isPaid ? 'PAID' : 'PENDING'}
                </Text>
              </View>
            </View>

            <View style={[styles.summaryRow, { marginTop: Spacing.sm }]}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryVal}>{fmt(order.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee:</Text>
              <Text style={styles.summaryVal}>
                {order.deliveryFee === 0 ? 'FREE' : fmt(order.deliveryFee)}
              </Text>
            </View>
            
            <View style={styles.dividerDashed} />

            <View style={[styles.summaryRow, { marginTop: Spacing.sm }]}>
              <Text style={styles.totalLabel}>Grand Total:</Text>
              <Text style={styles.totalVal}>{fmt(order.totalAmount)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.thankYouText}>Thank you for shopping with Rentify!</Text>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.doneBtn} 
          onPress={() => {
            router.dismissAll?.();
            router.push('/(tabs)' as any);
          }}
        >
          <Text style={styles.doneBtnText}>Back to Homepage</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: FontSize.base, color: Colors.muted },

  successBanner: {
    backgroundColor: '#10B981',
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    gap: 8,
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.md,
  },
  successTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  successSub: { fontSize: FontSize.sm, color: 'rgba(255, 255, 255, 0.9)' },

  scrollContainer: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.lg, paddingBottom: 60 },

  receiptCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    ...Shadow.md,
  },
  receiptHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  receiptLogo: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  receiptId: { fontSize: FontSize.xs, color: Colors.muted },

  dividerDashed: {
    height: 1, borderStyle: 'dashed', borderWidth: 1,
    borderColor: Colors.border, marginVertical: Spacing.md,
  },

  detailsSection: { gap: 4 },
  detailsTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 4 },
  detailsVal: { fontSize: FontSize.sm, color: Colors.textSecondary },

  itemsSection: { gap: Spacing.xs },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: FontSize.sm, color: Colors.text, flex: 1 },
  itemQty: { color: Colors.muted, fontWeight: FontWeight.semibold },
  itemPrice: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },

  summarySection: { gap: Spacing.xs },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  summaryVal: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.semibold },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.sm },
  statusBadgeText: { fontSize: 10, fontWeight: FontWeight.bold },

  totalLabel: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  totalVal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#10B981' },

  thankYouText: {
    textAlign: 'center', fontSize: FontSize.sm, color: Colors.muted,
    marginTop: Spacing.xl, fontStyle: 'italic',
  },

  doneBtn: {
    backgroundColor: '#10B981', borderRadius: Radius.xl,
    paddingVertical: 14, alignItems: 'center', marginTop: Spacing.lg,
    ...Shadow.sm,
  },
  doneBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: FontWeight.bold },
});

import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useCartContext } from '../../../lib/cart/CartContext';
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
} from '../../../lib/hooks/useApi';
import type { CartItem } from '../../../lib/mappers/cart';
import {
  getGuestCart,
  updateGuestCartQuantity,
  removeFromGuestCart,
  type GuestCartItem,
} from '../../../lib/medicineCart';
import type { PharmaciesStackParamList, MedicinesStackParamList } from '../../../navigation/types';
import { navigateContinueShopping } from '../../../lib/navigation/medicineFlow';


type DisplayCartItem = CartItem | GuestCartItem;

export function CartScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<MedicinesStackParamList | PharmaciesStackParamList>
    >();
  const { isAuthenticated } = useAuth();
  const { refreshCartCount } = useCartContext();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();

  const { data: serverCart, isLoading: serverLoading, refetch } = useCart({
    enabled: isAuthenticated,
  });

  const [guestItems, setGuestItems] = useState<GuestCartItem[]>([]);
  const [loadingGuest, setLoadingGuest] = useState(!isAuthenticated);

  const loadGuestCart = useCallback(async () => {
    setLoadingGuest(true);
    try {
      setGuestItems(await getGuestCart());
    } finally {
      setLoadingGuest(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        refetch();
      } else {
        loadGuestCart();
      }
      refreshCartCount();
    }, [isAuthenticated, refetch, loadGuestCart, refreshCartCount]),
  );

  const cartItems: DisplayCartItem[] = isAuthenticated
    ? serverCart?.items || []
    : guestItems;

  const isLoading = isAuthenticated ? serverLoading : loadingGuest;

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );
  const shipping = subtotal > 2000 ? 0 : 150;
  const tax = subtotal * 0.05;
  const total = Math.max(0, subtotal + shipping + tax);

  const updateQuantity = async (item: DisplayCartItem, delta: number) => {
    const newQty = Math.max(1, item.quantity + delta);

    try {
      if (isAuthenticated) {
        await updateCartItem.mutateAsync({
          itemId: item.productId,
          quantity: newQty,
        });
        refetch();
      } else {
        const next = await updateGuestCartQuantity(item.productId, newQty);
        setGuestItems(next);
      }
      await refreshCartCount();
    } catch (error) {
      Alert.alert(
        'Update failed',
        error instanceof Error ? error.message : 'Could not update quantity.',
      );
    }
  };

  const handleRemove = async (item: DisplayCartItem) => {
    try {
      if (isAuthenticated) {
        await removeCartItem.mutateAsync(item.productId);
        refetch();
      } else {
        const next = await removeFromGuestCart(item.productId);
        setGuestItems(next);
      }
      await refreshCartCount();
    } catch (error) {
      Alert.alert(
        'Remove failed',
        error instanceof Error ? error.message : 'Could not remove item.',
      );
    }
  };

  return (
    <ScreenLayout headerMode="stack" title="Shopping Cart" showSearch={false}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brandPrimary} />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="cart-outline" size={56} color={colors.neutral300} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>
            Browse medicines and add them to your cart.
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigateContinueShopping(navigation)}
            activeOpacity={0.85}>
            <Text style={styles.browseBtnText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, spacing.xl) },
          ]}
          showsVerticalScrollIndicator={false}>
          {cartItems.map(item => (
            <View key={item.productId} style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemBody}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemVendor}>{item.vendor}</Text>
                <Text style={styles.itemPrice}>
                  PKR {(item.price * item.quantity).toLocaleString()}
                </Text>
                <View style={styles.itemActions}>
                  <View style={styles.qtyControl}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item, -1)}
                      disabled={item.quantity <= 1}>
                      <Icon name="minus" size={14} color={colors.neutral600} />
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item, 1)}>
                      <Icon name="plus" size={14} color={colors.neutral600} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => handleRemove(item)}>
                    <Icon name="delete-outline" size={20} color={colors.statusDanger} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <SummaryRow label={`Subtotal (${cartItems.length} items)`} value={subtotal} />
            <SummaryRow
              label="Shipping"
              value={shipping}
              valueText={shipping === 0 ? 'Free' : undefined}
            />
            <SummaryRow label="Tax (5%)" value={tax} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>PKR {total.toLocaleString()}</Text>
            </View>
            <Text style={styles.secureNote}>
              Items are not reserved until checkout is complete.
            </Text>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate('Checkout')}
              activeOpacity={0.85}>
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              <Icon name="arrow-right" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </ScreenLayout>
  );
}

function SummaryRow({
  label,
  value,
  valueText,
}: {
  label: string;
  value: number;
  valueText?: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>
        {valueText || `PKR ${value.toLocaleString()}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  headerSpacer: { width: 40 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    backgroundColor: colors.surfaceSubtle,
  },
  loadingText: { marginTop: spacing.md, fontSize: 14, color: colors.neutral500 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    backgroundColor: colors.surfaceSubtle,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginTop: spacing.lg,
  },
  emptySub: {
    fontSize: 14,
    color: colors.neutral500,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  browseBtn: {
    paddingHorizontal: spacing.xl,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { padding: spacing.lg, gap: spacing.md },
  itemCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.md,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.neutral100,
  },
  itemBody: { flex: 1 },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkHeadline,
    lineHeight: 19,
  },
  itemVendor: {
    fontSize: 12,
    color: colors.brandPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginTop: spacing.sm,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral100,
  },
  qtyValue: {
    width: 36,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: { fontSize: 14, color: colors.neutral600 },
  summaryValue: { fontSize: 14, fontWeight: '600', color: colors.inkHeadline },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
    marginBottom: spacing.sm,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.inkHeadline },
  totalValue: { fontSize: 22, fontWeight: '700', color: colors.brandPrimary },
  secureNote: {
    fontSize: 12,
    color: colors.neutral500,
    marginBottom: spacing.lg,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
  },
  checkoutBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
});
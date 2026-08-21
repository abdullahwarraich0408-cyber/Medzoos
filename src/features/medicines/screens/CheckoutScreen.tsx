import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { useAuth } from '../../../lib/auth/AuthContext';
import { navigateToSignIn, navigateToOrders } from '../../../lib/auth/navigation';
import { useCart, useCreateOrder } from '../../../lib/hooks/useApi';
import {
  clearGuestCart,
  getGuestCart,
  type GuestCartItem,
} from '../../../lib/medicineCart';
import type { CartItem } from '../../../lib/mappers/cart';
import type { PharmaciesStackParamList, MedicinesStackParamList } from '../../../navigation/types';
import { navigateContinueShopping } from '../../../lib/navigation/medicineFlow';

import { useLocationContext } from '../../../lib/location/LocationContext';
import type { DetectedLocation } from '../../../lib/location/types';
import { UseLocationButton } from '../../../components/location/UseLocationButton';

type CheckoutItem = CartItem | GuestCartItem;

export function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<MedicinesStackParamList | PharmaciesStackParamList>
    >();
  const { user, isAuthenticated } = useAuth();
  const { location: savedCity, detectedAddress } = useLocationContext();
  const createOrder = useCreateOrder();

  const { data: serverCart, refetch } = useCart({ enabled: isAuthenticated });
  const [guestItems, setGuestItems] = useState<GuestCartItem[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [orderId, setOrderId] = useState('');

  const [address, setAddress] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    phone: user?.phone || '',
    street: detectedAddress?.street || '',
    city: detectedAddress?.city || savedCity || 'Karachi',
    province: detectedAddress?.province || 'Sindh',
    zip: '',
  });

  const loadGuestCart = useCallback(async () => {
    setGuestItems(await getGuestCart());
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) loadGuestCart();
      else refetch();
    }, [isAuthenticated, loadGuestCart, refetch]),
  );

  const cartItems: CheckoutItem[] = isAuthenticated
    ? serverCart?.items || []
    : guestItems;

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );
  const shipping = subtotal > 2000 ? 0 : 150;
  const tax = subtotal * 0.05;
  const total = Math.max(0, subtotal + shipping + tax);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      Alert.alert('Sign in required', 'Please sign in to complete checkout.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigateToSignIn(navigation) },
      ]);
      return;
    }

    if (!cartItems.length) {
      Alert.alert('Empty cart', 'Add medicines before checkout.');
      navigateContinueShopping(navigation);
      return;
    }

    if (!address.firstName.trim() || !address.phone.trim() || !address.street.trim() || !address.city.trim()) {
      Alert.alert('Missing details', 'Please complete all required delivery fields.');
      return;
    }

    try {
      const result = await createOrder.mutateAsync({
        items: cartItems.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        delivery_address: {
          street: address.street.trim(),
          city: address.city.trim(),
          zip: address.zip.trim() || '00000',
        },
        payment_method: 'cod',
      });

      const created =
        result.orders ||
        (result.order ? [result.order] : []);
      const id =
        (created[0] as { id?: string })?.id || `ORD-${Date.now()}`;

      await clearGuestCart();
      setOrderId(id);
      setStep(2);
    } catch (error) {
      Alert.alert(
        'Checkout failed',
        error instanceof Error ? error.message : 'Could not place order.',
      );
    }
  };

  if (step === 2) {
    return (
      <ScreenLayout
        headerMode="stack"
        title="Order Placed"
        showSearch={false}
        showCart={false}>
        <View style={[styles.success, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
          <View style={styles.successIcon}>
            <Icon name="check-circle" size={64} color={colors.statusSuccess} />
          </View>
          <Text style={styles.successTitle}>Order Placed!</Text>
          <Text style={styles.successSub}>
            Your order {orderId} has been confirmed. Pay on delivery.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigateToOrders(navigation)}
            activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>View Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigateContinueShopping(navigation)}
            activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout headerMode="stack" title="Checkout" showSearch={false}>
      {!cartItems.length ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigateContinueShopping(navigation)}>
            <Text style={styles.primaryBtnText}>Browse Medicines</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, spacing.xl) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {cartItems.map(item => (
              <View key={item.productId} style={styles.summaryItem}>
                <Text style={styles.summaryName} numberOfLines={1}>
                  {item.name} × {item.quantity}
                </Text>
                <Text style={styles.summaryPrice}>
                  PKR {(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total (incl. tax & shipping)</Text>
              <Text style={styles.totalValue}>PKR {total.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Delivery Details</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.half]}
                placeholder="First name *"
                placeholderTextColor={colors.neutral500}
                value={address.firstName}
                onChangeText={v => setAddress(a => ({ ...a, firstName: v }))}
              />
              <TextInput
                style={[styles.input, styles.half]}
                placeholder="Last name"
                placeholderTextColor={colors.neutral500}
                value={address.lastName}
                onChangeText={v => setAddress(a => ({ ...a, lastName: v }))}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Phone *"
              placeholderTextColor={colors.neutral500}
              keyboardType="phone-pad"
              value={address.phone}
              onChangeText={v => setAddress(a => ({ ...a, phone: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Street address *"
              placeholderTextColor={colors.neutral500}
              value={address.street}
              onChangeText={v => setAddress(a => ({ ...a, street: v }))}
            />
            <UseLocationButton
              onLocationDetected={(loc: DetectedLocation) =>
                setAddress(a => ({
                  ...a,
                  street: loc.street || a.street,
                  city: loc.city || a.city,
                  province: loc.province || a.province,
                }))
              }
              style={styles.locationBtn}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.half]}
                placeholder="City *"
                placeholderTextColor={colors.neutral500}
                value={address.city}
                onChangeText={v => setAddress(a => ({ ...a, city: v }))}
              />
              <TextInput
                style={[styles.input, styles.half]}
                placeholder="Province"
                placeholderTextColor={colors.neutral500}
                value={address.province}
                onChangeText={v => setAddress(a => ({ ...a, province: v }))}
              />
            </View>

            <View style={styles.codBanner}>
              <Icon name="cash" size={20} color={colors.brandPrimary} />
              <Text style={styles.codText}>
                Cash on delivery — pay when your order arrives.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                createOrder.isPending && styles.btnDisabled,
              ]}
              onPress={handlePlaceOrder}
              disabled={createOrder.isPending}
              activeOpacity={0.85}>
              {createOrder.isPending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryBtnText}>
                  Place Order · PKR {total.toLocaleString()}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </ScreenLayout>
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
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { padding: spacing.lg, gap: spacing.md },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    backgroundColor: colors.surfaceSubtle,
    gap: spacing.lg,
  },
  emptyText: { fontSize: 15, color: colors.neutral500 },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: spacing.md,
  },
  summaryName: { flex: 1, fontSize: 13, color: colors.neutral600 },
  summaryPrice: { fontSize: 13, fontWeight: '600', color: colors.inkHeadline },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
  },
  totalLabel: { fontSize: 14, fontWeight: '600', color: colors.inkHeadline },
  totalValue: { fontSize: 18, fontWeight: '700', color: colors.brandPrimary },
  row: { flexDirection: 'row', gap: spacing.sm },
  locationBtn: { marginBottom: spacing.sm },
  half: { flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.inkHeadline,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  codBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brandLight,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  codText: { flex: 1, fontSize: 13, color: colors.neutral800 },
  primaryBtn: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
  secondaryBtn: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.brandPrimary,
  },
  success: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    backgroundColor: colors.surfaceSubtle,
  },
  successIcon: { marginBottom: spacing.lg },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: spacing.sm,
  },
  successSub: {
    fontSize: 14,
    color: colors.neutral500,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 21,
  },
});
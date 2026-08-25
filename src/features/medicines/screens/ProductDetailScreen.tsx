import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { useState } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { useCartContext } from '../../../lib/cart/CartContext';
import {
  useProduct,
  useProducts,
} from '../../../lib/hooks/useApi';
import type { PharmaciesStackParamList, MedicinesStackParamList } from '../../../navigation/types';

import { MedicineCard } from '../components/MedicineCard';

type ProductRoute = RouteProp<
  MedicinesStackParamList | PharmaciesStackParamList,
  'ProductDetail'
>;

export function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<MedicinesStackParamList | PharmaciesStackParamList>
    >();
  const route = useRoute<ProductRoute>();
  const { productId } = route.params;
  const { addMedicineToCart, cartCount } = useCartContext();
  const [adding, setAdding] = useState(false);

  const { data: apiProduct, isLoading } = useProduct(productId);
  const { data: allProducts = [] } = useProducts();
  const product = apiProduct;

  const [quantity, setQuantity] = useState(1);

  const similar = allProducts
    .filter(
      item => item.id !== productId && item.category === apiProduct?.category,
    )
    .slice(0, 4);

  const outOfStock = product?.stock === 0;

  const handleAddToCart = async () => {
    if (!product || outOfStock) return;

    setAdding(true);
    try {
      await addMedicineToCart(product, quantity);
      Alert.alert('Added to cart', `${quantity} x ${product.name} added.`);
    } catch (error) {
      Alert.alert(
        'Could not add',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || outOfStock) return;
    setAdding(true);
    try {
      await addMedicineToCart(product, quantity);
      navigation.navigate('Cart');
    } catch (error) {
      Alert.alert(
        'Could not add',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <ScreenLayout
      headerMode="stack"
      title="Product Details"
      showSearch={false}
      onCartPress={() => navigation.navigate('Cart')}
      cartCount={cartCount}>
      {isLoading && !product ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brandPrimary} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      ) : !product ? (
        <View style={styles.center}>
          <Icon name="pill" size={48} color={colors.neutral300} />
          <Text style={styles.errorTitle}>Product not found</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => navigation.goBack()}>
            <Text style={styles.retryText}>Browse medicines</Text>
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
          <View style={styles.imageCard}>
            <Image source={{ uri: product.image }} style={styles.image} />
            {product.prescriptionRequired && (
              <View style={styles.rxBadge}>
                <Text style={styles.rxText}>Prescription Required</Text>
              </View>
            )}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.generic}>{product.generic}</Text>
            <View style={styles.vendorRow}>
              <Icon name="store" size={14} color={colors.brandPrimary} />
              <Text style={styles.vendor}>{product.vendor}</Text>
            </View>

            <View style={styles.ratingRow}>
              <Icon name="star" size={14} color={colors.rating} />
              <Text style={styles.rating}>{product.rating}</Text>
              <Text style={styles.reviews}>({product.reviews} reviews)</Text>
            </View>

            <Text style={styles.price}>PKR {product.price.toLocaleString()}</Text>
            <Text style={styles.stock}>
              {outOfStock
                ? 'Out of stock'
                : `${product.stock} units available · ${product.deliveryEta}`}
            </Text>

            {product.description ? (
              <Text style={styles.description}>{product.description}</Text>
            ) : (
              <Text style={styles.description}>
                Clinically proven formula from authorized distributors. Stored
                under recommended conditions.
              </Text>
            )}

            <View style={styles.qtyRow}>
              <Text style={styles.qtyLabel}>Quantity</Text>
              <View style={styles.qtyControl}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}>
                  <Icon name="minus" size={16} color={colors.neutral600} />
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(q => q + 1)}
                  disabled={outOfStock}>
                  <Icon name="plus" size={16} color={colors.neutral600} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, outOfStock && styles.btnDisabled]}
              onPress={handleAddToCart}
              disabled={outOfStock || adding}
              activeOpacity={0.85}>
              {adding ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Icon name="cart-outline" size={18} color={colors.white} />
                  <Text style={styles.primaryBtnText}>Add to Cart</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryBtn, outOfStock && styles.btnDisabled]}
              onPress={handleBuyNow}
              disabled={outOfStock}
              activeOpacity={0.85}>
              <Text style={styles.secondaryBtnText}>Buy Now</Text>
            </TouchableOpacity>
          </View>

          {similar.length > 0 && (
            <View style={styles.similarSection}>
              <Text style={styles.similarTitle}>Similar Medicines</Text>
              <View style={styles.similarGrid}>
                {similar.map(item => (
                  <View key={item.id} style={styles.similarItem}>
                    <MedicineCard
                      medicine={item}
                      onPress={m =>
                        navigation.replace('ProductDetail', {
                          productId: m.id,
                        })
                      }
                    />
                  </View>
                ))}
              </View>
            </View>
          )}
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
  cartBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.statusDanger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
  },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { padding: spacing.lg, gap: spacing.lg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    backgroundColor: colors.surfaceSubtle,
  },
  loadingText: { marginTop: spacing.md, fontSize: 14, color: colors.neutral500 },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginTop: spacing.lg,
  },
  retryBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
  },
  retryText: { fontSize: 14, fontWeight: '600', color: colors.white },
  imageCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    overflow: 'hidden',
    aspectRatio: 1,
  },
  image: { width: '100%', height: '100%' },
  rxBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.inkHeadline,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  rxText: { fontSize: 11, fontWeight: '700', color: colors.white },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.inkHeadline,
    lineHeight: 28,
  },
  generic: { fontSize: 14, color: colors.neutral500, marginTop: 4 },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  vendor: { fontSize: 13, fontWeight: '600', color: colors.neutral600 },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  rating: { fontSize: 13, fontWeight: '700', color: colors.inkHeadline },
  reviews: { fontSize: 12, color: colors.neutral500 },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.brandPrimary,
    marginTop: spacing.md,
  },
  stock: { fontSize: 13, color: colors.neutral500, marginTop: 4 },
  description: {
    fontSize: 14,
    color: colors.neutral600,
    lineHeight: 21,
    marginTop: spacing.md,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  qtyLabel: { fontSize: 14, fontWeight: '600', color: colors.inkHeadline },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral100,
  },
  qtyValue: {
    width: 40,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    marginBottom: spacing.sm,
  },
  secondaryBtn: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.brandPrimary,
  },
  similarSection: { marginTop: spacing.sm },
  similarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: spacing.md,
  },
  similarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  similarItem: { width: '47%' },
});
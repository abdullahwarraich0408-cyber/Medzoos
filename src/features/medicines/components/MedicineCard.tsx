import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCartContext } from '../../../lib/cart/CartContext';
import type { Medicine } from '../../../lib/mappers/product';
import { colors, spacing, radius, shadows, cardStyles } from '../../../theme';

type MedicineCardProps = {
  medicine: Medicine;
  onPress: (medicine: Medicine) => void;
};

export function MedicineCard({ medicine, onPress }: MedicineCardProps) {
  const { addMedicineToCart } = useCartContext();
  const [adding, setAdding] = useState(false);
  const outOfStock = medicine.stock === 0;

  const handleAddToCart = async () => {
    if (outOfStock) return;

    setAdding(true);
    try {
      await addMedicineToCart(medicine, 1);
      Alert.alert('Added to cart', `${medicine.name} added to your cart.`);
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
    <View style={styles.card}>
      <Pressable
        onPress={() => onPress(medicine)}
        style={({ pressed }) => [pressed && styles.cardPressed]}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: medicine.image }} style={styles.image} />
          {medicine.prescriptionRequired && (
            <View style={styles.rxBadge}>
              <Text style={styles.rxText}>Rx</Text>
            </View>
          )}
          {outOfStock && (
            <View style={styles.outOverlay}>
              <Text style={styles.outText}>Out of Stock</Text>
            </View>
          )}
        </View>

        <View style={styles.bodyTop}>
          <Text style={styles.name} numberOfLines={2}>
            {medicine.name}
          </Text>
          <Text style={styles.generic} numberOfLines={1}>
            {medicine.generic}
          </Text>

          <View style={styles.vendorRow}>
            <Icon name="store" size={12} color={colors.brandPrimary} />
            <Text style={styles.vendor} numberOfLines={1}>
              {medicine.vendor}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.stockRow}>
              <View
                style={[
                  styles.stockDot,
                  outOfStock ? styles.stockDotOut : styles.stockDotIn,
                ]}
              />
              <Text style={styles.stockText}>
                {outOfStock ? 'Out of stock' : `${medicine.stock} in stock`}
              </Text>
            </View>
            <View style={styles.etaRow}>
              <Icon name="clock-outline" size={11} color={colors.brandPrimary} />
              <Text style={styles.eta}>{medicine.deliveryEta}</Text>
            </View>
          </View>

          <Text style={styles.price}>PKR {medicine.price.toLocaleString()}</Text>
        </View>
      </Pressable>

      <View style={styles.bodyBottom}>
        <TouchableOpacity
          style={[styles.cartBtn, outOfStock && styles.cartBtnDisabled]}
          onPress={handleAddToCart}
          disabled={outOfStock || adding}
          activeOpacity={0.85}>
          {adding ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Icon name="cart-outline" size={16} color={colors.white} />
              <Text style={styles.cartBtnText}>
                {outOfStock ? 'Unavailable' : 'Add to Cart'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    ...cardStyles.listCard,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cardPressed: { opacity: 0.92 },
  imageWrap: {
    aspectRatio: 4 / 3,
    backgroundColor: colors.neutral100,
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  rxBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.inkHeadline,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  rxText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  outOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bodyTop: { padding: spacing.md, paddingBottom: spacing.sm },
  bodyBottom: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkHeadline,
    lineHeight: 19,
    marginBottom: 2,
  },
  generic: {
    fontSize: 12,
    color: colors.neutral500,
    marginBottom: spacing.sm,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  vendor: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral600,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockDotIn: { backgroundColor: colors.statusSuccess },
  stockDotOut: { backgroundColor: colors.statusDanger },
  stockText: { fontSize: 11, color: colors.neutral600 },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  eta: { fontSize: 10, fontWeight: '600', color: colors.brandPrimary },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  cartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
  },
  cartBtnDisabled: {
    backgroundColor: colors.neutral300,
  },
  cartBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
});

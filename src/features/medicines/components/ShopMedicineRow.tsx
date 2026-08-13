import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Medicine } from '../../../lib/mappers/product';
import { useCartContext } from '../../../lib/cart/CartContext';
import { colors, spacing, radius, appIcons, appIconTile } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

type ShopMedicineRowProps = {
  medicine: Medicine;
  onPress: () => void;
};

export function ShopMedicineRow({ medicine, onPress }: ShopMedicineRowProps) {
  const { addMedicineToCart } = useCartContext();
  const [adding, setAdding] = useState(false);
  const outOfStock = medicine.stock === 0;

  const handleAdd = async () => {
    if (outOfStock) return;
    setAdding(true);
    try {
      await addMedicineToCart(medicine, 1);
      Alert.alert('Added', `${medicine.name} added to cart.`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Could not add.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}>
      <View style={styles.iconWrap}>
        <Icon name="pill" size={appIcons.size.md} color={appIcons.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {medicine.name}
        </Text>
        <Text style={styles.generic} numberOfLines={1}>
          {medicine.generic}
        </Text>
        <Text style={styles.vendor}>{medicine.vendor}</Text>
        <Text style={styles.price}>PKR {medicine.price.toLocaleString()}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.addBtn,
          outOfStock && styles.addBtnDisabled,
          pressed && !outOfStock && styles.addBtnPressed,
        ]}
        onPress={handleAdd}
        disabled={outOfStock || adding}>
        {adding ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={styles.addBtnText}>{outOfStock ? 'Out' : 'Add'}</Text>
        )}
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowPressed: { backgroundColor: colors.brandMist },
  iconWrap: appIconTile('md'),
  body: { flex: 1, gap: 2 },
  name: {
    ...healthOsTypography.messageTitle,
    fontSize: 14,
  },
  generic: {
    fontSize: 12,
    color: colors.neutral500,
  },
  vendor: {
    fontSize: 11,
    color: colors.neutral500,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brandPrimary,
    marginTop: 2,
  },
  addBtn: {
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
  },
  addBtnDisabled: {
    backgroundColor: colors.neutral300,
  },
  addBtnPressed: { opacity: 0.9 },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
});

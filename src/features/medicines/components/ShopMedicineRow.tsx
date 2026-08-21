import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Medicine } from '../../../lib/mappers/product';
import { useCartContext } from '../../../lib/cart/CartContext';
import { colors, spacing, radius } from '../../../theme';

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
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Could not add.',
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}>
      <View style={styles.iconWrap}>
        <Icon name="pill" size={18} color={colors.primary700} />
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {medicine.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          PKR {medicine.price.toLocaleString()}
          {medicine.generic ? ` · ${medicine.generic}` : ''}
        </Text>
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
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowPressed: { backgroundColor: colors.primary100 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2, minWidth: 0 },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  addBtn: {
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary700,
  },
  addBtnDisabled: {
    backgroundColor: colors.textDisabled,
  },
  addBtnPressed: { opacity: 0.88 },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
});

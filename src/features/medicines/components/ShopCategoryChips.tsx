import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SHOP_CATEGORIES, type ShopCategoryId } from '../data/medicineModel';
import { colors, spacing, radius, shadows } from '../../../theme';

type ShopCategoryChipsProps = {
  active: ShopCategoryId | 'all';
  onChange: (id: ShopCategoryId | 'all') => void;
};

export function ShopCategoryChips({ active, onChange }: ShopCategoryChipsProps) {
  const items = [{ id: 'all' as const, label: 'All' }, ...SHOP_CATEGORIES];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {items.map(item => {
        const isActive = active === item.id;
        return (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.chip,
              isActive && styles.chipActive,
              pressed && !isActive && styles.chipPressed,
            ]}
            onPress={() => onChange(item.id)}>
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingBottom: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.12)',
    ...shadows.cardSoft,
  },
  chipActive: {
    backgroundColor: colors.brandLight,
    borderColor: 'rgba(17, 61, 99, 0.2)',
  },
  chipPressed: { backgroundColor: colors.brandMist },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral600,
  },
  chipTextActive: {
    color: colors.brandPrimary,
  },
});

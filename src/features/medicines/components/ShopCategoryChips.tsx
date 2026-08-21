import React from 'react';
import { Pressable, StyleSheet, Text, ScrollView } from 'react-native';
import { SHOP_CATEGORIES, type ShopCategoryId } from '../data/medicineModel';
import { colors, spacing, radius } from '../../../theme';

type ShopCategoryChipsProps = {
  active: ShopCategoryId | 'all';
  onChange: (id: ShopCategoryId | 'all') => void;
};

const LABELS: Record<string, string> = {
  all: 'All',
  prescription: 'Rx',
  otc: 'OTC',
  supplements: 'Supplements',
  first_aid: 'First aid',
};

export function ShopCategoryChips({ active, onChange }: ShopCategoryChipsProps) {
  const items = [{ id: 'all' as const }, ...SHOP_CATEGORIES];

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
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onChange(item.id)}>
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {LABELS[item.id] ?? item.id}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipActive: {
    backgroundColor: colors.primary100,
    borderColor: colors.primary300,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.primary800,
  },
});

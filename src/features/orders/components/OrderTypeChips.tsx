import React from 'react';
import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';
import { ORDER_TYPE_FILTERS, type OrderTypeFilter } from '../data/orderModel';
import { colors, spacing, radius, shadows } from '../../../theme';

type OrderTypeChipsProps = {
  active: OrderTypeFilter;
  onChange: (filter: OrderTypeFilter) => void;
};

export function OrderTypeChips({ active, onChange }: OrderTypeChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {ORDER_TYPE_FILTERS.map(chip => {
        const isActive = active === chip.id;
        return (
          <Pressable
            key={chip.id}
            style={({ pressed }) => [
              styles.chip,
              isActive && styles.chipActive,
              pressed && !isActive && styles.chipPressed,
            ]}
            onPress={() => onChange(chip.id)}>
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {chip.label}
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

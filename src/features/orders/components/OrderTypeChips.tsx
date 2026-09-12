import React from 'react';
import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ORDER_TYPE_FILTERS, type OrderTypeFilter } from '../data/orderModel';
import { ordersBrand } from '../ordersBrand';
import { spacing, radius } from '../../../theme';

const TYPE_ICONS: Record<OrderTypeFilter, string> = {
  all: 'view-grid-outline',
  medicines: 'pill',
  labs: 'flask-outline',
  doctors: 'stethoscope',
  hospitals: 'hospital-building',
  prescriptions: 'file-document-outline',
};

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
            <Icon
              name={TYPE_ICONS[chip.id]}
              size={14}
              color={isActive ? ordersBrand.onAccent : ordersBrand.accent}
            />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: ordersBrand.card,
    borderWidth: 1,
    borderColor: ordersBrand.border,
  },
  chipActive: {
    backgroundColor: ordersBrand.accent,
    borderColor: ordersBrand.accent,
  },
  chipPressed: { backgroundColor: ordersBrand.soft },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: ordersBrand.ink,
  },
  chipTextActive: {
    color: ordersBrand.onAccent,
  },
});

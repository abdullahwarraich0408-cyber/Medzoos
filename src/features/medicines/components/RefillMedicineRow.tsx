import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PatientMedicine } from '../data/medicineModel';
import { colors, spacing, radius } from '../../../theme';

type RefillMedicineRowProps = {
  medicine: PatientMedicine;
  onRefill: () => void;
};

export function RefillMedicineRow({ medicine, onRefill }: RefillMedicineRowProps) {
  const remainingLabel =
    medicine.remainingDays === 0
      ? 'Due today'
      : medicine.remainingDays === 1
        ? '1 day left'
        : `${medicine.remainingDays ?? 0} days left`;

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Icon name="pill" size={18} color={colors.primary700} />
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {medicine.medicineName}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {remainingLabel}
          {medicine.price != null
            ? ` · PKR ${medicine.price.toLocaleString()}`
            : ''}
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.refillBtn,
          pressed && styles.refillBtnPressed,
        ]}
        onPress={onRefill}>
        <Text style={styles.refillBtnText}>Refill</Text>
      </Pressable>
    </View>
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
  refillBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary700,
  },
  refillBtnPressed: { opacity: 0.88 },
  refillBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
});

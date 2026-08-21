import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PatientMedicine } from '../data/medicineModel';
import { getRefillLabel } from '../data/medicineModel';
import { colors, spacing, radius } from '../../../theme';

type ActiveMedicineRowProps = {
  medicine: PatientMedicine;
  onPress: () => void;
};

export function ActiveMedicineRow({ medicine, onPress }: ActiveMedicineRowProps) {
  const refillLabel = getRefillLabel(medicine);
  const needsRefill = refillLabel !== 'No refill needed';

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.iconWrap}>
        <Icon name="pill" size={18} color={colors.primary700} />
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {medicine.medicineName}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {[medicine.strength || medicine.dosage, medicine.timing]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
      {needsRefill ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Refill</Text>
        </View>
      ) : (
        <Icon name="chevron-right" size={18} color={colors.textMuted} />
      )}
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
  pressed: { backgroundColor: colors.primary100 },
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
  badge: {
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9A6B12',
  },
});

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PatientMedicine } from '../data/medicineModel';
import { colors, spacing, radius, appIcons, appIconTile } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

type RefillMedicineRowProps = {
  medicine: PatientMedicine;
  onRefill: () => void;
};

export function RefillMedicineRow({ medicine, onRefill }: RefillMedicineRowProps) {
  const remainingLabel =
    medicine.remainingDays === 0
      ? 'Refill due today'
      : medicine.remainingDays === 1
        ? '1 day remaining'
        : `${medicine.remainingDays ?? 0} days remaining`;

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Icon name="pill" size={appIcons.size.md} color={appIcons.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{medicine.medicineName}</Text>
        <Text style={styles.generic}>{medicine.genericName}</Text>
        <Text style={styles.remaining}>{remainingLabel}</Text>
        <Text style={styles.price}>
          PKR {(medicine.price ?? 0).toLocaleString()} · {medicine.pharmacyName || 'Pharmacy'}
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.refillBtn, pressed && styles.refillBtnPressed]}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconWrap: appIconTile('md'),
  body: { flex: 1, gap: 2 },
  name: {
    ...healthOsTypography.messageTitle,
    fontSize: 15,
  },
  generic: {
    fontSize: 13,
    color: colors.neutral500,
  },
  remaining: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brandPrimary,
    marginTop: 2,
  },
  price: {
    fontSize: 12,
    color: colors.neutral500,
  },
  refillBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
  },
  refillBtnPressed: { opacity: 0.9 },
  refillBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
});

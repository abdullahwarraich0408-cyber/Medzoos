import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PatientMedicine } from '../data/medicineModel';
import { getRefillLabel, getSourceLabel } from '../data/medicineModel';
import { colors, spacing, cardStyles, appIcons, appIconTile } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

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
        <Icon name="pill" size={appIcons.size.md} color={appIcons.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{medicine.medicineName}</Text>
        <Text style={styles.generic}>{medicine.genericName}</Text>
        <Text style={styles.dosage}>
          {medicine.dosage} · {medicine.timing}
        </Text>
        <Text style={styles.source}>{getSourceLabel(medicine)}</Text>
        <Text style={[styles.refill, needsRefill && styles.refillDue]}>{refillLabel}</Text>
      </View>
      <View style={cardStyles.chevronWrap}>
        <Icon name="chevron-right" size={18} color={colors.neutral500} />
      </View>
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
  pressed: { backgroundColor: colors.brandMist },
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
  dosage: {
    fontSize: 12,
    color: colors.neutral500,
  },
  source: {
    fontSize: 12,
    color: colors.neutral600,
    marginTop: 2,
  },
  refill: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral500,
    marginTop: 2,
  },
  refillDue: {
    color: colors.brandPrimary,
  },
});

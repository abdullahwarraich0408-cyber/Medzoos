import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PatientMedicine } from '../../../medicines/data/medicineModel';
import { colors, spacing, radius } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type HealthActiveMedsStripProps = {
  medicines: PatientMedicine[];
  onSeeAll: () => void;
  onMedicinePress: (medicineId: string) => void;
};

export function HealthActiveMedsStrip({
  medicines,
  onSeeAll,
  onMedicinePress,
}: HealthActiveMedsStripProps) {
  if (medicines.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Active medicines</Text>
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {medicines.map(med => (
          <Pressable
            key={med.medicineId}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={() => onMedicinePress(med.medicineId)}>
            <View style={styles.iconWrap}>
              <Icon name="pill" size={16} color={colors.primary700} />
            </View>
            <View style={styles.body}>
              <Text style={styles.name} numberOfLines={1}>
                {med.medicineName}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {[med.strength, med.timing].filter(Boolean).join(' · ') ||
                  'Active'}
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...healthOsTypography.sectionTitle,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary700,
  },
  list: { gap: spacing.sm },
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
});

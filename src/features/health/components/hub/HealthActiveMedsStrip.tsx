import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PatientMedicine } from '../../../medicines/data/medicineModel';
import { spacing } from '../../../../theme';
import { calmLayout } from '../../../../theme/calmLayout';
import { healthBrand } from '../../healthBrand';

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
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Active medicines</Text>
        </View>
        <Pressable onPress={onSeeAll} hitSlop={8} style={styles.seeAllBtn}>
          <Text style={styles.seeAll}>See all</Text>
          <Icon name="chevron-right" size={16} color={healthBrand.accent} />
        </Pressable>
      </View>

      <View style={styles.list}>
        {medicines.map(med => (
          <Pressable
            key={med.medicineId}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={() => onMedicinePress(med.medicineId)}>
            <View style={styles.iconWrap}>
              <Icon name="pill" size={16} color={healthBrand.onAccent} />
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
            <Icon name="chevron-right" size={18} color={healthBrand.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: calmLayout.screenPadding,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  header: { flex: 1, gap: 4, minWidth: 0 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: healthBrand.ink,
    letterSpacing: -0.3,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingBottom: 2,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: healthBrand.accent,
  },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: healthBrand.card,
    borderRadius: 18,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: healthBrand.ink,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: { elevation: 1 },
    }),
  },
  pressed: { opacity: 0.92 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: healthBrand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2, minWidth: 0 },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: healthBrand.ink,
  },
  meta: {
    fontSize: 12,
    fontWeight: '500',
    color: healthBrand.muted,
  },
});

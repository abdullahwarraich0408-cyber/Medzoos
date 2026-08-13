import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PatientMedicine } from '../../../medicines/data/medicineModel';
import { colors, spacing, radius, shadows } from '../../../../theme';
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
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Active medicines</Text>
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>

      {medicines.length === 0 ? (
        <Pressable style={styles.emptyCard} onPress={onSeeAll}>
          <Icon name="pill" size={22} color={colors.primary700} />
          <View style={styles.emptyCopy}>
            <Text style={styles.emptyTitle}>No active medicines yet</Text>
            <Text style={styles.emptyHint}>
              Add prescriptions or shop medicines to track doses here.
            </Text>
          </View>
          <Icon name="chevron-right" size={18} color={colors.textMuted} />
        </Pressable>
      ) : (
        <View style={styles.list}>
          {medicines.map(med => (
            <Pressable
              key={med.medicineId}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              onPress={() => onMedicinePress(med.medicineId)}>
              <View style={styles.iconWrap}>
                <Icon name="pill" size={18} color={colors.primary700} />
              </View>
              <View style={styles.body}>
                <Text style={styles.name} numberOfLines={1}>
                  {med.medicineName}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {[med.strength, med.timing].filter(Boolean).join(' · ')}
                </Text>
              </View>
              {med.status === 'refill_due' ? (
                <View style={styles.refillPill}>
                  <Text style={styles.refillText}>Refill</Text>
                </View>
              ) : (
                <Icon name="chevron-right" size={18} color={colors.textMuted} />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.cardSoft,
  },
  pressed: { opacity: 0.92 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  refillPill: {
    backgroundColor: colors.primary100,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  refillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary800,
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  emptyCopy: { flex: 1, gap: 2 },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyHint: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
});

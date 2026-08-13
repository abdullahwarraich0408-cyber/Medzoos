import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type PrescriptionsSummaryCardProps = {
  activeMedicines: number;
  refillDue: number;
  prescriptionUploaded: boolean;
  remindersToday: number;
};

export function PrescriptionsSummaryCard({
  activeMedicines,
  refillDue,
  prescriptionUploaded,
  remindersToday,
}: PrescriptionsSummaryCardProps) {
  const stats = [
    { label: 'Active medicines', value: String(activeMedicines) },
    { label: 'Refill due', value: String(refillDue) },
    {
      label: 'Prescription uploaded',
      value: prescriptionUploaded ? 'Yes' : 'No',
    },
    { label: 'Reminder today', value: String(remindersToday) },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Health summary</Text>
      <View style={styles.grid}>
        {stats.map(stat => (
          <View key={stat.label} style={styles.stat}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.note}>
        <Icon name="information-outline" size={14} color={colors.brandPrimary} />
        <Text style={styles.noteText}>
          Focused on your prescriptions, refills, and medicine reminders
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.08)',
    ...shadows.cardElevated,
    marginBottom: spacing.lg,
  },
  title: {
    ...healthOsTypography.sectionTitle,
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stat: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.brandPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.neutral500,
    lineHeight: 14,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brandMist,
    padding: spacing.sm,
    borderRadius: radius.lg,
  },
  noteText: {
    flex: 1,
    fontSize: 11,
    color: colors.brandDark,
    lineHeight: 15,
  },
});

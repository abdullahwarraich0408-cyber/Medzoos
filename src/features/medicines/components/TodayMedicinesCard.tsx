import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { TodayReminder } from '../data/medicineModel';
import { colors, spacing, radius, cardStyles } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

type TodayMedicinesCardProps = {
  reminders: TodayReminder[];
  onMarkTaken: (medicineId: string) => void;
  onViewAll: () => void;
};

export function TodayMedicinesCard({
  reminders,
  onMarkTaken,
  onViewAll,
}: TodayMedicinesCardProps) {
  if (reminders.length === 0) return null;

  const dueCount = reminders.filter(r => !r.taken).length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.count}>
          {dueCount} medicine{dueCount === 1 ? '' : 's'} due
        </Text>
      </View>

      {reminders.map((reminder, index) => (
        <React.Fragment key={reminder.medicineId}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <View style={styles.row}>
            <View style={styles.body}>
              <Text style={styles.medicineName}>{reminder.medicineName}</Text>
              <Text style={styles.timing}>
                {reminder.timingLabel} · {reminder.time}
              </Text>
            </View>
            {reminder.taken ? (
              <View style={styles.takenBadge}>
                <Icon name="check" size={14} color={colors.brandPrimary} />
                <Text style={styles.takenText}>Taken</Text>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.markBtn, pressed && styles.markBtnPressed]}
                onPress={() => onMarkTaken(reminder.medicineId)}>
                <Text style={styles.markBtnText}>Mark taken</Text>
              </Pressable>
            )}
          </View>
        </React.Fragment>
      ))}

      <Pressable
        style={({ pressed }) => [styles.viewAll, pressed && styles.viewAllPressed]}
        onPress={onViewAll}>
        <Text style={styles.viewAllText}>View all reminders</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyles.grouped,
    paddingBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...healthOsTypography.sectionTitle,
    fontSize: 16,
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral200,
    marginLeft: spacing.lg,
  },
  body: { flex: 1, gap: 2 },
  medicineName: {
    ...healthOsTypography.messageTitle,
    fontSize: 15,
  },
  timing: {
    fontSize: 13,
    color: colors.neutral500,
  },
  markBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.brandLight,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.15)',
  },
  markBtnPressed: { backgroundColor: colors.brandMist },
  markBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brandPrimary,
  },
  takenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  takenText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  viewAll: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  viewAllPressed: { opacity: 0.7 },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
});

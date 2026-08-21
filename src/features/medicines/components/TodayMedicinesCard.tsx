import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { TodayReminder } from '../data/medicineModel';
import { colors, spacing, radius } from '../../../theme';

type TodayMedicinesCardProps = {
  reminders: TodayReminder[];
  onMarkTaken: (medicineId: string) => void;
  onViewAll: () => void;
};

export function TodayMedicinesCard({
  reminders,
  onMarkTaken,
}: TodayMedicinesCardProps) {
  const due = reminders.filter(r => !r.taken);
  if (due.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Due today</Text>
        <Text style={styles.count}>{due.length}</Text>
      </View>

      <View style={styles.list}>
        {due.slice(0, 3).map(reminder => (
          <View key={reminder.medicineId} style={styles.row}>
            <View style={styles.body}>
              <Text style={styles.name} numberOfLines={1}>
                {reminder.medicineName}
              </Text>
              <Text style={styles.timing}>
                {reminder.timingLabel} · {reminder.time}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.markBtn,
                pressed && styles.markBtnPressed,
              ]}
              onPress={() => onMarkTaken(reminder.medicineId)}>
              <Icon name="check" size={16} color={colors.primary700} />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  count: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary700,
    backgroundColor: colors.primary100,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
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
  body: { flex: 1, gap: 2, minWidth: 0 },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timing: {
    fontSize: 12,
    color: colors.textMuted,
  },
  markBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markBtnPressed: { backgroundColor: colors.primary200 },
});

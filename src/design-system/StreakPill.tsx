import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, radius, spacing } from '../theme';
import { healthOs } from '../theme/healthOs';

type StreakPillProps = {
  label: string;
  count: number;
  icon?: string;
};

export function StreakPill({ label, count, icon = 'fire' }: StreakPillProps) {
  return (
    <View style={styles.pill}>
      <Icon name={icon} size={14} color={healthOs.streakFire} />
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: healthOs.streakFireBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  count: {
    fontSize: 13,
    fontWeight: '700',
    color: healthOs.streakFire,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.neutral600,
  },
});

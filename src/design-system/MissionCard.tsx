import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../theme';
import { healthOsTypography } from '../theme/healthOs';
import type { DailyMission } from '../lib/gamification/types';

type MissionCardProps = {
  mission: DailyMission;
  onToggle?: (id: string) => void;
};

export function MissionCard({ mission, onToggle }: MissionCardProps) {
  return (
    <Pressable
      style={styles.row}
      onPress={() => onToggle?.(mission.id)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: mission.completed }}>
      <View style={[styles.check, mission.completed && styles.checkDone]}>
        {mission.completed && (
          <Icon name="check" size={14} color={colors.white} />
        )}
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, mission.completed && styles.titleDone]}>
          {mission.title}
        </Text>
        <Text style={styles.hint}>
          {mission.completed ? 'Done for today' : 'Tap when finished'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral200,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.neutral300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: colors.statusSuccess,
    borderColor: colors.statusSuccess,
  },
  body: { flex: 1, gap: 2 },
  title: healthOsTypography.messageTitle,
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.neutral500,
  },
  hint: healthOsTypography.messageCaption,
});

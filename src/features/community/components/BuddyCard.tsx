import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows } from '../../../theme';
import type { HealthBuddy } from '../../../lib/community/types';

type BuddyCardProps = {
  buddy: HealthBuddy;
  onEncourage: () => void;
};

export function BuddyCard({ buddy, onEncourage }: BuddyCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Icon name="account" size={22} color={colors.iconPrimary} />
        {buddy.isOnline ? <View style={styles.onlineDot} /> : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{buddy.name}</Text>
        <Text style={styles.sub}>
          {buddy.relation} · {buddy.streakDays}-day streak
        </Text>
        {buddy.lastEncouragement ? (
          <Text style={styles.encourage}>"{buddy.lastEncouragement}"</Text>
        ) : null}
      </View>
      <Pressable style={styles.btn} onPress={onEncourage}>
        <Icon name="hand-heart" size={16} color={colors.white} />
        <Text style={styles.btnText}>Cheer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.cardSoft,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  body: { flex: 1, gap: 2 },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  encourage: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginTop: 2,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary700,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
});

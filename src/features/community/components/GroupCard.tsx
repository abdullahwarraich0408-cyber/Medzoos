import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows } from '../../../theme';
import type { HealthGroup } from '../../../lib/community/types';

type GroupCardProps = {
  group: HealthGroup;
  onPress: () => void;
  onToggleJoin?: () => void;
};

export function GroupCard({ group, onPress, onToggleJoin }: GroupCardProps) {
  const discussions = group.postCount ?? 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.iconWrap}>
        <Icon name={group.icon} size={22} color={colors.iconPrimary} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{group.name}</Text>
        <Text style={styles.sub} numberOfLines={2}>
          {group.description}
        </Text>
        <Text style={styles.meta}>
          {group.memberCount} member{group.memberCount === 1 ? '' : 's'}
          {discussions > 0
            ? ` · ${discussions} discussion${discussions === 1 ? '' : 's'}`
            : ''}
        </Text>
      </View>
      <Pressable
        style={[styles.joinBtn, group.isJoined && styles.joinedBtn]}
        onPress={e => {
          e.stopPropagation?.();
          onToggleJoin?.();
        }}>
        <Text style={[styles.joinText, group.isJoined && styles.joinedText]}>
          {group.isJoined ? 'Joined' : 'Join'}
        </Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  pressed: { opacity: 0.97 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sub: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  meta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  joinBtn: {
    backgroundColor: colors.primary700,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  joinedBtn: {
    backgroundColor: colors.successBg,
  },
  joinText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  joinedText: {
    color: colors.successText,
  },
});

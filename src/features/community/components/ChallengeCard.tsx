import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows } from '../../../theme';
import type { HealthChallenge } from '../../../lib/community/types';

type ChallengeCardProps = {
  challenge: HealthChallenge;
  onPress: () => void;
  onJoin?: () => void;
  onUpdateProgress?: () => void;
};

export function ChallengeCard({
  challenge,
  onPress,
  onJoin,
  onUpdateProgress,
}: ChallengeCardProps) {
  const pct = Math.min((challenge.progress / challenge.target) * 100, 100);
  const showProgress = challenge.isJoined || challenge.progress > 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Icon name={challenge.icon} size={20} color={colors.iconPrimary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.goal}>Goal: {challenge.description}</Text>
          <Text style={styles.sub}>
            {challenge.daysLeft} day{challenge.daysLeft === 1 ? '' : 's'} left
          </Text>
        </View>
      </View>

      {showProgress ? (
        <>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${pct}%`, backgroundColor: colors.primary700 },
              ]}
            />
          </View>
          <Text style={styles.progress}>
            {challenge.progress.toLocaleString()} /{' '}
            {challenge.target.toLocaleString()} {challenge.unit}
          </Text>
        </>
      ) : null}

      <Text style={styles.reward}>
        Reward: {challenge.xpReward} XP
        {challenge.badgeName ? ` · ${challenge.badgeName}` : ''}
        {challenge.rewardClaimed
          ? ' · Claimed'
          : challenge.isJoined && challenge.progress >= challenge.target
            ? ' · Ready to claim'
            : ''}
      </Text>

      <Pressable
        style={[
          styles.actionBtn,
          challenge.rewardClaimed && styles.actionBtnDone,
        ]}
        onPress={e => {
          e.stopPropagation?.();
          if (challenge.isJoined) {
            if (onUpdateProgress) onUpdateProgress();
            else onPress();
          } else {
            onJoin?.();
          }
        }}>
        <Text
          style={[
            styles.actionText,
            challenge.rewardClaimed && styles.actionTextDone,
          ]}>
          {challenge.rewardClaimed
            ? 'Completed'
            : challenge.isJoined
              ? challenge.progress >= challenge.target
                ? 'Claim reward'
                : 'Update progress'
              : 'Join challenge'}
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
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  pressed: { opacity: 0.97 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  goal: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  sub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  track: {
    height: 6,
    backgroundColor: colors.primary100,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  fill: { height: '100%', borderRadius: radius.pill },
  progress: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  reward: {
    fontSize: 12,
    color: colors.primary700,
    fontWeight: '600',
  },
  actionBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary700,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  actionBtnDone: {
    backgroundColor: colors.successBg,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  actionTextDone: {
    color: colors.successText,
  },
});

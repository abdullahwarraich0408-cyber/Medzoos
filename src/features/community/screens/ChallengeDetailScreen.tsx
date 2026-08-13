import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { SimpleMessage, SimpleSection } from '../../../design-system';
import { useCommunityContext } from '../../../lib/community/CommunityContext';
import { suggestedProgressStep } from '../../../lib/community/membership';
import type { CommunityStackParamList } from '../../../navigation/types';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { showJoinResult } from '../utils/authGate';

type Route = RouteProp<CommunityStackParamList, 'ChallengeDetail'>;
type Nav = NativeStackNavigationProp<CommunityStackParamList, 'ChallengeDetail'>;

export function ChallengeDetailScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const {
    getChallenge,
    toggleChallenge,
    logChallengeStep,
    claimChallengeReward,
    profile,
  } = useCommunityContext();
  const challenge = getChallenge(params.challengeId);

  const step = useMemo(
    () =>
      challenge
        ? suggestedProgressStep(challenge.unit, challenge.target)
        : 1,
    [challenge],
  );

  if (!challenge) {
    return (
      <ScreenLayout title="Challenge" headerMode="stack" showSearch={false} showCart={false}>
        <SimpleMessage message="Challenge not found." tone="default" />
      </ScreenLayout>
    );
  }

  const pct = Math.min((challenge.progress / challenge.target) * 100, 100);
  const isComplete = challenge.progress >= challenge.target;
  const canClaim = challenge.isJoined && isComplete && !challenge.rewardClaimed;

  const handleLog = async () => {
    const result = await logChallengeStep(challenge.id);
    if (!result.ok) {
      Alert.alert('Progress', result.reason || 'Could not update progress.');
      return;
    }
    if (result.completed) {
      Alert.alert(
        'Goal reached!',
        'You hit the target. Tap Claim reward to collect XP and your badge.',
      );
    }
  };

  const handleClaim = async () => {
    const result = await claimChallengeReward(challenge.id);
    if (result.needAuth) {
      showJoinResult(result, navigation as never, 'Reward');
      return;
    }
    if (!result.ok) {
      Alert.alert('Reward', result.reason || 'Could not claim reward.');
      return;
    }
    Alert.alert(
      'Reward claimed!',
      result.reason ||
        `+${result.xp} XP · ${result.badge} badge · +${result.coins} coins`,
      [{ text: 'Great' }],
    );
  };

  return (
    <ScreenLayout
      title="Challenge"
      headerMode="stack"
      showSearch={false}
      showCart={false}
      onBackPress={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: colors.primary100 }]}>
          <Icon name={challenge.icon} size={36} color={colors.primary700} />
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.desc}>{challenge.description}</Text>
          {challenge.rewardClaimed ? (
            <View style={styles.donePill}>
              <Icon name="check-decagram" size={16} color={colors.success} />
              <Text style={styles.donePillText}>Completed · reward claimed</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Your XP</Text>
            <Text style={styles.statValue}>{profile.xp.toLocaleString()}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Coins</Text>
            <Text style={styles.statValue}>{profile.coins.toLocaleString()}</Text>
          </View>
        </View>

        {challenge.isJoined ? (
          <>
            <SimpleSection
              title="Your progress"
              hint={
                canClaim
                  ? 'Goal complete — claim your reward'
                  : challenge.rewardClaimed
                    ? 'Finished'
                    : 'Log progress until you reach the goal'
              }
            />
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${pct}%`,
                    backgroundColor: isComplete
                      ? colors.success
                      : colors.primary700,
                  },
                ]}
              />
            </View>
            <Text style={styles.progress}>
              {challenge.progress.toLocaleString()} /{' '}
              {challenge.target.toLocaleString()} {challenge.unit}
            </Text>
            <Text style={styles.daysLeft}>
              {challenge.rewardClaimed
                ? 'Challenge finished'
                : `${challenge.daysLeft} days remaining`}
            </Text>

            {!challenge.rewardClaimed ? (
              <Pressable style={styles.logBtn} onPress={handleLog}>
                <Text style={styles.logBtnText}>
                  Log +{step} {challenge.unit}
                </Text>
              </Pressable>
            ) : null}

            {canClaim ? (
              <Pressable style={styles.claimBtn} onPress={handleClaim}>
                <Icon name="gift" size={20} color={colors.white} />
                <Text style={styles.claimBtnText}>Claim reward</Text>
              </Pressable>
            ) : null}
          </>
        ) : (
          <SimpleMessage
            message={`Join ${challenge.participants.toLocaleString()} people. Log progress, then claim XP and a badge when you finish.`}
            tone="info"
          />
        )}

        <SimpleSection title="Rewards" hint="Unlocked when you complete the goal" />
        <View style={styles.rewardCard}>
          <View style={styles.rewardRow}>
            <Icon name="star-circle" size={22} color={colors.rating} />
            <Text style={styles.rewardText}>
              {challenge.xpReward} XP
            </Text>
          </View>
          <View style={styles.rewardRow}>
            <Icon name="medal" size={22} color={colors.primary700} />
            <Text style={styles.rewardText}>
              “{challenge.badgeName}” badge
            </Text>
          </View>
          <View style={styles.rewardRow}>
            <Icon name="circle-multiple" size={22} color={colors.warning} />
            <Text style={styles.rewardText}>
              ~{Math.max(10, Math.round(challenge.xpReward / 5))} coins
            </Text>
          </View>
          <Text style={styles.rewardHint}>
            {challenge.rewardClaimed
              ? 'Already added to your profile.'
              : 'Reach 100% progress, then tap Claim reward.'}
          </Text>
        </View>

        {challenge.leaderboard.length > 0 && (
          <>
            <SimpleSection title="Leaderboard" hint="Top participants" />
            {challenge.leaderboard.map(row => (
              <View key={row.id} style={styles.leaderRow}>
                <Text style={styles.rank}>#{row.rank}</Text>
                <Text style={styles.leaderName}>
                  {row.name}
                  {row.isFriend ? ' · Friend' : ''}
                </Text>
                <Text style={styles.leaderProgress}>
                  {row.progress.toLocaleString()}
                </Text>
              </View>
            ))}
          </>
        )}

        <Pressable
          style={[styles.btn, challenge.isJoined && styles.btnLeave]}
          onPress={async () => {
            if (challenge.rewardClaimed) {
              Alert.alert(
                'Completed',
                'You already finished this challenge and claimed the reward.',
              );
              return;
            }
            const result = await toggleChallenge(challenge.id);
            showJoinResult(result, navigation as never, 'Challenge');
          }}>
          <Text
            style={[styles.btnText, challenge.isJoined && styles.btnLeaveText]}>
            {challenge.isJoined ? 'Leave challenge' : 'Join challenge'}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: TAB_BAR_CLEARANCE + spacing.lg,
    gap: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    padding: spacing.xxl,
    borderRadius: radius.xxl,
    gap: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  donePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  donePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.successText,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 2,
  },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  track: {
    height: 10,
    backgroundColor: colors.primary100,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: { height: '100%' },
  progress: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  daysLeft: { fontSize: 13, color: colors.textMuted },
  logBtn: {
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary700,
    alignItems: 'center',
  },
  logBtnText: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.primary700,
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#0E304B',
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
  },
  claimBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  rewardCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rewardText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rewardHint: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rank: {
    width: 36,
    fontWeight: '700',
    color: colors.primary700,
  },
  leaderName: { flex: 1, fontSize: 14, color: colors.textPrimary },
  leaderProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  btn: {
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    backgroundColor: colors.primary700,
  },
  btnLeave: {
    backgroundColor: colors.successBg,
  },
  btnText: { fontSize: 16, fontWeight: '700', color: colors.white },
  btnLeaveText: { color: colors.successText },
});

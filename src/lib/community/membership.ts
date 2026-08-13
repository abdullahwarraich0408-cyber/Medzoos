import type {
  BuddySuggestion,
  GroupMember,
  HealthBuddy,
  HealthChallenge,
  HealthGroup,
} from './types';

export function withGroupMembership(
  groups: HealthGroup[],
  groupId: string,
  join: boolean,
): HealthGroup[] {
  return groups.map(group => {
    if (group.id !== groupId) return group;
    if (group.isJoined === join) return group;
    return {
      ...group,
      isJoined: join,
      memberCount: Math.max(0, group.memberCount + (join ? 1 : -1)),
    };
  });
}

export function withChallengeMembership(
  challenges: HealthChallenge[],
  challengeId: string,
  join: boolean,
): HealthChallenge[] {
  return challenges.map(challenge => {
    if (challenge.id !== challengeId) return challenge;
    if (challenge.isJoined === join) return challenge;
    return {
      ...challenge,
      isJoined: join,
      participants: Math.max(0, challenge.participants + (join ? 1 : -1)),
      progress: join ? challenge.progress : 0,
      leaderboard: join
        ? challenge.leaderboard.length > 0
          ? challenge.leaderboard
          : [
              {
                id: 'you',
                name: 'You',
                progress: 0,
                rank: challenge.participants + 1,
                isFriend: true,
              },
            ]
        : challenge.leaderboard.filter(row => row.id !== 'you' && row.name !== 'You'),
    };
  });
}

export function withChallengeProgress(
  challenges: HealthChallenge[],
  challengeId: string,
  progress: number,
): HealthChallenge[] {
  return challenges.map(challenge => {
    if (challenge.id !== challengeId) return challenge;
    const next = Math.min(Math.max(0, progress), challenge.target);
    return {
      ...challenge,
      progress: next,
      leaderboard: challenge.leaderboard.map(row =>
        row.name === 'You' || row.id === 'you' || row.id === 'u1'
          ? { ...row, progress: next }
          : row,
      ),
    };
  });
}

export function withChallengeRewardClaimed(
  challenges: HealthChallenge[],
  challengeId: string,
): HealthChallenge[] {
  return challenges.map(challenge => {
    if (challenge.id !== challengeId) return challenge;
    return {
      ...challenge,
      rewardClaimed: true,
      completedAt: new Date().toISOString(),
      progress: Math.max(challenge.progress, challenge.target),
    };
  });
}

export function suggestedProgressStep(unit: string, target: number): number {
  const u = unit.toLowerCase();
  if (u.includes('step')) return Math.min(1000, target);
  if (u.includes('glass')) return 1;
  if (u.includes('dose')) return 1;
  if (u.includes('minute')) return 5;
  if (u.includes('day')) return 1;
  return Math.max(1, Math.round(target / 10));
}

export function withBuddyAdded(
  buddies: HealthBuddy[],
  suggestion: BuddySuggestion,
  relation: HealthBuddy['relation'],
): HealthBuddy[] {
  if (buddies.some(b => b.id === suggestion.id || b.name === suggestion.name)) {
    return buddies;
  }
  return [
    {
      id: suggestion.id,
      userId: suggestion.id,
      name: suggestion.name,
      relation,
      streakDays: 1,
      isOnline: true,
      lastEncouragement: undefined,
    },
    ...buddies,
  ];
}

export function withoutBuddy(buddies: HealthBuddy[], buddyId: string): HealthBuddy[] {
  return buddies.filter(b => b.id !== buddyId);
}

export function withoutSuggestion(
  suggestions: BuddySuggestion[],
  suggestionId: string,
): BuddySuggestion[] {
  return suggestions.filter(s => s.id !== suggestionId);
}

export function mockMembersForGroup(group: HealthGroup): GroupMember[] {
  const base: GroupMember[] = [
    { id: 'you', name: 'You', role: group.isJoined ? 'member' : 'visitor' },
    ...group.moderators.map((name, i) => ({
      id: `mod-${group.id}-${i}`,
      name,
      role: 'moderator',
    })),
    ...group.verifiedDoctors.map((name, i) => ({
      id: `doc-${group.id}-${i}`,
      name,
      role: 'doctor',
    })),
  ];

  if (!group.isJoined) {
    return base.filter(m => m.role !== 'member');
  }

  return [
    ...base,
    { id: `${group.id}-m1`, name: 'Hira S.', role: 'member' },
    { id: `${group.id}-m2`, name: 'Ali R.', role: 'member' },
    { id: `${group.id}-m3`, name: 'Sana M.', role: 'member' },
  ];
}

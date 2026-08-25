import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { communityApi } from '../api';
import { useAuth } from '../auth/AuthContext';
import { moderatePostContent } from './moderation';
import {
  suggestedProgressStep,
  withBuddyAdded,
  withChallengeMembership,
  withChallengeProgress,
  withChallengeRewardClaimed,
  withGroupMembership,
  withoutBuddy,
  withoutSuggestion,
} from './membership';
import type {
  BuddySuggestion,
  CommunityPost,
  CommunityProfile,
  FeedFilter,
  HealthBuddy,
  HealthChallenge,
  HealthGroup,
  GroupMember,
  WeeklyReport,
} from './types';

const EMPTY_COMMUNITY_PROFILE: CommunityProfile = {
  displayName: 'You',
  healthLevel: 1,
  healthScore: 0,
  xp: 0,
  coins: 0,
  followers: 0,
  following: 0,
  postsCount: 0,
  contributionScore: 0,
  badges: [],
};

const EMPTY_WEEKLY_REPORT: WeeklyReport = {
  weekLabel: '',
  healthScoreChange: 0,
  medicineAdherence: 0,
  stepsTotal: 0,
  waterGlasses: 0,
  sleepAverage: '—',
  streakSummary: '',
  topAchievement: '',
  aiRecommendation: '',
};

export function useCommunity() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all');

  /** Local working copies so join/buddy flows work even when API is down. */
  const [groupsState, setGroupsState] = useState<HealthGroup[] | null>(null);
  const [challengesState, setChallengesState] = useState<HealthChallenge[] | null>(
    null,
  );
  const [buddiesState, setBuddiesState] = useState<HealthBuddy[] | null>(null);
  const [suggestionsState, setSuggestionsState] = useState<BuddySuggestion[] | null>(
    null,
  );
  const [profileState, setProfileState] = useState<CommunityProfile | null>(null);

  const postsQuery = useQuery({
    queryKey: ['community', 'posts', feedFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (feedFilter === 'verified') params.filter = 'verified';
      if (feedFilter === 'videos') params.filter = 'videos';
      const data = await communityApi.getPosts(params);
      return data.posts || [];
    },
    staleTime: 30_000,
  });

  const groupsQuery = useQuery({
    queryKey: ['community', 'groups'],
    queryFn: async () => {
      const data = await communityApi.getGroups();
      return data.groups || [];
    },
    staleTime: 60_000,
  });

  const challengesQuery = useQuery({
    queryKey: ['community', 'challenges'],
    queryFn: async () => {
      const data = await communityApi.getChallenges();
      return data.challenges || [];
    },
    staleTime: 60_000,
  });

  const buddiesQuery = useQuery({
    queryKey: ['community', 'buddies'],
    queryFn: async () => {
      const data = await communityApi.getBuddies();
      return data.buddies || [];
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const suggestionsQuery = useQuery({
    queryKey: ['community', 'buddy-suggestions'],
    queryFn: async () => {
      const data = await communityApi.getBuddySuggestions();
      return data.suggestions || [];
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const profileQuery = useQuery({
    queryKey: ['community', 'profile'],
    queryFn: async () => {
      const data = await communityApi.getProfile();
      return data.profile;
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const weeklyReportQuery = useQuery({
    queryKey: ['community', 'weekly-report'],
    queryFn: async () => {
      const data = await communityApi.getWeeklyReport();
      return data.report;
    },
    enabled: isAuthenticated,
    staleTime: 120_000,
  });

  const apiGroupsLive = (groupsQuery.data?.length ?? 0) > 0 && !groupsQuery.isError;
  const apiChallengesLive =
    (challengesQuery.data?.length ?? 0) > 0 && !challengesQuery.isError;
  const usingMockCommunity = false;

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['community'] });
  }, [queryClient]);

  const seedGroups = useMemo(
    () => groupsQuery.data ?? [],
    [groupsQuery.data],
  );
  const seedChallenges = useMemo(
    () => challengesQuery.data ?? [],
    [challengesQuery.data],
  );
  const seedBuddies = useMemo(() => {
    if (!isAuthenticated) return [];
    return buddiesQuery.data ?? [];
  }, [isAuthenticated, buddiesQuery.data]);
  const seedSuggestions = useMemo(() => {
    if (!isAuthenticated) return [];
    return suggestionsQuery.data ?? [];
  }, [isAuthenticated, suggestionsQuery.data]);

  const posts = useMemo(() => {
    return postsQuery.data ?? [];
  }, [postsQuery.data]);

  const groups = groupsState ?? seedGroups;
  const challenges = challengesState ?? seedChallenges;
  const buddies = buddiesState ?? seedBuddies;
  const suggestedBuddies = useMemo(() => {
    const list = suggestionsState ?? seedSuggestions;
    const buddyKeys = new Set(
      buddies.map(b => b.name.toLowerCase()).concat(buddies.map(b => b.id)),
    );
    return list.filter(
      s => !buddyKeys.has(s.name.toLowerCase()) && !buddyKeys.has(s.id),
    );
  }, [suggestionsState, seedSuggestions, buddies]);

  const profile = profileState ?? profileQuery.data ?? EMPTY_COMMUNITY_PROFILE;
  const weeklyReport = weeklyReportQuery.data ?? EMPTY_WEEKLY_REPORT;

  const filteredPosts = useMemo(() => {
    switch (feedFilter) {
      case 'verified':
        return posts.filter(p => p.isVerified);
      case 'tips':
        return posts.filter(
          p =>
            p.isVerified ||
            ['Nutrition', 'Diabetes', 'Health Tips', 'Preventive Care'].includes(
              p.category,
            ),
        );
      case 'stories':
        return posts.filter(
          p => p.category === 'Success Story' || p.category === 'Recovery',
        );
      case 'videos':
        return posts.filter(p => p.postType === 'video');
      case 'photos':
        return posts.filter(p => p.postType === 'photo');
      case 'friends':
        return posts.filter(p => {
          if (p.isAnonymous) return false;
          const buddyNames = buddies.map(b => b.name.split(' ')[0].toLowerCase());
          const authorFirst = p.authorName.split(' ')[0].toLowerCase();
          return buddyNames.some(
            n => authorFirst.startsWith(n) || n.startsWith(authorFirst),
          );
        });
      default:
        return posts;
    }
  }, [posts, feedFilter, buddies]);

  const ensureGroups = useCallback(() => {
    if (!groupsState) setGroupsState(seedGroups);
    return groupsState ?? seedGroups;
  }, [groupsState, seedGroups]);

  const ensureChallenges = useCallback(() => {
    if (!challengesState) setChallengesState(seedChallenges);
    return challengesState ?? seedChallenges;
  }, [challengesState, seedChallenges]);

  const likePost = useCallback(
    async (postId: string) => {
      if (!isAuthenticated) return false;
      try {
        await communityApi.toggleLike(postId);
        await queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
        return true;
      } catch {
        return false;
      }
    },
    [isAuthenticated, queryClient],
  );

  const addComment = useCallback(
    async (postId: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return false;
      const moderation = moderatePostContent(trimmed);
      if (!moderation.approved) return false;
      if (!isAuthenticated) return false;
      try {
        await communityApi.addComment(postId, trimmed);
        await queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
        await queryClient.invalidateQueries({
          queryKey: ['community', 'post', postId],
        });
        return true;
      } catch {
        return false;
      }
    },
    [isAuthenticated, queryClient],
  );

  const createPost = useCallback(
    async (input: {
      content: string;
      category: string;
      isAnonymous: boolean;
      groupId?: string;
      postType?: 'text' | 'video' | 'photo';
      imageUrl?: string;
      videoUrl?: string;
      thumbnailUrl?: string;
    }): Promise<{ ok: boolean; reason?: string }> => {
      const hasPhoto = Boolean(input.imageUrl);
      const hasVideo = Boolean(input.videoUrl);
      const postType = hasVideo
        ? 'video'
        : hasPhoto
          ? 'photo'
          : input.postType || 'text';
      const textToModerate =
        input.content.trim() || input.imageUrl || input.videoUrl || 'health post';
      const moderation = moderatePostContent(textToModerate);
      if (!moderation.approved) {
        return { ok: false, reason: moderation.reason };
      }
      if (!isAuthenticated) {
        return { ok: false, reason: 'Please sign in to post.' };
      }
      if (hasPhoto && hasVideo) {
        return { ok: false, reason: 'Add either a photo or a video, not both.' };
      }
      if (postType === 'video' && !input.videoUrl) {
        return { ok: false, reason: 'Add a video link or upload a file.' };
      }
      if (postType === 'photo' && !input.imageUrl) {
        return { ok: false, reason: 'Add a photo to publish.' };
      }
      if (postType === 'text' && input.content.trim().length < 10) {
        return {
          ok: false,
          reason: 'Write at least 10 characters or add a photo/video.',
        };
      }

      try {
        await communityApi.createPost({
          content: input.content.trim(),
          category: input.category,
          is_anonymous: input.isAnonymous,
          group_id: input.groupId,
          post_type: postType,
          image_url: input.imageUrl,
          video_url: input.videoUrl,
          thumbnail_url: input.thumbnailUrl,
        });
        await queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
        if (input.groupId) {
          await queryClient.invalidateQueries({
            queryKey: ['community', 'group-posts', input.groupId],
          });
        }
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          reason: err instanceof Error ? err.message : 'Could not publish post.',
        };
      }
    },
    [isAuthenticated, queryClient],
  );

  /**
   * Who can join: any signed-in patient/user.
   * How: Groups tab → Join, or Group detail → Join group.
   * After join: discussions + members unlock; can leave later.
   */
  const toggleGroup = useCallback(
    async (
      groupId: string,
    ): Promise<{ ok: boolean; reason?: string; joined?: boolean; needAuth?: boolean }> => {
      if (!isAuthenticated) {
        return {
          ok: false,
          needAuth: true,
          reason: 'Sign in to join support groups.',
        };
      }

      const current = ensureGroups();
      const group = current.find(g => g.id === groupId);
      if (!group) {
        return { ok: false, reason: 'Group not found. Pull down to refresh.' };
      }

      const nextJoined = !group.isJoined;
      setGroupsState(withGroupMembership(current, groupId, nextJoined));

      if (apiGroupsLive) {
        try {
          if (nextJoined) await communityApi.joinGroup(groupId);
          else await communityApi.leaveGroup(groupId);
          await queryClient.invalidateQueries({ queryKey: ['community', 'groups'] });
        } catch {
          // Keep local membership so the flow still works offline / demo.
        }
      }

      return {
        ok: true,
        joined: nextJoined,
        reason: nextJoined
          ? 'You joined this group. You can now read and post discussions.'
          : 'You left this group.',
      };
    },
    [isAuthenticated, ensureGroups, apiGroupsLive, queryClient],
  );

  const createGroup = useCallback(
    async (input: {
      name: string;
      description: string;
      icon?: string;
      weeklyTopic?: string;
    }) => {
      if (!isAuthenticated) {
        return { ok: false, needAuth: true, reason: 'Sign in to create a group.' };
      }
      try {
        await communityApi.createGroup({
          name: input.name,
          description: input.description,
          icon: input.icon,
          weekly_topic: input.weeklyTopic,
        });
        invalidateAll();
        return { ok: true };
      } catch {
        const local: HealthGroup = {
          id: `local-g-${Date.now()}`,
          name: input.name.trim(),
          description: input.description.trim(),
          icon: input.icon || 'account-group',
          memberCount: 1,
          postCount: 0,
          isJoined: true,
          moderators: ['You'],
          verifiedDoctors: [],
          weeklyTopic: input.weeklyTopic,
        };
        setGroupsState([local, ...(groupsState ?? seedGroups)]);
        return { ok: true, reason: 'Group created on this device.' };
      }
    },
    [isAuthenticated, invalidateAll, groupsState, seedGroups],
  );

  /**
   * Who can join: any signed-in user.
   * How: Challenges tab → Join challenge, or Challenge detail → Join.
   * After join: log progress, see leaderboard; can leave later.
   */
  const toggleChallenge = useCallback(
    async (
      challengeId: string,
    ): Promise<{ ok: boolean; reason?: string; joined?: boolean; needAuth?: boolean }> => {
      if (!isAuthenticated) {
        return {
          ok: false,
          needAuth: true,
          reason: 'Sign in to join health challenges.',
        };
      }

      const current = ensureChallenges();
      const challenge = current.find(c => c.id === challengeId);
      if (!challenge) {
        return { ok: false, reason: 'Challenge not found. Pull down to refresh.' };
      }

      const nextJoined = !challenge.isJoined;
      setChallengesState(withChallengeMembership(current, challengeId, nextJoined));

      if (apiChallengesLive) {
        try {
          if (nextJoined) await communityApi.joinChallenge(challengeId);
          else await communityApi.leaveChallenge(challengeId);
          await queryClient.invalidateQueries({
            queryKey: ['community', 'challenges'],
          });
        } catch {
          // Keep local join state.
        }
      }

      return {
        ok: true,
        joined: nextJoined,
        reason: nextJoined
          ? 'Challenge joined. Log progress to climb the leaderboard.'
          : 'You left this challenge.',
      };
    },
    [isAuthenticated, ensureChallenges, apiChallengesLive, queryClient],
  );

  const createChallenge = useCallback(
    async (input: {
      title: string;
      description: string;
      target: number;
      unit: string;
      durationDays: number;
      icon?: string;
      color?: string;
    }) => {
      if (!isAuthenticated) {
        return { ok: false, needAuth: true, reason: 'Sign in to create a challenge.' };
      }
      try {
        await communityApi.createChallenge({
          title: input.title,
          description: input.description,
          target: input.target,
          unit: input.unit,
          duration_days: input.durationDays,
          icon: input.icon,
          color: input.color,
        });
        invalidateAll();
        return { ok: true };
      } catch {
        const local: HealthChallenge = {
          id: `local-ch-${Date.now()}`,
          title: input.title.trim(),
          description: input.description.trim(),
          icon: input.icon || 'trophy',
          color: input.color || '#17618E',
          progress: 0,
          target: input.target,
          unit: input.unit,
          daysLeft: input.durationDays,
          isJoined: true,
          participants: 1,
          xpReward: 100,
          badgeName: 'Starter',
          leaderboard: [
            { id: 'you', name: 'You', progress: 0, rank: 1, isFriend: true },
          ],
        };
        setChallengesState([local, ...(challengesState ?? seedChallenges)]);
        return { ok: true };
      }
    },
    [isAuthenticated, invalidateAll, challengesState, seedChallenges],
  );

  const updateChallengeProgress = useCallback(
    async (
      challengeId: string,
      progress: number,
    ): Promise<{ ok: boolean; completed?: boolean; reason?: string }> => {
      if (!isAuthenticated) {
        return { ok: false, reason: 'Sign in to log progress.' };
      }
      const current = ensureChallenges();
      const challenge = current.find(c => c.id === challengeId);
      if (!challenge?.isJoined) {
        return { ok: false, reason: 'Join this challenge first.' };
      }
      if (challenge.rewardClaimed) {
        return { ok: false, reason: 'Reward already claimed for this challenge.' };
      }

      const next = Math.min(Math.max(0, progress), challenge.target);
      setChallengesState(withChallengeProgress(current, challengeId, next));

      if (apiChallengesLive) {
        try {
          await communityApi.updateChallengeProgress(challengeId, next);
          await queryClient.invalidateQueries({
            queryKey: ['community', 'challenges'],
          });
        } catch {
          // Keep local progress.
        }
      }

      return {
        ok: true,
        completed: next >= challenge.target,
        reason:
          next >= challenge.target
            ? 'Goal reached! Claim your reward below.'
            : 'Progress saved.',
      };
    },
    [isAuthenticated, ensureChallenges, apiChallengesLive, queryClient],
  );

  /**
   * Claim XP + badge after progress reaches the target.
   * Who: signed-in user who joined and completed the challenge.
   * How: Challenge detail → Claim reward (only when progress >= target).
   */
  const claimChallengeReward = useCallback(
    async (
      challengeId: string,
    ): Promise<{
      ok: boolean;
      reason?: string;
      needAuth?: boolean;
      xp?: number;
      badge?: string;
      coins?: number;
    }> => {
      if (!isAuthenticated) {
        return {
          ok: false,
          needAuth: true,
          reason: 'Sign in to claim challenge rewards.',
        };
      }

      const current = ensureChallenges();
      const challenge = current.find(c => c.id === challengeId);
      if (!challenge) {
        return { ok: false, reason: 'Challenge not found.' };
      }
      if (!challenge.isJoined) {
        return { ok: false, reason: 'Join and complete the challenge first.' };
      }
      if (challenge.progress < challenge.target) {
        return {
          ok: false,
          reason: `Reach ${challenge.target.toLocaleString()} ${challenge.unit} before claiming.`,
        };
      }
      if (challenge.rewardClaimed) {
        return { ok: false, reason: 'You already claimed this reward.' };
      }

      const coinsEarned = Math.max(10, Math.round(challenge.xpReward / 5));
      setChallengesState(withChallengeRewardClaimed(current, challengeId));
      setProfileState(prev => {
        const base = prev ?? profileQuery.data ?? EMPTY_COMMUNITY_PROFILE;
        const badges = new Set(base.badges || []);
        if (challenge.badgeName) badges.add(challenge.badgeName);
        return {
          ...base,
          xp: base.xp + challenge.xpReward,
          coins: base.coins + coinsEarned,
          contributionScore: base.contributionScore + challenge.xpReward,
          badges: Array.from(badges),
          healthLevel: base.healthLevel + (challenge.xpReward >= 200 ? 1 : 0),
        };
      });

      return {
        ok: true,
        xp: challenge.xpReward,
        badge: challenge.badgeName,
        coins: coinsEarned,
        reason: `You earned ${challenge.xpReward} XP, ${coinsEarned} coins, and the "${challenge.badgeName}" badge.`,
      };
    },
    [isAuthenticated, ensureChallenges, profileQuery.data],
  );

  const logChallengeStep = useCallback(
    async (challengeId: string) => {
      const current = ensureChallenges();
      const challenge = current.find(c => c.id === challengeId);
      if (!challenge) return { ok: false, reason: 'Challenge not found.' };
      const step = suggestedProgressStep(challenge.unit, challenge.target);
      return updateChallengeProgress(challengeId, challenge.progress + step);
    },
    [ensureChallenges, updateChallengeProgress],
  );

  const getPost = useCallback(
    (postId: string) => {
      const cached = queryClient.getQueryData<CommunityPost>([
        'community',
        'post',
        postId,
      ]);
      if (cached) return cached;
      return posts.find(p => p.id === postId);
    },
    [posts, queryClient],
  );

  const fetchPost = useCallback(
    async (postId: string) => {
      try {
        const data = await communityApi.getPost(postId);
        if (data.post) {
          queryClient.setQueryData(['community', 'post', postId], data.post);
        }
        return data.post ?? getPost(postId) ?? null;
      } catch {
        return getPost(postId) ?? null;
      }
    },
    [queryClient, getPost],
  );

  const fetchGroupPosts = useCallback(
    async (groupId: string) => {
      const group = (groupsState ?? seedGroups).find(g => g.id === groupId);
      const requiresJoin = !(group?.isJoined);

      try {
        const data = await communityApi.getPosts({ group_id: groupId });
        const groupPosts = data.posts || [];
        queryClient.setQueryData(['community', 'group-posts', groupId], groupPosts);
        return {
          posts: groupPosts,
          requiresJoin: Boolean(data.requiresJoin ?? requiresJoin),
        };
      } catch {
        return {
          posts: [] as CommunityPost[],
          requiresJoin,
        };
      }
    },
    [groupsState, seedGroups, queryClient],
  );

  const getGroupPosts = useCallback(
    (groupId: string) =>
      queryClient.getQueryData<CommunityPost[]>([
        'community',
        'group-posts',
        groupId,
      ]) ?? [],
    [queryClient],
  );

  const getGroup = useCallback(
    (groupId: string) => groups.find(g => g.id === groupId),
    [groups],
  );

  const getChallenge = useCallback(
    (challengeId: string) => challenges.find(c => c.id === challengeId),
    [challenges],
  );

  const fetchGroupMembers = useCallback(
    async (groupId: string) => {
      const group = (groupsState ?? seedGroups).find(g => g.id === groupId);
      if (!group) return { members: [] as GroupMember[], canManage: false };

      if (isAuthenticated) {
        try {
          const data = await communityApi.getGroupMembers(groupId);
          return {
            members: (data.members || []).map(m => ({
              id: m.id,
              name: m.name,
              role: m.role,
            })),
            canManage: Boolean(data.canManage),
          };
        } catch {
          return { members: [] as GroupMember[], canManage: false };
        }
      }

      return {
        members: [] as GroupMember[],
        canManage: false,
      };
    },
    [isAuthenticated, groupsState, seedGroups],
  );

  const addGroupMember = useCallback(
    async (groupId: string, userId: string) => {
      if (!isAuthenticated) return false;
      try {
        await communityApi.addGroupMember(groupId, userId);
        return true;
      } catch {
        return false;
      }
    },
    [isAuthenticated],
  );

  const searchUsers = useCallback(
    async (query: string) => {
      if (!isAuthenticated || query.trim().length < 2) return [];
      try {
        const data = await communityApi.searchUsers(query.trim());
        return data.users || [];
      } catch {
        return [];
      }
    },
    [isAuthenticated],
  );

  const sendEncouragement = useCallback(
    async (buddyId: string) => {
      if (!isAuthenticated) return false;
      const note = 'You got this!';
      setBuddiesState(prev =>
        (prev ?? seedBuddies).map(b =>
          b.id === buddyId ? { ...b, lastEncouragement: note } : b,
        ),
      );
      try {
        await communityApi.encourageBuddy(buddyId);
      } catch {
        // local update already applied
      }
      return true;
    },
    [isAuthenticated, seedBuddies],
  );

  /**
   * Who can add: signed-in user.
   * Who can be added: people from shared groups/challenges (suggestions),
   * or search results.
   * How: Buddies → Add health buddy → pick relation → Add.
   */
  const addBuddy = useCallback(
    async (
      suggestion: BuddySuggestion,
      relation: HealthBuddy['relation'],
    ): Promise<{ ok: boolean; reason?: string; needAuth?: boolean }> => {
      if (!isAuthenticated) {
        return {
          ok: false,
          needAuth: true,
          reason: 'Sign in to add health buddies.',
        };
      }

      const currentBuddies = buddiesState ?? seedBuddies;
      if (
        currentBuddies.some(
          b => b.id === suggestion.id || b.name === suggestion.name,
        )
      ) {
        return { ok: false, reason: 'This person is already your buddy.' };
      }

      setBuddiesState(withBuddyAdded(currentBuddies, suggestion, relation));
      setSuggestionsState(
        withoutSuggestion(suggestionsState ?? seedSuggestions, suggestion.id),
      );

      try {
        await communityApi.addBuddy(suggestion.id, relation);
        await queryClient.invalidateQueries({ queryKey: ['community', 'buddies'] });
        await queryClient.invalidateQueries({
          queryKey: ['community', 'buddy-suggestions'],
        });
      } catch {
        // Local buddy list already updated for demo / offline.
      }

      return { ok: true, reason: `${suggestion.name} is now your health buddy.` };
    },
    [
      isAuthenticated,
      buddiesState,
      seedBuddies,
      suggestionsState,
      seedSuggestions,
      queryClient,
    ],
  );

  const removeBuddy = useCallback(
    async (buddyId: string) => {
      if (!isAuthenticated) return false;
      setBuddiesState(withoutBuddy(buddiesState ?? seedBuddies, buddyId));
      try {
        await communityApi.removeBuddy(buddyId);
      } catch {
        // local already updated
      }
      return true;
    },
    [isAuthenticated, buddiesState, seedBuddies],
  );

  const refetchAll = useCallback(async () => {
    await Promise.all([
      postsQuery.refetch(),
      groupsQuery.refetch(),
      challengesQuery.refetch(),
      buddiesQuery.refetch(),
      profileQuery.refetch(),
    ]);
  }, [postsQuery, groupsQuery, challengesQuery, buddiesQuery, profileQuery]);

  const communityApiError =
    postsQuery.isError && groupsQuery.isError && challengesQuery.isError
      ? 'Could not load community data. Pull to refresh.'
      : null;

  return {
    posts: filteredPosts,
    allPosts: posts,
    groups,
    challenges,
    buddies,
    profile,
    weeklyReport,
    feedFilter,
    setFeedFilter,
    likePost,
    addComment,
    createPost,
    toggleGroup,
    createGroup,
    toggleChallenge,
    createChallenge,
    updateChallengeProgress,
    claimChallengeReward,
    logChallengeStep,
    getPost,
    fetchPost,
    fetchGroupPosts,
    getGroupPosts,
    getGroup,
    getChallenge,
    fetchGroupMembers,
    addGroupMember,
    searchUsers,
    sendEncouragement,
    suggestedBuddies,
    addBuddy,
    removeBuddy,
    isAuthenticated,
    communityApiError,
    usingMockCommunity,
    isLoading:
      postsQuery.isLoading ||
      groupsQuery.isLoading ||
      challengesQuery.isLoading,
    isRefreshing:
      postsQuery.isFetching ||
      groupsQuery.isFetching ||
      challengesQuery.isFetching,
    refetchAll,
    usingLiveData: apiGroupsLive || apiChallengesLive,
  };
}

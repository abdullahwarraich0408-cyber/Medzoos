import React, { useMemo, useState, useCallback } from 'react';
import {
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  View,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../components/layout/ScreenLayout';
import { useCommunityContext } from '../../lib/community/CommunityContext';
import { FEED_FILTERS } from '../../lib/community/mockData';
import { communityCopy } from '../../lib/copy/uiMessages';
import { navigateToMainTabs } from '../../lib/auth/navigation';
import type { CommunityStackParamList } from '../../navigation/types';
import { spacing, TAB_BAR_CLEARANCE } from '../../theme';
import { calmLayout } from '../../theme/calmLayout';
import { communityBrand } from './communityBrand';
import { CommunityHeader } from './components/CommunityHeader';
import { CommunitySegmentTabs } from './components/CommunitySegmentTabs';
import { CommunityActionButton } from './components/CommunityActionButton';
import { CommunityEmptyState } from './components/CommunityEmptyState';
import { CommunityMyActivity } from './components/CommunityMyActivity';
import { PostCard } from './components/PostCard';
import { ChallengeCard } from './components/ChallengeCard';
import { GroupCard } from './components/GroupCard';
import { requireCommunityAuth, showJoinResult } from './utils/authGate';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'CommunityHome'>;

const SEGMENTS = [
  { id: 'feed', label: 'Feed', icon: 'newspaper-variant-outline' },
  { id: 'groups', label: 'Groups', icon: 'account-group-outline' },
  { id: 'challenges', label: 'Challenges', icon: 'trophy-outline' },
  { id: 'activity', label: 'My activity', icon: 'account-heart-outline' },
];

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
    </View>
  );
}

export function CommunityHomeScreen() {
  const navigation = useNavigation<Nav>();
  const [segment, setSegment] = useState('feed');
  const {
    posts,
    groups,
    challenges,
    buddies,
    profile,
    feedFilter,
    setFeedFilter,
    likePost,
    toggleGroup,
    toggleChallenge,
    refetchAll,
    isAuthenticated,
    communityApiError,
  } = useCommunityContext();

  const [refreshing, setRefreshing] = useState(false);

  const requireAuth = (action: () => void, message: string) => {
    requireCommunityAuth(isAuthenticated, navigation as never, message, action);
  };

  const joinedGroups = groups.filter(g => g.isJoined);
  const discoverGroups = groups.filter(g => !g.isJoined);
  const joinedChallenges = challenges.filter(c => c.isJoined);
  const discoverChallenges = challenges.filter(c => !c.isJoined);

  const segmentHint = useMemo(() => {
    if (segment === 'feed') return communityCopy.feedHint;
    if (segment === 'groups') return communityCopy.groupsHint;
    if (segment === 'challenges') return communityCopy.challengesHint;
    return communityCopy.activityHint;
  }, [segment]);

  const handleToggleGroup = async (groupId: string) => {
    const result = await toggleGroup(groupId);
    showJoinResult(result, navigation as never, 'Group');
  };

  const handleToggleChallenge = async (challengeId: string) => {
    const result = await toggleChallenge(challengeId);
    showJoinResult(result, navigation as never, 'Challenge');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchAll();
    } finally {
      setRefreshing(false);
    }
  };

  const tabAction =
    segment === 'feed'
      ? {
          label: 'Share an update',
          onPress: () =>
            requireAuth(
              () => navigation.navigate('CreatePost'),
              'Sign in to share a health update.',
            ),
        }
      : segment === 'groups'
        ? {
            label: 'Create a group',
            onPress: () =>
              requireAuth(
                () => navigation.navigate('CreateGroup'),
                'Sign in to create a support group.',
              ),
          }
        : segment === 'challenges'
          ? {
              label: 'Create a challenge',
              onPress: () =>
                requireAuth(
                  () => navigation.navigate('CreateChallenge'),
                  'Sign in to create a health challenge.',
                ),
            }
          : null;

  return (
    <ScreenLayout
      hideHeader
      backgroundColor={communityBrand.page}
      embedSafeAreaInChildren>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={communityBrand.accent}
            colors={[communityBrand.accent]}
          />
        }>
        <CommunityHeader
          title="Community"
          subtitle={communityCopy.pageHint}
          onBackPress={() =>
            navigateToMainTabs(navigation, 'Home', 'Dashboard')
          }
        />

        <View style={styles.body}>
          <CommunitySegmentTabs
            segments={SEGMENTS}
            active={segment}
            onChange={setSegment}
          />

          <View style={styles.contextRow}>
            <View style={styles.contextIcon}>
              <Icon
                name="lightbulb-on-outline"
                size={16}
                color={communityBrand.accentDeep}
              />
            </View>
            <Text style={styles.contextText}>{segmentHint}</Text>
          </View>

          {tabAction ? (
            <CommunityActionButton
              label={tabAction.label}
              onPress={tabAction.onPress}
            />
          ) : null}

          {communityApiError ? (
            <View style={styles.infoBox}>
              <Icon
                name="information-outline"
                size={16}
                color={communityBrand.accentDeep}
              />
              <Text style={styles.infoBoxText}>{communityApiError}</Text>
            </View>
          ) : null}

          {segment === 'feed' && (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterStrip}
                contentContainerStyle={styles.filters}>
                {FEED_FILTERS.map(f => (
                  <Pressable
                    key={f.id}
                    style={[
                      styles.chip,
                      feedFilter === f.id && styles.chipActive,
                    ]}
                    onPress={() => setFeedFilter(f.id)}>
                    <Text
                      style={[
                        styles.chipText,
                        feedFilter === f.id && styles.chipTextActive,
                      ]}>
                      {f.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {posts.length === 0 ? (
                <CommunityEmptyState
                  icon="post-outline"
                  title="No posts yet"
                  subtitle="Be the first to share a health update or question."
                />
              ) : (
                <View style={styles.list}>
                  {posts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onPress={() =>
                        navigation.navigate('PostDetail', { postId: post.id })
                      }
                      onLike={() => likePost(post.id)}
                    />
                  ))}
                </View>
              )}
            </>
          )}

          {segment === 'groups' && (
            <View style={styles.list}>
              {joinedGroups.length > 0 ? (
                <>
                  <SectionHeader
                    title="Your groups"
                    hint="Groups you already joined"
                  />
                  {joinedGroups.map(group => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onPress={() =>
                        navigation.navigate('GroupDetail', {
                          groupId: group.id,
                        })
                      }
                      onToggleJoin={() => handleToggleGroup(group.id)}
                    />
                  ))}
                </>
              ) : (
                <CommunityEmptyState
                  icon="account-group-outline"
                  title="No groups yet"
                  subtitle="Join a support group to meet people with similar goals."
                />
              )}

              {discoverGroups.length > 0 ? (
                <>
                  <SectionHeader
                    title="Discover groups"
                    hint="Tap Join to become a member"
                  />
                  {discoverGroups.map(group => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onPress={() =>
                        navigation.navigate('GroupDetail', {
                          groupId: group.id,
                        })
                      }
                      onToggleJoin={() => handleToggleGroup(group.id)}
                    />
                  ))}
                </>
              ) : null}
            </View>
          )}

          {segment === 'challenges' && (
            <View style={styles.list}>
              {joinedChallenges.length > 0 ? (
                <>
                  <SectionHeader
                    title="Your challenges"
                    hint="Track progress and earn rewards"
                  />
                  {joinedChallenges.map(ch => (
                    <ChallengeCard
                      key={ch.id}
                      challenge={ch}
                      onPress={() =>
                        navigation.navigate('ChallengeDetail', {
                          challengeId: ch.id,
                        })
                      }
                      onUpdateProgress={() =>
                        navigation.navigate('ChallengeDetail', {
                          challengeId: ch.id,
                        })
                      }
                    />
                  ))}
                </>
              ) : (
                <CommunityEmptyState
                  icon="trophy-outline"
                  title="No challenges yet"
                  subtitle="Join a challenge to build healthy habits with others."
                />
              )}

              {discoverChallenges.length > 0 ? (
                <>
                  <SectionHeader
                    title="Discover challenges"
                    hint="Pick one and start tracking today"
                  />
                  {discoverChallenges.map(ch => (
                    <ChallengeCard
                      key={ch.id}
                      challenge={ch}
                      onPress={() =>
                        navigation.navigate('ChallengeDetail', {
                          challengeId: ch.id,
                        })
                      }
                      onJoin={() => handleToggleChallenge(ch.id)}
                    />
                  ))}
                </>
              ) : null}
            </View>
          )}

          {segment === 'activity' && (
            <CommunityMyActivity
              rows={[
                {
                  icon: 'star-circle-outline',
                  title: 'Rewards & XP',
                  subtitle: `${profile.xp.toLocaleString()} XP · ${profile.coins} coins · ${(profile.badges || []).length} badges`,
                  onPress: () => setSegment('challenges'),
                },
                {
                  icon: 'account-heart-outline',
                  title: 'Health buddies',
                  subtitle: `${buddies.length} people keeping you accountable`,
                  onPress: () => navigation.navigate('Buddies'),
                },
                {
                  icon: 'post-outline',
                  title: 'My posts',
                  subtitle: `${profile.postsCount} post${profile.postsCount === 1 ? '' : 's'} shared`,
                  onPress: () => setSegment('feed'),
                },
                {
                  icon: 'account-group-outline',
                  title: 'Joined groups',
                  subtitle: `${joinedGroups.length} group${joinedGroups.length === 1 ? '' : 's'}`,
                  onPress: () => setSegment('groups'),
                },
                {
                  icon: 'trophy-outline',
                  title: 'Joined challenges',
                  subtitle: `${joinedChallenges.length} active challenge${joinedChallenges.length === 1 ? '' : 's'}`,
                  onPress: () => setSegment('challenges'),
                },
                {
                  icon: 'chart-line',
                  title: 'Weekly health report',
                  subtitle: 'View progress and share with buddies',
                  onPress: () => navigation.navigate('WeeklyReport'),
                },
              ]}
              onViewRewards={() => setSegment('challenges')}
            />
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    paddingBottom: TAB_BAR_CLEARANCE + calmLayout.contentBottom,
    gap: spacing.lg,
  },
  body: {
    paddingHorizontal: calmLayout.screenPadding,
    gap: spacing.lg,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: communityBrand.soft,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  contextIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: communityBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: communityBrand.ink,
    fontWeight: '500',
  },
  sectionHeader: {
    gap: 2,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: communityBrand.ink,
    letterSpacing: -0.2,
  },
  sectionHint: {
    fontSize: 12,
    color: communityBrand.muted,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: communityBrand.soft,
    borderRadius: 16,
    padding: spacing.md,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    color: communityBrand.ink,
    lineHeight: 18,
  },
  filterStrip: { flexGrow: 0 },
  filters: { gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 14,
    backgroundColor: communityBrand.card,
  },
  chipActive: {
    backgroundColor: communityBrand.accent,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: communityBrand.muted,
  },
  chipTextActive: { color: communityBrand.onAccent },
  list: { gap: spacing.lg },
});

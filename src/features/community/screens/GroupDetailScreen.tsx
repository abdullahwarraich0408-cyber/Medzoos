import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { SimpleMessage, SimpleSection } from '../../../design-system';
import { useCommunityContext } from '../../../lib/community/CommunityContext';
import { useAuth } from '../../../lib/auth/AuthContext';
import type { CommunityStackParamList } from '../../../navigation/types';
import type { CommunityPost, GroupMember } from '../../../lib/community/types';
import { PostCard } from '../components/PostCard';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';

type Route = RouteProp<CommunityStackParamList, 'GroupDetail'>;
type Nav = NativeStackNavigationProp<CommunityStackParamList, 'GroupDetail'>;

type TabId = 'discussions' | 'members';

export function GroupDetailScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { isAuthenticated } = useAuth();
  const {
    getGroup,
    toggleGroup,
    fetchGroupMembers,
    fetchGroupPosts,
    getGroupPosts,
    likePost,
    refetchAll,
  } = useCommunityContext();

  const group = getGroup(params.groupId);
  const [tab, setTab] = useState<TabId>('discussions');
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [discussions, setDiscussions] = useState<CommunityPost[]>([]);
  const [requiresJoin, setRequiresJoin] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDiscussions = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const result = await fetchGroupPosts(params.groupId);
      setDiscussions(result.posts);
      setRequiresJoin(result.requiresJoin);
    } finally {
      setLoadingPosts(false);
    }
  }, [fetchGroupPosts, params.groupId]);

  const loadMembers = useCallback(async () => {
    const data = await fetchGroupMembers(params.groupId);
    setMembers(data.members);
    setCanManage(data.canManage);
  }, [fetchGroupMembers, params.groupId]);

  useEffect(() => {
    loadDiscussions();
    if (isAuthenticated) {
      loadMembers();
    }
  }, [loadDiscussions, loadMembers, isAuthenticated, group?.isJoined, group?.memberCount]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadDiscussions(), loadMembers(), refetchAll()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleJoinToggle = async () => {
    const result = await toggleGroup(params.groupId);
    if (result.needAuth) {
      Alert.alert('Sign in required', result.reason || 'Sign in to join groups.', [
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    if (!result.ok) {
      Alert.alert('Group', result.reason || 'Could not update group.');
      return;
    }
    Alert.alert('Group', result.reason || (result.joined ? 'Joined.' : 'Left.'));
    await loadDiscussions();
    await loadMembers();
  };

  const startDiscussion = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign in required', 'Sign in to post in this group.');
      return;
    }
    if (!group?.isJoined) {
      Alert.alert('Join first', 'Join this group to start a discussion.');
      return;
    }
    navigation.navigate('CreatePost', { groupId: params.groupId });
  };

  if (!group) {
    return (
      <ScreenLayout title="Group" headerMode="stack" showSearch={false} showCart={false}>
        <SimpleMessage message="Group not found." tone="default" />
      </ScreenLayout>
    );
  }

  const cachedPosts = getGroupPosts(params.groupId);
  const displayPosts = discussions.length > 0 ? discussions : cachedPosts;

  return (
    <ScreenLayout
      title={group.name}
      headerMode="stack"
      showSearch={false}
      showCart={false}
      onBackPress={() => navigation.goBack()}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <Icon name={group.icon} size={32} color={healthOs.communityViolet} />
          </View>
          <Text style={styles.stats}>
            {group.memberCount.toLocaleString()} members
            {(group.postCount ?? displayPosts.length) > 0
              ? ` · ${(group.postCount ?? displayPosts.length).toLocaleString()} discussions`
              : ''}
          </Text>
        </View>

        <Text style={styles.desc}>{group.description}</Text>

        {group.weeklyTopic ? (
          <SimpleMessage
            label="This week's debate topic"
            message={group.weeklyTopic}
            tone="info"
          />
        ) : null}

        <View style={styles.tabRow}>
          {(['discussions', 'members'] as TabId[]).map(id => (
            <Pressable
              key={id}
              style={[styles.tab, tab === id && styles.tabActive]}
              onPress={() => setTab(id)}>
              <Text style={[styles.tabText, tab === id && styles.tabTextActive]}>
                {id === 'discussions' ? 'Discussions' : 'Members'}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === 'discussions' ? (
          <View style={styles.list}>
            {group.isJoined ? (
              <Pressable style={styles.composeBtn} onPress={startDiscussion}>
                <Icon name="forum-plus-outline" size={20} color={colors.white} />
                <Text style={styles.composeText}>Start a discussion</Text>
              </Pressable>
            ) : (
              <SimpleMessage
                message={
                  isAuthenticated
                    ? 'Join this group to read and join health discussions.'
                    : 'Sign in and join to participate in group discussions.'
                }
                tone="warning"
              />
            )}

            {!group.isJoined && requiresJoin ? null : loadingPosts ? (
              <ActivityIndicator color={healthOs.communityViolet} style={styles.loader} />
            ) : displayPosts.length === 0 ? (
              <View style={styles.empty}>
                <Icon name="forum-outline" size={40} color={colors.neutral300} />
                <Text style={styles.emptyTitle}>No discussions yet</Text>
                <Text style={styles.emptyHint}>
                  Be the first to ask a question, share an experience, or start a debate.
                </Text>
              </View>
            ) : (
              displayPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPress={() =>
                    navigation.navigate('PostDetail', {
                      postId: post.id,
                      groupId: params.groupId,
                    })
                  }
                  onLike={() => likePost(post.id)}
                />
              ))
            )}
          </View>
        ) : (
          <View style={styles.list}>
            {members.length > 0 ? (
              members.map(m => (
                <View key={m.id} style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Icon name="account" size={18} color={healthOs.communityViolet} />
                  </View>
                  <View style={styles.memberBody}>
                    <Text style={styles.memberName}>{m.name}</Text>
                    <Text style={styles.memberRole}>{m.role}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.muted}>
                {group.isJoined ? 'No members listed.' : 'Join to see members.'}
              </Text>
            )}

            {canManage ? (
              <Pressable
                style={styles.secondaryBtn}
                onPress={() =>
                  navigation.navigate('AddGroupMember', { groupId: group.id })
                }>
                <Icon name="account-plus" size={18} color={healthOs.communityViolet} />
                <Text style={styles.secondaryBtnText}>Add member</Text>
              </Pressable>
            ) : null}

            {group.moderators.length > 0 ? (
              <>
                <SimpleSection title="Moderators" />
                {group.moderators.map(m => (
                  <Text key={m} style={styles.listItem}>
                    · {m}
                  </Text>
                ))}
              </>
            ) : null}
          </View>
        )}

        <Pressable
          style={[styles.btn, group.isJoined && styles.btnJoined]}
          onPress={handleJoinToggle}>
          <Text style={[styles.btnText, group.isJoined && styles.btnTextJoined]}>
            {group.isJoined ? 'Leave group' : 'Join group'}
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
  hero: { alignItems: 'center', gap: spacing.sm },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: healthOs.communitySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: healthOsTypography.messageCaption,
  desc: healthOsTypography.messageBody,
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.neutral100,
    borderRadius: radius.pill,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  tabActive: {
    backgroundColor: colors.white,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral500,
  },
  tabTextActive: {
    color: healthOs.communityViolet,
  },
  list: { gap: spacing.md },
  composeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: healthOs.communityViolet,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  composeText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  loader: { marginVertical: spacing.xl },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.ink900 },
  emptyHint: {
    fontSize: 13,
    color: colors.neutral500,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: healthOs.communitySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberBody: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '600', color: colors.ink900 },
  memberRole: { fontSize: 12, color: colors.neutral500, textTransform: 'capitalize' },
  muted: { fontSize: 13, color: colors.neutral500 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.communityViolet,
  },
  secondaryBtnText: { fontWeight: '700', color: healthOs.communityViolet },
  listItem: { fontSize: 14, color: colors.neutral800, lineHeight: 24 },
  btn: {
    backgroundColor: healthOs.communityViolet,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  btnJoined: { backgroundColor: colors.statusSuccessBg },
  btnText: { fontSize: 16, fontWeight: '700', color: colors.white },
  btnTextJoined: { color: colors.statusSuccess },
});

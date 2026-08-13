import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { SimpleMessage } from '../../../design-system';
import { useCommunityContext } from '../../../lib/community/CommunityContext';
import type { CommunityStackParamList } from '../../../navigation/types';
import type { CommunityPost } from '../../../lib/community/types';
import { getVideoThumbnail } from '../../../lib/community/videoUtils';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';

type Route = RouteProp<CommunityStackParamList, 'PostDetail'>;
type Nav = NativeStackNavigationProp<CommunityStackParamList, 'PostDetail'>;

export function PostDetailScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { getPost, fetchPost, likePost, addComment } = useCommunityContext();
  const [post, setPost] = useState<CommunityPost | undefined>(() => getPost(params.postId));
  const [loading, setLoading] = useState(!post);
  const [comment, setComment] = useState('');

  useEffect(() => {
    let active = true;
    const cached = getPost(params.postId);
    if (cached) {
      setPost(cached);
      setLoading(false);
      return;
    }
    fetchPost(params.postId).then(fetched => {
      if (active) {
        setPost(fetched ?? undefined);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [params.postId, getPost, fetchPost]);

  const refreshPost = async () => {
    const fetched = await fetchPost(params.postId);
    if (fetched) setPost(fetched);
  };

  if (loading) {
    return (
      <ScreenLayout title="Discussion" headerMode="stack" showSearch={false} showCart={false}>
        <ActivityIndicator color={healthOs.communityViolet} style={styles.loader} />
      </ScreenLayout>
    );
  }

  if (!post) {
    return (
      <ScreenLayout title="Discussion" headerMode="stack" showSearch={false} showCart={false}>
        <SimpleMessage message="This discussion is no longer available." tone="default" />
      </ScreenLayout>
    );
  }

  const isDebate = post.category === 'Debate';
  const isVideo = post.postType === 'video';
  const isPhoto = post.postType === 'photo';
  const videoThumb =
    post.thumbnailUrl || (post.videoUrl ? getVideoThumbnail(post.videoUrl) : null);

  const openVideo = () => {
    if (!post.videoUrl) return;
    Linking.openURL(post.videoUrl).catch(() => {
      Alert.alert('Could not open video', 'Check the link and try again.');
    });
  };

  const submitComment = async () => {
    const ok = await addComment(post.id, comment);
    if (ok) {
      setComment('');
      await refreshPost();
    } else {
      Alert.alert(
        'Could not reply',
        'Join the group and sign in to participate in this discussion.',
      );
    }
  };

  return (
    <ScreenLayout
      title={isDebate ? 'Debate' : 'Discussion'}
      headerMode="stack"
      showSearch={false}
      showCart={false}
      onBackPress={() => navigation.goBack()}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          {isDebate ? (
            <View style={styles.debateBanner}>
              <Icon name="forum" size={18} color={healthOs.communityViolet} />
              <Text style={styles.debateBannerText}>
                Respectful debate — share views, not medical orders.
              </Text>
            </View>
          ) : null}

          <View style={styles.header}>
            <Text style={styles.author}>{post.authorName}</Text>
            {post.isVerified && (
              <Icon name="check-decagram" size={16} color={healthOs.communityViolet} />
            )}
          </View>
          <Text style={styles.meta}>
            {post.category} · {post.timeAgo} ago
            {post.isAnonymous ? ' · Anonymous' : ''}
            {isVideo ? ' · Video' : isPhoto ? ' · Photo' : ''}
          </Text>

          {isPhoto && post.imageUrl ? (
            <Image source={{ uri: post.imageUrl }} style={styles.photoBlock} resizeMode="cover" />
          ) : null}

          {isVideo && post.videoUrl ? (
            <Pressable style={styles.videoBlock} onPress={openVideo}>
              {videoThumb ? (
                <Image source={{ uri: videoThumb }} style={styles.videoImage} />
              ) : (
                <View style={styles.videoPlaceholder}>
                  <Icon name="video" size={40} color={healthOs.communityViolet} />
                </View>
              )}
              <View style={styles.videoPlay}>
                <Icon name="play-circle" size={56} color={colors.white} />
              </View>
              <Text style={styles.watchText}>Tap to watch</Text>
            </Pressable>
          ) : null}

          {post.content ? <Text style={styles.body}>{post.content}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              style={styles.action}
              onPress={async () => {
                await likePost(post.id);
                await refreshPost();
              }}>
              <Icon
                name={post.likedByMe ? 'heart' : 'heart-outline'}
                size={20}
                color={post.likedByMe ? healthOs.streakFire : colors.neutral500}
              />
              <Text style={styles.actionText}>{post.likes} likes</Text>
            </Pressable>
            <View style={styles.action}>
              <Icon name="comment-text-outline" size={20} color={colors.neutral500} />
              <Text style={styles.actionText}>
                {post.commentList.length} {isDebate ? 'replies' : 'comments'}
              </Text>
            </View>
          </View>

          <Text style={styles.commentsTitle}>
            {isDebate ? 'Debate replies' : 'Comments'} ({post.commentList.length})
          </Text>
          {post.commentList.length === 0 ? (
            <Text style={styles.noReplies}>
              {isDebate
                ? 'No replies yet. Share your perspective respectfully.'
                : 'No comments yet. Be the first to respond.'}
            </Text>
          ) : (
            post.commentList.map(c => (
              <View key={c.id} style={styles.comment}>
                <Text style={styles.commentAuthor}>
                  {c.authorName}
                  {c.isVerified ? ' · Verified' : ''}
                </Text>
                <Text style={styles.commentBody}>{c.content}</Text>
                <Text style={styles.commentTime}>{c.timeAgo} ago</Text>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder={
              isDebate ? 'Add your reply to the debate...' : 'Write a supportive comment...'
            }
            placeholderTextColor={colors.neutral500}
            value={comment}
            onChangeText={setComment}
          />
          <Pressable style={styles.sendBtn} onPress={submitComment}>
            <Icon name="send" size={18} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loader: { marginTop: spacing.xxl },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  debateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: healthOs.communitySurface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  debateBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: healthOs.communityViolet,
    lineHeight: 18,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  author: healthOsTypography.messageTitle,
  meta: healthOsTypography.messageCaption,
  photoBlock: {
    width: '100%',
    height: 260,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral100,
  },
  videoBlock: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    height: 200,
    backgroundColor: colors.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoImage: { width: '100%', height: '100%' },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  videoPlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  watchText: {
    position: 'absolute',
    bottom: spacing.md,
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  body: healthOsTypography.messageBody,
  actions: { flexDirection: 'row', paddingVertical: spacing.sm, gap: spacing.lg },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 14, color: colors.neutral600 },
  commentsTitle: { ...healthOsTypography.sectionTitle, marginTop: spacing.sm },
  noReplies: { fontSize: 13, color: colors.neutral500, fontStyle: 'italic' },
  comment: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  commentAuthor: { fontSize: 13, fontWeight: '600', color: colors.ink900 },
  commentBody: { fontSize: 14, lineHeight: 21, color: colors.neutral800 },
  commentTime: { fontSize: 11, color: colors.neutral500 },
  inputBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom: TAB_BAR_CLEARANCE + spacing.sm,
    borderTopWidth: 1,
    borderTopColor: healthOs.messageBorder,
    backgroundColor: colors.surfaceBase,
  },
  input: {
    flex: 1,
    minHeight: 44,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
    color: colors.ink900,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: healthOs.communityViolet,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

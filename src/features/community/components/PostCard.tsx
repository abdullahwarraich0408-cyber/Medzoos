import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows } from '../../../theme';
import type { CommunityPost } from '../../../lib/community/types';
import { getVideoThumbnail } from '../../../lib/community/videoUtils';

type PostCardProps = {
  post: CommunityPost;
  onPress: () => void;
  onLike: () => void;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function PostCard({ post, onPress, onLike }: PostCardProps) {
  const isVideo = post.postType === 'video';
  const isPhoto = post.postType === 'photo';
  const thumb =
    post.thumbnailUrl ||
    (post.videoUrl ? getVideoThumbnail(post.videoUrl) : null);

  const metaParts = [
    post.groupName || post.category,
    `${post.timeAgo} ago`,
  ].filter(Boolean);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{getInitials(post.authorName)}</Text>
        </View>
        <View style={styles.meta}>
          <View style={styles.nameRow}>
            <Text style={styles.author}>{post.authorName}</Text>
            {post.isVerified ? (
              <Icon
                name="check-decagram"
                size={14}
                color={colors.primary700}
              />
            ) : null}
            {isVideo || isPhoto ? (
              <View style={styles.typePill}>
                <Text style={styles.typePillText}>
                  {isVideo ? 'Video' : 'Photo'}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.subMeta}>{metaParts.join(' · ')}</Text>
        </View>
      </View>

      {post.content ? (
        <Text style={styles.body} numberOfLines={4}>
          {post.content}
        </Text>
      ) : null}

      {isPhoto && post.imageUrl ? (
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.media}
          resizeMode="cover"
        />
      ) : null}

      {isVideo && thumb ? (
        <View style={styles.media}>
          <Image
            source={{ uri: thumb }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
          <View style={styles.playOverlay}>
            <Icon name="play-circle" size={40} color={colors.white} />
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable style={styles.action} onPress={onLike}>
          <Icon
            name={post.likedByMe ? 'heart' : 'heart-outline'}
            size={16}
            color={post.likedByMe ? colors.error : colors.textMuted}
          />
          <Text style={styles.actionText}>{post.likes}</Text>
        </Pressable>
        <View style={styles.action}>
          <Icon name="comment-outline" size={16} color={colors.textMuted} />
          <Text style={styles.actionText}>{post.comments}</Text>
        </View>
        <Pressable
          style={styles.action}
          onPress={() => Alert.alert('Share', 'Sharing will be available soon.')}>
          <Icon name="share-outline" size={16} color={colors.textMuted} />
          <Text style={styles.actionText}>Share</Text>
        </Pressable>
      </View>
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
    gap: spacing.md,
    ...shadows.card,
  },
  pressed: { opacity: 0.97 },
  header: { flexDirection: 'row', gap: spacing.md },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary700,
  },
  meta: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  author: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  typePill: {
    backgroundColor: colors.primary100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  typePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary700,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textPrimary,
  },
  media: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    height: 160,
    backgroundColor: colors.primary100,
  },
  mediaImage: { width: '100%', height: '100%' },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8,43,63,0.25)',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

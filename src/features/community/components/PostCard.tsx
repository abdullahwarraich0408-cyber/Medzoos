import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { CommunityPost } from '../../../lib/community/types';
import { getVideoThumbnail } from '../../../lib/community/videoUtils';
import { communityBrand } from '../communityBrand';

type PostCardProps = {
  post: CommunityPost;
  onPress: () => void;
  onLike: () => void;
};

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .map(p => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  );
}

/**
 * Feed post card — prominent teal system layout for Community.
 */
export function PostCard({ post, onPress, onLike }: PostCardProps) {
  const isVideo = post.postType === 'video';
  const isPhoto = post.postType === 'photo';
  const thumb =
    post.thumbnailUrl ||
    (post.videoUrl ? getVideoThumbnail(post.videoUrl) : null);
  const category = post.groupName || post.category;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Post by ${post.authorName}`}>
      <View style={styles.rail} />

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{getInitials(post.authorName)}</Text>
        </View>

        <View style={styles.meta}>
          <View style={styles.nameRow}>
            <Text style={styles.author} numberOfLines={1}>
              {post.authorName}
            </Text>
            {post.isVerified ? (
              <Icon
                name="check-decagram"
                size={16}
                color={communityBrand.accent}
              />
            ) : null}
          </View>

          <View style={styles.metaRow}>
            {category ? (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText} numberOfLines={1}>
                  {category}
                </Text>
              </View>
            ) : null}
            <Text style={styles.timeText}>{post.timeAgo} ago</Text>
            {isVideo || isPhoto ? (
              <View style={styles.typePill}>
                <Icon
                  name={isVideo ? 'play-circle-outline' : 'image-outline'}
                  size={12}
                  color={communityBrand.accent}
                />
                <Text style={styles.typePillText}>
                  {isVideo ? 'Video' : 'Photo'}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.chevronChip}>
          <Icon
            name="chevron-right"
            size={18}
            color={communityBrand.muted}
          />
        </View>
      </View>

      {post.content ? (
        <Text style={styles.body} numberOfLines={5}>
          {post.content}
        </Text>
      ) : null}

      {isPhoto && post.imageUrl ? (
        <View style={styles.media}>
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
        </View>
      ) : null}

      {isVideo && thumb ? (
        <View style={styles.media}>
          <Image
            source={{ uri: thumb }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
          <View style={styles.playOverlay}>
            <View style={styles.playBtn}>
              <Icon name="play" size={28} color={communityBrand.onAccent} />
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.actionBtn,
            post.likedByMe && styles.actionBtnLiked,
            pressed && styles.actionPressed,
          ]}
          onPress={onLike}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`${post.likes} likes`}>
          <Icon
            name={post.likedByMe ? 'heart' : 'heart-outline'}
            size={18}
            color={
              post.likedByMe ? '#C45B5B' : communityBrand.accent
            }
          />
          <Text
            style={[
              styles.actionText,
              post.likedByMe && styles.actionTextLiked,
            ]}>
            {post.likes}
          </Text>
        </Pressable>

        <View style={styles.actionBtn}>
          <Icon
            name="comment-outline"
            size={18}
            color={communityBrand.accent}
          />
          <Text style={styles.actionText}>{post.comments}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.actionBtn,
            pressed && styles.actionPressed,
          ]}
          onPress={() =>
            Alert.alert('Share', 'Sharing will be available soon.')
          }
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Share post">
          <Icon
            name="share-variant-outline"
            size={18}
            color={communityBrand.accent}
          />
          <Text style={styles.actionText}>Share</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: communityBrand.card,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: communityBrand.mist,
    paddingTop: 16,
    paddingBottom: 14,
    paddingLeft: 16,
    paddingRight: 14,
    gap: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: communityBrand.ink,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 18,
      },
      android: { elevation: 4 },
    }),
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }],
  },
  rail: {
    position: 'absolute',
    left: 0,
    top: 18,
    bottom: 18,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: communityBrand.accent,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: communityBrand.soft,
    borderWidth: 1,
    borderColor: communityBrand.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 15,
    fontWeight: '800',
    color: communityBrand.accent,
    letterSpacing: -0.3,
  },
  meta: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  author: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '800',
    color: communityBrand.ink,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryPill: {
    maxWidth: '55%',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: communityBrand.soft,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: communityBrand.accent,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: communityBrand.muted,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: communityBrand.glaze,
  },
  typePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: communityBrand.accentDeep,
  },
  chevronChip: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: communityBrand.soft,
    marginTop: 2,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
    color: communityBrand.ink,
    letterSpacing: -0.1,
  },
  media: {
    borderRadius: 18,
    overflow: 'hidden',
    height: 196,
    backgroundColor: communityBrand.soft,
    borderWidth: 1,
    borderColor: communityBrand.border,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 69, 84, 0.28)',
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: communityBrand.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: communityBrand.soft,
    minHeight: 36,
  },
  actionBtnLiked: {
    backgroundColor: '#F7EBEA',
  },
  actionPressed: {
    opacity: 0.88,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: communityBrand.ink,
  },
  actionTextLiked: {
    color: '#C45B5B',
  },
});

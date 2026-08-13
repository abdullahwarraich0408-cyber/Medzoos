import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Switch,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { SimpleMessage, SimpleSection } from '../../../design-system';
import { useCommunityContext } from '../../../lib/community/CommunityContext';
import { communityCopy } from '../../../lib/copy/uiMessages';
import {
  GROUP_DISCUSSION_CATEGORIES,
  categoryHint,
} from '../../../lib/community/groupConstants';
import { getVideoThumbnail, normalizeVideoUrl } from '../../../lib/community/videoUtils';
import {
  pickPhotoFromLibrary,
  pickVideoFromLibrary,
  uploadCommunityPhoto,
  uploadCommunityVideo,
} from '../../../lib/community/uploadMedia';
import type { CommunityStackParamList } from '../../../navigation/types';
import type { PostType } from '../../../lib/community/types';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'CreatePost'>;
type Route = RouteProp<CommunityStackParamList, 'CreatePost'>;

const MAIN_FEED_CATEGORIES = [
  'General',
  'Success Story',
  'Mental Wellness',
  'Nutrition',
  'Fitness',
  'Diabetes',
  'Question',
  'Health Tips',
];

export function CreatePostScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const groupId = route.params?.groupId;
  const { createPost, getGroup } = useCommunityContext();
  const group = groupId ? getGroup(groupId) : undefined;

  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [category, setCategory] = useState('General');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const resolvedVideoUrl = uploadedVideoUrl || normalizeVideoUrl(videoUrl);
  const hasPhoto = Boolean(imageUrl);
  const hasVideo = Boolean(resolvedVideoUrl);
  const postType: PostType = hasVideo ? 'video' : hasPhoto ? 'photo' : 'text';
  const videoThumbnail = getVideoThumbnail(resolvedVideoUrl);

  const categories = groupId ? [...GROUP_DISCUSSION_CATEGORIES] : MAIN_FEED_CATEGORIES;

  const clearPhoto = () => {
    setImageUrl(null);
    setLocalImageUri(null);
  };

  const clearVideo = () => {
    setVideoUrl('');
    setUploadedVideoUrl(null);
  };

  const handlePickPhoto = async () => {
    if (hasVideo) {
      Alert.alert('Replace video?', 'Adding a photo will remove the video.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            clearVideo();
            await pickAndUploadPhoto();
          },
        },
      ]);
      return;
    }
    await pickAndUploadPhoto();
  };

  const pickAndUploadPhoto = async () => {
    setUploading(true);
    try {
      const picked = await pickPhotoFromLibrary();
      if (!picked) return;
      setLocalImageUri(picked.uri);
      const url = await uploadCommunityPhoto(picked);
      setImageUrl(url);
      Alert.alert('Photo added', 'Your photo is ready to publish.');
    } catch (err) {
      setLocalImageUri(null);
      setImageUrl(null);
      Alert.alert(
        'Upload failed',
        err instanceof Error ? err.message : 'Could not upload photo.',
      );
    } finally {
      setUploading(false);
    }
  };

  const handlePickVideo = async () => {
    if (hasPhoto) {
      Alert.alert('Replace photo?', 'Adding a video will remove the photo.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            clearPhoto();
            await pickAndUploadVideo();
          },
        },
      ]);
      return;
    }
    await pickAndUploadVideo();
  };

  const pickAndUploadVideo = async () => {
    setUploading(true);
    try {
      const picked = await pickVideoFromLibrary();
      if (!picked) return;
      const url = await uploadCommunityVideo(picked);
      setUploadedVideoUrl(url);
      setVideoUrl('');
      Alert.alert('Video added', 'Your video is ready to publish.');
    } catch (err) {
      Alert.alert(
        'Upload failed',
        err instanceof Error ? err.message : 'Could not upload video.',
      );
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUrlChange = (text: string) => {
    if (hasPhoto && text.trim()) {
      Alert.alert('Replace photo?', 'Adding a video link will remove the photo.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            clearPhoto();
            setVideoUrl(text);
            setUploadedVideoUrl(null);
          },
        },
      ]);
      return;
    }
    setVideoUrl(text);
    setUploadedVideoUrl(null);
  };

  const canPublish =
    postType === 'photo'
      ? Boolean(imageUrl)
      : postType === 'video'
        ? Boolean(resolvedVideoUrl)
        : content.trim().length >= 10;

  const publish = async () => {
    setSubmitting(true);
    try {
      const result = await createPost({
        content,
        category,
        isAnonymous,
        groupId,
        postType,
        imageUrl: imageUrl || undefined,
        videoUrl: postType === 'video' ? resolvedVideoUrl : undefined,
        thumbnailUrl: postType === 'video' ? videoThumbnail || undefined : undefined,
      });
      if (result.ok) {
        Alert.alert(
          'Published',
          groupId
            ? 'Your post is live in the group.'
            : communityCopy.postPublished,
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      } else {
        Alert.alert('Not published', result.reason || communityCopy.postBlocked);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout
      title={groupId ? 'Start discussion' : 'Create post'}
      headerMode="stack"
      showSearch={false}
      showCart={false}
      onBackPress={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.content}>
        {group ? (
          <SimpleMessage
            label={`Posting in ${group.name}`}
            message={group.weeklyTopic || 'Share with group members.'}
            tone="info"
          />
        ) : (
          <SimpleMessage
            message="Write your message and optionally add a photo or video."
            tone="info"
          />
        )}

        <SimpleSection
          title="Your message"
          hint={
            hasPhoto || hasVideo
              ? 'Optional caption'
              : categoryHint(category)
          }
        />
        <TextInput
          style={styles.textarea}
          placeholder={
            hasPhoto || hasVideo
              ? 'Add a caption (optional)...'
              : 'Write clearly so others can understand and help...'
          }
          placeholderTextColor={colors.neutral500}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        {!groupId ? (
          <>
            <SimpleSection title="Add to your post" hint="Photo or video — choose one" />
            <View style={styles.mediaRow}>
              <Pressable
                style={[styles.mediaBtn, hasPhoto && styles.mediaBtnActive]}
                onPress={handlePickPhoto}
                disabled={uploading}>
                <Icon
                  name="image-outline"
                  size={22}
                  color={hasPhoto ? healthOs.communityViolet : colors.neutral600}
                />
                <Text style={[styles.mediaBtnText, hasPhoto && styles.mediaBtnTextActive]}>
                  Photo
                </Text>
              </Pressable>
              <Pressable
                style={[styles.mediaBtn, hasVideo && styles.mediaBtnActive]}
                onPress={handlePickVideo}
                disabled={uploading}>
                <Icon
                  name="video-outline"
                  size={22}
                  color={hasVideo ? healthOs.communityViolet : colors.neutral600}
                />
                <Text style={[styles.mediaBtnText, hasVideo && styles.mediaBtnTextActive]}>
                  Video
                </Text>
              </Pressable>
            </View>

            {uploading ? (
              <View style={styles.uploadingRow}>
                <ActivityIndicator color={healthOs.communityViolet} />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            ) : null}

            {hasPhoto ? (
              <View style={styles.previewWrap}>
                <Image
                  source={{ uri: localImageUri || imageUrl || undefined }}
                  style={styles.photoPreview}
                  resizeMode="cover"
                />
                <Pressable style={styles.removeMediaBtn} onPress={clearPhoto}>
                  <Icon name="close-circle" size={22} color={colors.statusDanger} />
                  <Text style={styles.removeText}>Remove photo</Text>
                </Pressable>
              </View>
            ) : null}

            {hasVideo ? (
              <View style={styles.previewWrap}>
                {videoThumbnail ? (
                  <Image source={{ uri: videoThumbnail }} style={styles.photoPreview} resizeMode="cover" />
                ) : (
                  <View style={styles.videoPlaceholder}>
                    <Icon name="video" size={36} color={healthOs.communityViolet} />
                    <Text style={styles.videoPlaceholderText}>Video attached</Text>
                  </View>
                )}
                <Pressable style={styles.removeMediaBtn} onPress={clearVideo}>
                  <Icon name="close-circle" size={22} color={colors.statusDanger} />
                  <Text style={styles.removeText}>Remove video</Text>
                </Pressable>
              </View>
            ) : null}

            {!hasVideo ? (
              <>
                <TextInput
                  style={styles.input}
                  value={videoUrl}
                  onChangeText={handleVideoUrlChange}
                  placeholder="Or paste a YouTube link..."
                  placeholderTextColor={colors.neutral500}
                  autoCapitalize="none"
                  editable={!hasPhoto}
                />
              </>
            ) : null}
          </>
        ) : null}

        <SimpleSection title={groupId ? 'Discussion type' : 'Category'} />
        <View style={styles.chips}>
          {categories.map(cat => (
            <Pressable
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory(cat)}>
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.anonRow}>
          <View style={styles.anonText}>
            <Text style={styles.anonTitle}>{communityCopy.anonymousTitle}</Text>
            <Text style={styles.anonHint}>{communityCopy.anonymousHint}</Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ true: healthOs.communityViolet, false: colors.neutral300 }}
          />
        </View>

        <SimpleMessage message={communityCopy.moderationNote} tone="warning" />

        <Pressable
          style={[styles.publishBtn, (!canPublish || submitting) && styles.publishDisabled]}
          onPress={publish}
          disabled={!canPublish || submitting}>
          <Text style={styles.publishText}>
            {submitting ? 'Publishing...' : groupId ? 'Post to group' : 'Publish post'}
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
  input: {
    backgroundColor: colors.surfaceBase,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.ink900,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mediaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
  },
  mediaBtnActive: {
    borderColor: healthOs.communityViolet,
    backgroundColor: healthOs.communitySurface,
  },
  mediaBtnText: { fontSize: 14, fontWeight: '700', color: colors.neutral600 },
  mediaBtnTextActive: { color: healthOs.communityViolet },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  uploadingText: { fontSize: 13, color: colors.neutral600 },
  previewWrap: { gap: spacing.sm },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral100,
  },
  videoPlaceholder: {
    height: 160,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  videoPlaceholderText: { fontSize: 13, color: colors.neutral600, fontWeight: '600' },
  removeMediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  removeText: { fontSize: 13, color: colors.statusDanger, fontWeight: '600' },
  textarea: {
    minHeight: 120,
    backgroundColor: colors.surfaceBase,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink900,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceBase,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
  },
  chipActive: {
    backgroundColor: healthOs.communitySurface,
    borderColor: healthOs.communityViolet,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.neutral600 },
  chipTextActive: { color: healthOs.communityViolet },
  anonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceBase,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
  },
  anonText: { flex: 1, gap: 4 },
  anonTitle: healthOsTypography.messageTitle,
  anonHint: healthOsTypography.messageCaption,
  publishBtn: {
    backgroundColor: healthOs.communityViolet,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  publishDisabled: { opacity: 0.5 },
  publishText: { fontSize: 16, fontWeight: '700', color: colors.white },
});

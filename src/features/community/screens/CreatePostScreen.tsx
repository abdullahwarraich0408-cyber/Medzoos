import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Switch,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { KeyboardAwareScrollView } from '../../../components/keyboard';
import { useCommunityContext } from '../../../lib/community/CommunityContext';
import { communityCopy } from '../../../lib/copy/uiMessages';
import {
  GROUP_DISCUSSION_CATEGORIES,
  categoryHint,
} from '../../../lib/community/groupConstants';
import {
  getVideoThumbnail,
  getYouTubeVideoId,
  isDirectVideoUrl,
  normalizeVideoUrl,
} from '../../../lib/community/videoUtils';
import {
  pickPhotoFromLibrary,
  pickVideoFromLibrary,
  uploadCommunityPhoto,
  uploadCommunityVideo,
} from '../../../lib/community/uploadMedia';
import type { CommunityStackParamList } from '../../../navigation/types';
import type { PostType } from '../../../lib/community/types';
import { spacing, TAB_BAR_CLEARANCE } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';
import { communityBrand } from '../communityBrand';

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

/** Field limits — aligned with moderation + UX */
const LIMITS = {
  messageMin: 10,
  messageMax: 2000,
  captionMax: 500,
  videoUrlMax: 300,
} as const;

function isValidVideoLink(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  return Boolean(getYouTubeVideoId(trimmed) || isDirectVideoUrl(trimmed));
}

function FieldLabel({
  title,
  hint,
  count,
  max,
  error,
}: {
  title: string;
  hint?: string;
  count?: number;
  max?: number;
  error?: string | null;
}) {
  return (
    <View style={styles.fieldHead}>
      <View style={styles.fieldHeadRow}>
        <Text style={styles.fieldTitle}>{title}</Text>
        {typeof count === 'number' && typeof max === 'number' ? (
          <Text
            style={[
              styles.counter,
              count > max && styles.counterError,
            ]}>{`${count}/${max}`}</Text>
        ) : null}
      </View>
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

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
  const [touched, setTouched] = useState({
    content: false,
    videoUrl: false,
    category: false,
  });

  const resolvedVideoUrl = uploadedVideoUrl || normalizeVideoUrl(videoUrl);
  const hasPhoto = Boolean(imageUrl);
  const hasVideo = Boolean(uploadedVideoUrl) || Boolean(normalizeVideoUrl(videoUrl));
  const hasResolvedVideo = Boolean(
    uploadedVideoUrl ||
      (videoUrl.trim() && isValidVideoLink(videoUrl)),
  );
  const postType: PostType = hasResolvedVideo
    ? 'video'
    : hasPhoto
      ? 'photo'
      : 'text';
  const videoThumbnail = getVideoThumbnail(resolvedVideoUrl);
  const categories = groupId
    ? [...GROUP_DISCUSSION_CATEGORIES]
    : MAIN_FEED_CATEGORIES;

  const contentLen = content.length;
  const videoUrlLen = videoUrl.length;
  const contentMax =
    hasPhoto || hasResolvedVideo ? LIMITS.captionMax : LIMITS.messageMax;

  const contentError = useMemo(() => {
    if (!touched.content && contentLen === 0) return null;
    if (contentLen > contentMax) {
      return `Keep this under ${contentMax} characters.`;
    }
    if (postType === 'text') {
      if (content.trim().length === 0) {
        return 'Write a message to publish.';
      }
      if (content.trim().length < LIMITS.messageMin) {
        return `Write at least ${LIMITS.messageMin} characters.`;
      }
    } else if (
      content.trim().length > 0 &&
      content.trim().length < LIMITS.messageMin
    ) {
      return `Caption must be empty or at least ${LIMITS.messageMin} characters.`;
    }
    return null;
  }, [touched.content, contentLen, contentMax, content, postType]);

  const videoUrlError = useMemo(() => {
    if (groupId || uploadedVideoUrl) return null;
    const trimmed = videoUrl.trim();
    if (!trimmed) return null;
    if (!touched.videoUrl && !trimmed) return null;
    if (trimmed.length > LIMITS.videoUrlMax) {
      return `Link must be under ${LIMITS.videoUrlMax} characters.`;
    }
    if (!isValidVideoLink(trimmed)) {
      return 'Paste a valid YouTube or direct video (.mp4) link.';
    }
    return null;
  }, [groupId, uploadedVideoUrl, videoUrl, touched.videoUrl]);

  const categoryError = useMemo(() => {
    if (!touched.category) return null;
    if (!category || !categories.includes(category as never)) {
      return 'Choose a category.';
    }
    return null;
  }, [touched.category, category, categories]);

  const canPublish = useMemo(() => {
    if (contentError || videoUrlError || categoryError) return false;
    if (!category) return false;
    if (postType === 'photo') return Boolean(imageUrl);
    if (postType === 'video') {
      return Boolean(uploadedVideoUrl || isValidVideoLink(videoUrl));
    }
    return content.trim().length >= LIMITS.messageMin && contentLen <= LIMITS.messageMax;
  }, [
    contentError,
    videoUrlError,
    categoryError,
    category,
    postType,
    imageUrl,
    uploadedVideoUrl,
    videoUrl,
    content,
    contentLen,
  ]);

  const clearPhoto = () => {
    setImageUrl(null);
    setLocalImageUri(null);
  };

  const clearVideo = () => {
    setVideoUrl('');
    setUploadedVideoUrl(null);
  };

  const handleContentChange = (text: string) => {
    if (text.length <= contentMax) {
      setContent(text);
    } else {
      setContent(text.slice(0, contentMax));
    }
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
      setContent(prev => prev.slice(0, LIMITS.captionMax));
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
      setContent(prev => prev.slice(0, LIMITS.captionMax));
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
    const next = text.slice(0, LIMITS.videoUrlMax);
    if (hasPhoto && next.trim()) {
      Alert.alert('Replace photo?', 'Adding a video link will remove the photo.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            clearPhoto();
            setVideoUrl(next);
            setUploadedVideoUrl(null);
            setTouched(t => ({ ...t, videoUrl: true }));
          },
        },
      ]);
      return;
    }
    setVideoUrl(next);
    setUploadedVideoUrl(null);
  };

  const publish = async () => {
    setTouched({ content: true, videoUrl: true, category: true });
    if (!canPublish) {
      Alert.alert(
        'Check your post',
        contentError ||
          videoUrlError ||
          categoryError ||
          'Please complete the required fields.',
      );
      return;
    }

    setSubmitting(true);
    try {
      const result = await createPost({
        content,
        category,
        isAnonymous,
        groupId,
        postType,
        imageUrl: imageUrl || undefined,
        videoUrl:
          postType === 'video'
            ? uploadedVideoUrl || normalizeVideoUrl(videoUrl)
            : undefined,
        thumbnailUrl:
          postType === 'video' ? videoThumbnail || undefined : undefined,
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
      backgroundColor={communityBrand.page}
      onBackPress={() => navigation.goBack()}>
      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroTip}>
          <View style={styles.heroIcon}>
            <Icon
              name="pencil-plus-outline"
              size={18}
              color={communityBrand.accent}
            />
          </View>
          <Text style={styles.heroTipText}>
            {group
              ? `Posting in ${group.name}. ${group.weeklyTopic || 'Share with group members.'}`
              : 'Write your message and optionally add a photo or video.'}
          </Text>
        </View>

        <View style={styles.card}>
          <FieldLabel
            title="Your message"
            hint={
              hasPhoto || hasResolvedVideo
                ? `Optional caption (max ${LIMITS.captionMax})`
                : categoryHint(category) ||
                  `At least ${LIMITS.messageMin} characters`
            }
            count={contentLen}
            max={contentMax}
            error={contentError}
          />
          <TextInput
            style={[styles.textarea, contentError ? styles.inputError : null]}
            placeholder={
              hasPhoto || hasResolvedVideo
                ? 'Add a caption (optional)...'
                : 'Write clearly so others can understand and help...'
            }
            placeholderTextColor={communityBrand.muted}
            value={content}
            onChangeText={handleContentChange}
            onBlur={() => setTouched(t => ({ ...t, content: true }))}
            multiline
            maxLength={contentMax}
            textAlignVertical="top"
          />
        </View>

        {!groupId ? (
          <View style={styles.card}>
            <FieldLabel
              title="Add to your post"
              hint="Photo or video — choose one"
            />
            <View style={styles.mediaRow}>
              <Pressable
                style={[styles.mediaBtn, hasPhoto && styles.mediaBtnActive]}
                onPress={handlePickPhoto}
                disabled={uploading}>
                <Icon
                  name="image-outline"
                  size={22}
                  color={
                    hasPhoto ? communityBrand.accent : communityBrand.muted
                  }
                />
                <Text
                  style={[
                    styles.mediaBtnText,
                    hasPhoto && styles.mediaBtnTextActive,
                  ]}>
                  Photo
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.mediaBtn,
                  hasResolvedVideo && styles.mediaBtnActive,
                ]}
                onPress={handlePickVideo}
                disabled={uploading}>
                <Icon
                  name="video-outline"
                  size={22}
                  color={
                    hasResolvedVideo
                      ? communityBrand.accent
                      : communityBrand.muted
                  }
                />
                <Text
                  style={[
                    styles.mediaBtnText,
                    hasResolvedVideo && styles.mediaBtnTextActive,
                  ]}>
                  Video
                </Text>
              </Pressable>
            </View>

            {uploading ? (
              <View style={styles.uploadingRow}>
                <ActivityIndicator color={communityBrand.accent} />
                <Text style={styles.uploadingText}>Uploading…</Text>
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
                  <Icon
                    name="close-circle"
                    size={20}
                    color={communityBrand.accentDeep}
                  />
                  <Text style={styles.removeText}>Remove photo</Text>
                </Pressable>
              </View>
            ) : null}

            {hasResolvedVideo && uploadedVideoUrl ? (
              <View style={styles.previewWrap}>
                {videoThumbnail ? (
                  <Image
                    source={{ uri: videoThumbnail }}
                    style={styles.photoPreview}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.videoPlaceholder}>
                    <Icon
                      name="video"
                      size={36}
                      color={communityBrand.accent}
                    />
                    <Text style={styles.videoPlaceholderText}>
                      Video attached
                    </Text>
                  </View>
                )}
                <Pressable style={styles.removeMediaBtn} onPress={clearVideo}>
                  <Icon
                    name="close-circle"
                    size={20}
                    color={communityBrand.accentDeep}
                  />
                  <Text style={styles.removeText}>Remove video</Text>
                </Pressable>
              </View>
            ) : null}

            {!uploadedVideoUrl ? (
              <View style={styles.linkBlock}>
                <FieldLabel
                  title="Video link"
                  hint="YouTube or direct .mp4 URL"
                  count={videoUrlLen}
                  max={LIMITS.videoUrlMax}
                  error={videoUrlError}
                />
                <TextInput
                  style={[styles.input, videoUrlError ? styles.inputError : null]}
                  value={videoUrl}
                  onChangeText={handleVideoUrlChange}
                  onBlur={() => setTouched(t => ({ ...t, videoUrl: true }))}
                  placeholder="Or paste a YouTube link…"
                  placeholderTextColor={communityBrand.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  maxLength={LIMITS.videoUrlMax}
                  editable={!hasPhoto}
                />
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.card}>
          <FieldLabel
            title={groupId ? 'Discussion type' : 'Category'}
            hint="Pick one topic for your post"
            error={categoryError}
          />
          <View style={styles.chips}>
            {categories.map(cat => (
              <Pressable
                key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => {
                  setCategory(cat);
                  setTouched(t => ({ ...t, category: true }));
                }}>
                <Text
                  style={[
                    styles.chipText,
                    category === cat && styles.chipTextActive,
                  ]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.anonRow}>
          <View style={styles.anonText}>
            <Text style={styles.anonTitle}>{communityCopy.anonymousTitle}</Text>
            <Text style={styles.anonHint}>{communityCopy.anonymousHint}</Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{
              true: communityBrand.accentSoft,
              false: communityBrand.mist,
            }}
            thumbColor={
              isAnonymous ? communityBrand.accent : communityBrand.card
            }
          />
        </View>

        <View style={styles.modNote}>
          <Icon
            name="shield-check-outline"
            size={16}
            color={communityBrand.accent}
          />
          <Text style={styles.modNoteText}>{communityCopy.moderationNote}</Text>
        </View>

        <Pressable
          style={[
            styles.publishBtn,
            (!canPublish || submitting || uploading) && styles.publishDisabled,
          ]}
          onPress={publish}
          disabled={!canPublish || submitting || uploading}>
          <Text style={styles.publishText}>
            {submitting
              ? 'Publishing…'
              : groupId
                ? 'Post to group'
                : 'Publish post'}
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: calmLayout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: TAB_BAR_CLEARANCE + spacing.lg,
    gap: spacing.md,
  },
  heroTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: communityBrand.soft,
    borderRadius: 18,
    padding: spacing.md,
  },
  heroIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: communityBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    color: communityBrand.ink,
  },
  card: {
    backgroundColor: communityBrand.card,
    borderRadius: 22,
    padding: spacing.lg,
    gap: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: communityBrand.ink,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  fieldHead: { gap: 4 },
  fieldHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  fieldTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: communityBrand.ink,
    letterSpacing: -0.2,
  },
  fieldHint: {
    fontSize: 12,
    fontWeight: '500',
    color: communityBrand.muted,
    lineHeight: 17,
  },
  fieldError: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B54F35',
    marginTop: 2,
  },
  counter: {
    fontSize: 12,
    fontWeight: '600',
    color: communityBrand.muted,
  },
  counterError: {
    color: '#B54F35',
  },
  input: {
    backgroundColor: communityBrand.page,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: communityBrand.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: communityBrand.ink,
  },
  textarea: {
    minHeight: 132,
    backgroundColor: communityBrand.page,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: communityBrand.border,
    padding: spacing.lg,
    fontSize: 15,
    lineHeight: 22,
    color: communityBrand.ink,
  },
  inputError: {
    borderColor: '#D96B4C',
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  mediaBtn: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: communityBrand.page,
    borderWidth: 1.5,
    borderColor: communityBrand.border,
  },
  mediaBtnActive: {
    borderColor: communityBrand.accent,
    backgroundColor: communityBrand.soft,
  },
  mediaBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: communityBrand.muted,
  },
  mediaBtnTextActive: {
    color: communityBrand.accent,
  },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  uploadingText: {
    fontSize: 13,
    color: communityBrand.muted,
    fontWeight: '500',
  },
  previewWrap: { gap: spacing.sm },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: communityBrand.glaze,
  },
  videoPlaceholder: {
    height: 160,
    borderRadius: 16,
    backgroundColor: communityBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  videoPlaceholderText: {
    fontSize: 13,
    color: communityBrand.muted,
    fontWeight: '600',
  },
  removeMediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  removeText: {
    fontSize: 13,
    color: communityBrand.accentDeep,
    fontWeight: '600',
  },
  linkBlock: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: communityBrand.page,
    borderWidth: 1.5,
    borderColor: communityBrand.border,
  },
  chipActive: {
    backgroundColor: communityBrand.accent,
    borderColor: communityBrand.accent,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: communityBrand.muted,
  },
  chipTextActive: {
    color: communityBrand.onAccent,
  },
  anonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: communityBrand.card,
    borderRadius: 22,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: communityBrand.ink,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  anonText: { flex: 1, gap: 4 },
  anonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: communityBrand.ink,
  },
  anonHint: {
    fontSize: 12,
    lineHeight: 17,
    color: communityBrand.muted,
    fontWeight: '500',
  },
  modNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: communityBrand.soft,
    borderRadius: 16,
    padding: spacing.md,
  },
  modNoteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: communityBrand.ink,
    fontWeight: '500',
  },
  publishBtn: {
    backgroundColor: communityBrand.accent,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: communityBrand.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  publishDisabled: { opacity: 0.45 },
  publishText: {
    fontSize: 16,
    fontWeight: '700',
    color: communityBrand.onAccent,
  },
});

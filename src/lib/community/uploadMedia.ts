import { Platform } from 'react-native';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';
import { getApiBaseUrl } from '../../config/api';
import { getAccessToken } from '../auth/tokenStorage';
import { ApiError } from '../api/client';

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export type PickedMedia = {
  uri: string;
  name: string;
  type: string;
};

function mapAsset(asset: Asset, fallbackPrefix: 'photo' | 'video'): PickedMedia {
  const uri = asset.uri || '';
  const ext = fallbackPrefix === 'photo' ? 'jpg' : 'mp4';
  const fallbackName = `community-${fallbackPrefix}-${Date.now()}.${ext}`;
  const rawName = asset.fileName || uri.split('/').pop() || fallbackName;
  const name = rawName.includes('.') ? rawName : `${rawName}.${ext}`;

  return {
    uri,
    name,
    type: asset.type || (fallbackPrefix === 'photo' ? 'image/jpeg' : 'video/mp4'),
  };
}

async function uploadFormFile(
  endpoint: 'image' | 'video',
  fieldName: 'image' | 'video',
  file: PickedMedia,
): Promise<string> {
  const token = await getAccessToken();
  if (!token) {
    throw new ApiError(`Sign in required to upload ${endpoint}`, 401, null);
  }

  const formData = new FormData();
  formData.append(fieldName, {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);

  const response = await fetch(`${getApiBaseUrl()}/upload/${endpoint}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (payload as { message?: string })?.message ||
      `Upload failed (${response.status})`;
    throw new ApiError(message, response.status, payload);
  }

  const url =
    (payload as { data?: { url?: string } })?.data?.url ||
    (payload as { url?: string })?.url;

  if (!url) {
    throw new ApiError('Upload succeeded but no URL returned', 500, payload);
  }

  return url;
}

export async function uploadCommunityPhoto(file: PickedMedia): Promise<string> {
  return uploadFormFile('image', 'image', file);
}

export async function uploadCommunityVideo(file: PickedMedia): Promise<string> {
  return uploadFormFile('video', 'video', file);
}

export async function pickPhotoFromLibrary(): Promise<PickedMedia | null> {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
    quality: 0.85,
    presentationStyle: Platform.OS === 'ios' ? 'fullScreen' : undefined,
  });

  if (result.didCancel) return null;

  if (result.errorCode) {
    throw new Error(
      result.errorMessage || 'Could not open your photo library.',
    );
  }

  const asset = result.assets?.[0];
  if (!asset?.uri) return null;

  if (asset.fileSize && asset.fileSize > MAX_PHOTO_BYTES) {
    throw new Error('Photo is too large. Please choose a file under 5 MB.');
  }

  return mapAsset(asset, 'photo');
}

export async function pickVideoFromLibrary(): Promise<PickedMedia | null> {
  const result = await launchImageLibrary({
    mediaType: 'video',
    selectionLimit: 1,
    videoQuality: 'high',
    durationLimit: 180,
    presentationStyle: Platform.OS === 'ios' ? 'fullScreen' : undefined,
  });

  if (result.didCancel) return null;

  if (result.errorCode) {
    throw new Error(
      result.errorMessage ||
        'Could not open your video library. Try a YouTube link instead.',
    );
  }

  const asset = result.assets?.[0];
  if (!asset?.uri) return null;

  if (asset.fileSize && asset.fileSize > MAX_VIDEO_BYTES) {
    throw new Error('Video is too large. Please choose a file under 50 MB.');
  }

  return mapAsset(asset, 'video');
}

/** @deprecated Use PickedMedia */
export type PickedVideo = PickedMedia;

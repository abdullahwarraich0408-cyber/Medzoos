import { Platform } from 'react-native';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';
import { getApiBaseUrl } from '../../config/api';
import { getAccessToken } from '../auth/tokenStorage';
import { ApiError } from '../api/client';

export type PickedPrescription = {
  uri: string;
  name: string;
  type: string;
};

const MAX_BYTES = 8 * 1024 * 1024;

function mapAsset(asset: Asset): PickedPrescription {
  const uri = asset.uri || '';
  const rawName = asset.fileName || uri.split('/').pop() || `prescription-${Date.now()}.jpg`;
  const name = rawName.includes('.') ? rawName : `${rawName}.jpg`;
  return {
    uri,
    name,
    type: asset.type || 'image/jpeg',
  };
}

export async function pickPrescriptionImage(): Promise<PickedPrescription | null> {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
    quality: 0.9,
    presentationStyle: Platform.OS === 'ios' ? 'fullScreen' : undefined,
  });

  if (result.didCancel) return null;
  if (result.errorCode) {
    throw new Error(result.errorMessage || 'Could not open photo library.');
  }

  const asset = result.assets?.[0];
  if (!asset?.uri) return null;
  if (asset.fileSize && asset.fileSize > MAX_BYTES) {
    throw new Error('File is too large. Please choose an image under 8 MB.');
  }
  return mapAsset(asset);
}

export async function uploadPrescriptionFile(file: PickedPrescription): Promise<string> {
  const token = await getAccessToken();
  if (!token) {
    throw new ApiError('Sign in required to upload prescriptions', 401, null);
  }

  const formData = new FormData();
  formData.append('document', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);

  const response = await fetch(`${getApiBaseUrl()}/upload/document`, {
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

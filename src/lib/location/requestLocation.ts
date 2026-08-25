import { Linking, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import type { DetectedLocation } from './types';

type Coordinates = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};

let geolocationConfigured = false;

function configureGeolocation() {
  if (geolocationConfigured || typeof Geolocation.setRNConfiguration !== 'function') {
    return;
  }

  Geolocation.setRNConfiguration({
    skipPermissionRequests: true,
    locationProvider: 'auto',
  });
  geolocationConfigured = true;
}

function getGeolocationErrorMessage(error: { code?: number; message?: string }) {
  if (error?.code === 1) {
    return 'Location access was denied. Enable it in device settings and try again.';
  }
  if (error?.code === 2) {
    return 'Location is unavailable. Turn on GPS/Location services and try again.';
  }
  if (error?.code === 3) {
    return 'Location detection timed out. Move outdoors or try again.';
  }
  return error?.message || 'Could not detect location';
}

function normalizeLocationError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message || '';
    if (
      message.includes('is not a function') ||
      message.includes("doesn't seem to be linked")
    ) {
      return 'Location services are unavailable. Rebuild the app, allow location permission, and ensure GPS is on.';
    }
    return message;
  }
  return 'Could not detect location. Turn on GPS and allow location access.';
}

async function ensureAndroidPermission(): Promise<boolean> {
  const fine = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
  const coarse = PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;

  const [fineGranted, coarseGranted] = await Promise.all([
    PermissionsAndroid.check(fine),
    PermissionsAndroid.check(coarse),
  ]);
  if (fineGranted || coarseGranted) {
    return true;
  }

  const result = await PermissionsAndroid.requestMultiple([fine, coarse]);
  const fineStatus = result[fine];
  const coarseStatus = result[coarse];

  if (
    fineStatus === PermissionsAndroid.RESULTS.GRANTED ||
    coarseStatus === PermissionsAndroid.RESULTS.GRANTED
  ) {
    return true;
  }

  if (
    fineStatus === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
    coarseStatus === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
  ) {
    throw new Error(
      'Location permission is blocked. Open Settings → Apps → Medzoos → Permissions → Location and allow it.',
    );
  }

  return false;
}

async function ensureIosPermission(): Promise<boolean> {
  if (typeof Geolocation.requestAuthorization !== 'function') {
    return true;
  }

  return new Promise(resolve => {
    Geolocation.requestAuthorization(
      () => resolve(true),
      () => resolve(false),
    );
  });
}

async function ensureLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    return ensureAndroidPermission();
  }
  return ensureIosPermission();
}

function readPosition(position: {
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
  };
}): Coordinates {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
  };
}

function getCurrentPosition(options: {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}): Promise<Coordinates> {
  if (typeof Geolocation.getCurrentPosition !== 'function') {
    return Promise.reject(
      new Error('Location is not available in this build. Reinstall the app and try again.'),
    );
  }

  configureGeolocation();

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => resolve(readPosition(position)),
      error => reject(new Error(getGeolocationErrorMessage(error))),
      options,
    );
  });
}

async function getAccurateCoordinates(): Promise<Coordinates> {
  // Network/last-known first (faster indoors), then GPS.
  try {
    return await getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 12_000,
      maximumAge: 60_000,
    });
  } catch (networkError) {
    try {
      return await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 25_000,
        maximumAge: 5_000,
      });
    } catch {
      throw networkError;
    }
  }
}

function fallbackFromCoordinates(coords: Coordinates): DetectedLocation {
  const lat = coords.latitude.toFixed(5);
  const lng = coords.longitude.toFixed(5);
  const label = `Near ${lat}, ${lng}`;

  return {
    street: label,
    city: 'Current location',
    province: '',
    latitude: coords.latitude,
    longitude: coords.longitude,
    label,
    accuracy: coords.accuracy,
  };
}

async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<DetectedLocation> {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
    { headers: { Accept: 'application/json' } },
  );

  if (!response.ok) {
    throw new Error('Could not resolve your address from GPS coordinates.');
  }

  const data = (await response.json()) as {
    city?: string;
    locality?: string;
    principalSubdivision?: string;
    street?: string;
    localityInfo?: {
      informative?: Array<{ name?: string; description?: string }>;
    };
  };

  const city = data.city || data.locality || '';
  const province = data.principalSubdivision || '';
  const roadHint = data.localityInfo?.informative?.find(item =>
    item.description?.toLowerCase().includes('road'),
  )?.name;
  const street = data.street || roadHint || data.locality || city;

  const label = [street, city, province].filter(Boolean).join(', ');

  return {
    street: street || city,
    city: city || province || 'Unknown',
    province,
    latitude,
    longitude,
    label: label || city || 'Current location',
  };
}

export function openLocationSettings() {
  if (Platform.OS === 'android') {
    // App permission settings (most common fix after "Don't ask again")
    void Linking.openSettings();
    return;
  }
  void Linking.openSettings();
}

export function openDeviceLocationSettings() {
  if (Platform.OS === 'android') {
    void Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS').catch(() => {
      void Linking.openSettings();
    });
    return;
  }
  void Linking.openSettings();
}

/**
 * Detect precise device location and reverse-geocode to a delivery address.
 * Call only after the user taps Allow on LocationPermissionModal.
 */
export async function detectUserLocation(): Promise<DetectedLocation> {
  try {
    const allowed = await ensureLocationPermission();
    if (!allowed) {
      throw new Error(
        Platform.OS === 'ios'
          ? 'Location permission was denied. Enable it in Settings → Medzoos → Location.'
          : 'Location permission was denied. Enable it in Settings → Apps → Medzoos → Permissions → Location.',
      );
    }

    const coords = await getAccurateCoordinates();

    try {
      const address = await reverseGeocode(coords.latitude, coords.longitude);
      return {
        ...address,
        accuracy: coords.accuracy,
      };
    } catch {
      // GPS worked but address API failed / blocked — still return usable coords.
      return fallbackFromCoordinates(coords);
    }
  } catch (error) {
    throw new Error(normalizeLocationError(error));
  }
}

/** @deprecated Use detectUserLocation — kept for callers that only need city text. */
export async function detectUserCity(): Promise<string | null> {
  const location = await detectUserLocation();
  return location.city || null;
}

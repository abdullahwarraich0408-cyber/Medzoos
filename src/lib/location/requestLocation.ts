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
  const permissions = [
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ];

  const alreadyGranted = await Promise.all(
    permissions.map(permission => PermissionsAndroid.check(permission)),
  );
  if (alreadyGranted.some(Boolean)) {
    return true;
  }

  const result = await PermissionsAndroid.requestMultiple(permissions);
  return permissions.some(
    permission => result[permission] === PermissionsAndroid.RESULTS.GRANTED,
  );
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
  try {
    return await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 25_000,
      maximumAge: 5_000,
    });
  } catch (highAccuracyError) {
    try {
      return await getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 15_000,
        maximumAge: 120_000,
      });
    } catch {
      throw highAccuracyError;
    }
  }
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
  const street =
    data.street ||
    roadHint ||
    data.locality ||
    city;

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
    const address = await reverseGeocode(coords.latitude, coords.longitude);

    return {
      ...address,
      accuracy: coords.accuracy,
    };
  } catch (error) {
    throw new Error(normalizeLocationError(error));
  }
}

/** @deprecated Use detectUserLocation — kept for callers that only need city text. */
export async function detectUserCity(): Promise<string | null> {
  const location = await detectUserLocation();
  return location.city || null;
}

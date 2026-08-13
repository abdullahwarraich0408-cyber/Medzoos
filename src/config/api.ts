import { Platform } from 'react-native';

/** Production Medzoos API (same as website) */
const PRODUCTION_API = 'https://medmarket.asrar.dev/api';

/** Android emulator → host machine localhost */
const LOCAL_ANDROID_EMULATOR = 'http://10.0.2.2:5000/api';

/** Physical Android over USB (requires: adb reverse tcp:5000 tcp:5000) */
const LOCAL_ANDROID_USB = 'http://127.0.0.1:5000/api';

/** iOS simulator → host machine localhost */
const LOCAL_IOS = 'http://localhost:5000/api';

/**
 * Set true to use Backend on your PC (port 5000).
 * Set false to use the live deployed API.
 */
export const USE_LOCAL_API = true;

/**
 * How your Android device reaches the PC backend:
 * - `usb`      — phone plugged in via USB + `adb reverse tcp:5000 tcp:5000` (recommended)
 * - `wifi`     — phone on same Wi‑Fi; set LOCAL_DEV_HOST to your PC IPv4
 * - `emulator` — Android Studio emulator (10.0.2.2)
 */
export const ANDROID_CONNECTION: 'usb' | 'wifi' | 'emulator' = 'usb';

/**
 * Your PC LAN IP — only used when ANDROID_CONNECTION is `wifi`.
 * Find it: Windows `ipconfig` → Wi‑Fi IPv4 (e.g. 172.31.2.189).
 */
export const LOCAL_DEV_HOST = '172.31.2.189';

const localWifiApi = `http://${LOCAL_DEV_HOST}:5000/api`;

export function getApiBaseUrl(): string {
  if (!USE_LOCAL_API) {
    return PRODUCTION_API;
  }

  if (Platform.OS === 'android') {
    if (ANDROID_CONNECTION === 'emulator') return LOCAL_ANDROID_EMULATOR;
    if (ANDROID_CONNECTION === 'usb') return LOCAL_ANDROID_USB;
    return localWifiApi;
  }

  if (Platform.OS === 'ios') {
    return LOCAL_IOS;
  }

  return localWifiApi;
}

/** Logged in dev to confirm which API the app uses */
export function getApiConnectionLabel(): string {
  if (!USE_LOCAL_API) return 'Production API';
  return getApiBaseUrl();
}

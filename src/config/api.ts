import { Platform } from 'react-native';

/**
 * Live Medzoos API — same URL as the website
 * (`Frontend/.env.local.example` → NEXT_PUBLIC_API_URL).
 * Verified: https://backend.medzoos.com/api/health
 */
export const PRODUCTION_API = 'https://backend.medzoos.com/api';

/**
 * Local medzoos-backend port from `.env` (PORT=5001).
 * macOS often occupies 5000 (Control Center / AirPlay), so local API is 5001.
 */
export const LOCAL_API_PORT = 5001;

/** Android emulator → host machine localhost */
const LOCAL_ANDROID_EMULATOR = `http://10.0.2.2:${LOCAL_API_PORT}/api`;

/** Physical Android over USB (requires: adb reverse tcp:5001 tcp:5001) */
const LOCAL_ANDROID_USB = `http://127.0.0.1:${LOCAL_API_PORT}/api`;

/** iOS simulator → host machine localhost */
const LOCAL_IOS = `http://localhost:${LOCAL_API_PORT}/api`;

/**
 * Debug only: hit the PC backend.
 * Release / production builds (`__DEV__ === false`) always use PRODUCTION_API.
 * Flip to `false` in debug if you want Metro to talk to live as well.
 */
const USE_LOCAL_API_IN_DEV = true;

export const USE_LOCAL_API = __DEV__ && USE_LOCAL_API_IN_DEV;

/**
 * How your Android device reaches the PC backend (debug only):
 * - `usb`      — phone plugged in via USB + `adb reverse` (recommended)
 * - `wifi`     — phone on same Wi‑Fi; set LOCAL_DEV_HOST to your PC IPv4
 * - `emulator` — Android Studio emulator (10.0.2.2)
 */
export const ANDROID_CONNECTION: 'usb' | 'wifi' | 'emulator' = 'usb';

/**
 * Your PC LAN IP — only used when ANDROID_CONNECTION is `wifi`.
 * Find it: macOS `ipconfig getifaddr en0` or Windows `ipconfig` → Wi‑Fi IPv4.
 */
export const LOCAL_DEV_HOST = '172.31.2.189';

const localWifiApi = `http://${LOCAL_DEV_HOST}:${LOCAL_API_PORT}/api`;

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

export function getSocketUrl(): string {
  return getApiBaseUrl().replace(/\/api\/?$/, '');
}

/** Logged in dev to confirm which API the app uses */
export function getApiConnectionLabel(): string {
  if (!USE_LOCAL_API) return `Production · ${PRODUCTION_API}`;
  return getApiBaseUrl();
}

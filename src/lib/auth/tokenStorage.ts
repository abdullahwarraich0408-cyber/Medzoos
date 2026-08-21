import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'medzoos_access_token';
const REFRESH_TOKEN_KEY = 'medzoos_refresh_token';
const USER_KEY = 'medzoos_user';
const DEVICE_ID_KEY = 'medzoos_device_id';

/** Access token kept in memory and persisted for session recovery. */
let memoryAccessToken: string | null = null;

export type StoredUser = {
  id?: string;
  accountId?: string;
  firebaseUid?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  role?: string;
  membershipStatus?: string;
  isVerified?: boolean;
};

export type AuthTokens = {
  accessToken?: string;
  refreshToken?: string;
};

export function getMemoryAccessToken(): string | null {
  return memoryAccessToken;
}

export function setMemoryAccessToken(token: string | null) {
  memoryAccessToken = token;
}

export async function getAccessToken(): Promise<string | null> {
  if (memoryAccessToken) return memoryAccessToken;
  try {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      memoryAccessToken = token;
    }
    return token;
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function getStoredUser(): Promise<StoredUser | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export async function persistAuthSession(
  user: StoredUser | null,
  tokens?: AuthTokens | null,
) {
  if (tokens?.accessToken) {
    memoryAccessToken = tokens.accessToken;
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  }

  if (tokens?.refreshToken) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  if (user) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export async function clearAuthSession() {
  memoryAccessToken = null;
  try {
    await Promise.all([
      AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
  } catch {
    // Ignore storage clear errors
  }
}

export async function hasAuthSession(): Promise<boolean> {
  const refresh = await getRefreshToken();
  const access = await getAccessToken();
  const user = await getStoredUser();
  return Boolean(refresh || access || user);
}

export async function getDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const deviceId = `rn-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

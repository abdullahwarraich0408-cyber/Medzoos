import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../api';
import type { AuthUser, PendingAuthAction, PhoneLoginConfirmation } from '../../types/auth';
import {
  clearAuthSession,
  getRefreshToken,
  getStoredUser,
  hasAuthSession,
  persistAuthSession,
  setMemoryAccessToken,
  getMemoryAccessToken,
  getDeviceId,
  type StoredUser,
} from './tokenStorage';
import {
  consumePendingAuthAction,
  FIREBASE_ENABLED,
  getAuthPlatform,
  getPendingAuthAction,
  sendPhoneOtp,
  setPendingAuthAction,
  signInWithAppleIdToken,
  signInWithGoogleIdToken,
  verifyPhoneOtp,
} from '../firebase/auth';
import { normalizePhoneNumber } from './phoneUtils';
import {
  isDevTestOtp,
  isDevTestPhone,
  isTestAuthEnabled,
} from './firebaseErrors';

type AuthContextValue = {
  user: StoredUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingAction: PendingAuthAction | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  startPhoneLogin: (phone: string) => Promise<PhoneLoginConfirmation>;
  completePhoneLogin: (
    confirmation: PhoneLoginConfirmation,
    code: string,
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  refreshSession: () => Promise<void>;
  requireAuth: (action: PendingAuthAction) => boolean;
  setPendingAction: (action: PendingAuthAction | null) => void;
  consumePendingAction: () => PendingAuthAction | null;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(user?: AuthUser | StoredUser | null): StoredUser | null {
  if (!user) return null;
  return {
    id: user.id,
    accountId: 'accountId' in user ? user.accountId : undefined,
    firebaseUid: 'firebaseUid' in user ? user.firebaseUid : undefined,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: 'avatar' in user ? user.avatar : undefined,
    role: user.role,
    membershipStatus:
      'membershipStatus' in user ? user.membershipStatus : undefined,
    isVerified: 'isVerified' in user ? user.isVerified : undefined,
  };
}

async function exchangeFirebaseToken(idToken: string) {
  const deviceId = await getDeviceId();
  const platform = getAuthPlatform();
  return authApi.firebaseLogin({ idToken, deviceId, platform });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingActionState] = useState<PendingAuthAction | null>(
    getPendingAuthAction(),
  );

  const applySession = useCallback(async (sessionUser: StoredUser | null, tokens?: { accessToken?: string; refreshToken?: string }) => {
    await persistAuthSession(sessionUser, tokens);
    setUser(sessionUser);
    setIsAuthenticated(Boolean(sessionUser && tokens?.accessToken));
  }, []);

  const refreshSession = useCallback(async () => {
    const [storedUser, authed] = await Promise.all([
      getStoredUser(),
      hasAuthSession(),
    ]);

    if (storedUser && authed) {
      const refreshToken = await getRefreshToken();
      if (refreshToken && !storedUser.id) {
        await clearAuthSession();
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      if (refreshToken) {
        try {
          const deviceId = await getDeviceId();
          const data = await authApi.refresh({
            refreshToken,
            deviceId,
            platform: getAuthPlatform(),
          });
          const tokens = data.tokens ?? {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
          if (tokens?.accessToken) {
            setMemoryAccessToken(tokens.accessToken);
            await persistAuthSession(mapUser(data.user) ?? storedUser, tokens);
            setUser(mapUser(data.user) ?? storedUser);
            setIsAuthenticated(true);
            return;
          }
        } catch {
          await clearAuthSession();
          setUser(null);
          setIsAuthenticated(false);
          return;
        }
      }
    }

    if (!getMemoryAccessToken()) {
      if (storedUser) {
        await clearAuthSession();
      }
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    setUser(storedUser);
    setIsAuthenticated(Boolean(storedUser));
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setIsLoading(false));
  }, [refreshSession]);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      const deviceId = await getDeviceId();
      const data = await authApi.login({
        email,
        password,
        deviceId,
        platform: getAuthPlatform(),
      });
      const tokens = data.tokens ?? {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
      if (!tokens?.accessToken) {
        throw new Error('Invalid login response');
      }
      await applySession(mapUser(data.user), tokens);
    },
    [applySession],
  );

  const registerWithEmail = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      const deviceId = await getDeviceId();
      const data = await authApi.register({
        ...payload,
        deviceId,
        platform: getAuthPlatform(),
      });
      const tokens = data.tokens ?? {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
      if (!tokens?.accessToken) {
        throw new Error('Invalid registration response');
      }
      await applySession(mapUser(data.user), tokens);
    },
    [applySession],
  );

  const completeFirebaseLogin = useCallback(
    async (idToken: string) => {
      const data = await exchangeFirebaseToken(idToken);
      const tokens = {
        accessToken: data.accessToken ?? data.tokens?.accessToken,
        refreshToken: data.refreshToken ?? data.tokens?.refreshToken,
      };
      if (!tokens.accessToken) {
        throw new Error('Invalid authentication response');
      }
      await applySession(mapUser(data.user), tokens);
    },
    [applySession],
  );

  const startPhoneLogin = useCallback(async (phone: string): Promise<PhoneLoginConfirmation> => {
    const normalized = phone.replace(/[\s-]/g, '');
    const e164 = normalizePhoneNumber(normalized) || normalized;

    // Dev / no native Firebase Auth: skip SMS and use backend test OTP (123456)
    if (isTestAuthEnabled() && (isDevTestPhone(e164) || !FIREBASE_ENABLED)) {
      return {
        dev: true,
        phone: e164,
      };
    }

    const result = await sendPhoneOtp(phone);
    return { dev: false, verificationId: result.verificationId };
  }, []);

  const completePhoneLogin = useCallback(
    async (confirmation: PhoneLoginConfirmation, code: string) => {
      if (confirmation.dev) {
        if (!isDevTestOtp(code)) {
          throw new Error('Invalid OTP. Use 123456 for local phone sign-in.');
        }
        const deviceId = await getDeviceId();
        const data = await authApi.devLogin({
          phone: confirmation.phone,
          code: code.trim(),
          deviceId,
          platform: getAuthPlatform(),
        });
        const tokens = data.tokens ?? {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
        if (!tokens?.accessToken) {
          throw new Error('Invalid authentication response');
        }
        const sessionUser = mapUser(data.user);
        if (!sessionUser?.id) {
          throw new Error('Invalid authentication response');
        }
        await applySession(sessionUser, tokens);
        return;
      }

      const idToken = await verifyPhoneOtp(confirmation.verificationId, code);
      await completeFirebaseLogin(idToken);
    },
    [applySession, completeFirebaseLogin],
  );

  const loginWithGoogle = useCallback(async () => {
    const idToken = await signInWithGoogleIdToken();
    await completeFirebaseLogin(idToken);
  }, [completeFirebaseLogin]);

  const loginWithApple = useCallback(async () => {
    const idToken = await signInWithAppleIdToken();
    await completeFirebaseLogin(idToken);
  }, [completeFirebaseLogin]);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await getRefreshToken();
      await authApi.logout(refreshToken ? { refreshToken } : undefined);
    } catch {
      // Clear local session regardless.
    }
    await clearAuthSession();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const logoutAllDevices = useCallback(async () => {
    try {
      await authApi.logoutAll();
    } catch {
      // best effort
    }
    await clearAuthSession();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const requireAuth = useCallback(
    (action: PendingAuthAction) => {
      if (isAuthenticated) return true;
      setPendingAuthAction(action);
      setPendingActionState(action);
      return false;
    },
    [isAuthenticated],
  );

  const setPendingAction = useCallback((action: PendingAuthAction | null) => {
    setPendingAuthAction(action);
    setPendingActionState(action);
  }, []);

  const consumePendingAction = useCallback(() => {
    const action = consumePendingAuthAction();
    setPendingActionState(null);
    return action;
  }, []);

  const updateProfile = useCallback(async (data: Partial<AuthUser>) => {
    const response = await authApi.updateProfile(data);
    const updated = mapUser(response.user);
    if (updated) {
      const refreshToken = await getRefreshToken();
      await persistAuthSession(updated, refreshToken ? { refreshToken } : undefined);
      setUser(updated);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      pendingAction,
      loginWithEmail,
      registerWithEmail,
      startPhoneLogin,
      completePhoneLogin,
      loginWithGoogle,
      loginWithApple,
      logout,
      logoutAllDevices,
      refreshSession,
      requireAuth,
      setPendingAction,
      consumePendingAction,
      updateProfile,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      pendingAction,
      loginWithEmail,
      registerWithEmail,
      startPhoneLogin,
      completePhoneLogin,
      loginWithGoogle,
      loginWithApple,
      logout,
      logoutAllDevices,
      refreshSession,
      requireAuth,
      setPendingAction,
      consumePendingAction,
      updateProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

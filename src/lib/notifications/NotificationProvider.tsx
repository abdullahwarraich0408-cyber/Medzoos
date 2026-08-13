import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '../auth/AuthContext';
import { getDeviceId } from '../auth/tokenStorage';
import { getAuthPlatform } from '../firebase/auth';
import { notificationsApi } from '../api';
import type { AppNotification } from './types';
import {
  loadStoredNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './storage';
import {
  getFcmToken,
  getInitialNotification,
  sendLocalTestNotification,
  subscribeToForegroundMessages,
  subscribeToNotificationOpened,
  subscribeToTokenRefresh,
} from './notificationService';

type NotificationContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  fcmToken: string | null;
  permissionGranted: boolean;
  isReady: boolean;
  refreshNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  registerPushToken: () => Promise<string | null>;
  sendTestNotification: () => Promise<AppNotification>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

async function syncTokenWithBackend(token: string) {
  const deviceId = await getDeviceId();
  await notificationsApi.registerDeviceToken({
    fcmToken: token,
    deviceId,
    platform: getAuthPlatform(),
  });
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const refreshNotifications = useCallback(async () => {
    const stored = await loadStoredNotifications();
    setNotifications(stored);
  }, []);

  const registerPushToken = useCallback(async () => {
    const token = await getFcmToken();
    setFcmToken(token);
    setPermissionGranted(Boolean(token));

    if (token && isAuthenticated) {
      try {
        await syncTokenWithBackend(token);
      } catch {
        // Token sync is retried on refresh/login.
      }
    }

    return token;
  }, [isAuthenticated]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await refreshNotifications();
      const token = await registerPushToken();
      if (!mounted) return;

      setPermissionGranted(Boolean(token));
      setIsReady(true);

      const initial = await getInitialNotification();
      if (initial && mounted) {
        setNotifications(prev => {
          const exists = prev.some(item => item.id === initial.id);
          if (exists) return prev;
          return [initial, ...prev];
        });
      }
    })();

    const unsubscribeForeground = subscribeToForegroundMessages(notification => {
      setNotifications(prev => {
        const exists = prev.some(item => item.id === notification.id);
        if (exists) return prev;
        return [notification, ...prev];
      });
    });

    const unsubscribeOpen = subscribeToNotificationOpened(notification => {
      setNotifications(prev =>
        prev.map(item =>
          item.id === notification.id ? { ...item, read: true } : item,
        ),
      );
    });

    const unsubscribeToken = subscribeToTokenRefresh(async token => {
      setFcmToken(token);
      if (isAuthenticated) {
        try {
          await syncTokenWithBackend(token);
        } catch {
          // best effort
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribeForeground();
      unsubscribeOpen();
      unsubscribeToken();
    };
  }, [isAuthenticated, refreshNotifications, registerPushToken]);

  useEffect(() => {
    if (!isAuthenticated || !fcmToken) return;

    syncTokenWithBackend(fcmToken).catch(() => {
      // best effort
    });
  }, [isAuthenticated, fcmToken]);

  const markRead = useCallback(async (id: string) => {
    const next = await markNotificationRead(id);
    setNotifications(next);
  }, []);

  const markAllRead = useCallback(async () => {
    const next = await markAllNotificationsRead();
    setNotifications(next);
  }, []);

  const sendTestNotification = useCallback(async () => {
    const token = fcmToken || (await registerPushToken());
    if (!token) {
      throw new Error(
        'Notification permission is required. Enable notifications in settings first.',
      );
    }

    const notification = await sendLocalTestNotification();
    setNotifications(prev => {
      const exists = prev.some(item => item.id === notification.id);
      if (exists) return prev;
      return [notification, ...prev];
    });

    try {
      await notificationsApi.sendTest();
    } catch {
      // Local notification already shown; backend push is optional.
    }

    return notification;
  }, [fcmToken, registerPushToken]);

  const unreadCount = useMemo(
    () => notifications.filter(item => !item.read).length,
    [notifications],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      fcmToken,
      permissionGranted,
      isReady,
      refreshNotifications,
      markRead,
      markAllRead,
      registerPushToken,
      sendTestNotification,
    }),
    [
      notifications,
      unreadCount,
      fcmToken,
      permissionGranted,
      isReady,
      refreshNotifications,
      markRead,
      markAllRead,
      registerPushToken,
      sendTestNotification,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

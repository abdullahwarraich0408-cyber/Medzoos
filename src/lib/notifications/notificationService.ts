import { Platform, PermissionsAndroid } from 'react-native';
import messaging, {
  type FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import type { AppNotification } from './types';
import { appendStoredNotification } from './storage';

export const NOTIFICATION_CHANNEL_ID = 'medcare_default';

let channelReady = false;

export async function ensureNotificationChannel() {
  if (channelReady || Platform.OS !== 'android') return;

  await notifee.createChannel({
    id: NOTIFICATION_CHANNEL_ID,
    name: 'MedCare Alerts',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
  channelReady = true;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
      return false;
    }
  }

  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

export async function getFcmToken(): Promise<string | null> {
  try {
    const enabled = await requestNotificationPermission();
    if (!enabled) return null;

    await ensureNotificationChannel();
    const token = await messaging().getToken();
    return token || null;
  } catch {
    return null;
  }
}

function mapRemoteMessage(
  message: FirebaseMessagingTypes.RemoteMessage,
): AppNotification {
  const data = message.data || {};
  const title =
    message.notification?.title ||
    (typeof data.title === 'string' ? data.title : 'MedCare');
  const body =
    message.notification?.body ||
    (typeof data.body === 'string' ? data.body : 'You have a new update.');

  return {
    id:
      message.messageId ||
      (typeof data.id === 'string' ? data.id : `${Date.now()}`),
    title,
    message: body,
    time: new Date().toISOString(),
    read: false,
    type: typeof data.type === 'string' ? data.type : undefined,
    data: Object.fromEntries(
      Object.entries(data).filter(([, value]) => typeof value === 'string'),
    ) as Record<string, string>,
  };
}

export async function displayLocalNotification(
  notification: AppNotification,
) {
  await ensureNotificationChannel();

  await notifee.displayNotification({
    id: notification.id,
    title: notification.title,
    body: notification.message,
    data: notification.data,
    android: {
      channelId: NOTIFICATION_CHANNEL_ID,
      smallIcon: 'ic_launcher',
      pressAction: { id: 'default' },
    },
  });
}

export async function sendLocalTestNotification(): Promise<AppNotification> {
  const notification: AppNotification = {
    id: `local-test-${Date.now()}`,
    title: 'MedCare test notification',
    message: 'Push notifications are working. You will get order and appointment alerts here.',
    time: new Date().toISOString(),
    read: false,
    type: 'test',
    data: { type: 'test' },
  };

  await appendStoredNotification(notification);
  await displayLocalNotification(notification);
  return notification;
}

export async function handleIncomingMessage(
  message: FirebaseMessagingTypes.RemoteMessage,
  options: { showBanner?: boolean } = {},
): Promise<AppNotification> {
  const notification = mapRemoteMessage(message);
  await appendStoredNotification(notification);

  if (options.showBanner !== false) {
    await displayLocalNotification(notification);
  }

  return notification;
}

export function subscribeToForegroundMessages(
  onNotification: (notification: AppNotification) => void,
) {
  return messaging().onMessage(async remoteMessage => {
    const notification = await handleIncomingMessage(remoteMessage);
    onNotification(notification);
  });
}

export function subscribeToTokenRefresh(onToken: (token: string) => void) {
  return messaging().onTokenRefresh(onToken);
}

export async function getInitialNotification(): Promise<AppNotification | null> {
  const message = await messaging().getInitialNotification();
  if (!message) return null;
  return handleIncomingMessage(message, { showBanner: false });
}

export function subscribeToNotificationOpened(
  onOpen: (notification: AppNotification) => void,
) {
  return messaging().onNotificationOpenedApp(async remoteMessage => {
    const notification = await handleIncomingMessage(remoteMessage, {
      showBanner: false,
    });
    onNotificationRead(notification.id);
    onOpen(notification);
  });
}

export async function onNotificationRead(id: string) {
  const { markNotificationRead } = await import('./storage');
  return markNotificationRead(id);
}

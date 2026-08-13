import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppNotification } from './types';

const NOTIFICATIONS_KEY = 'medcare_notifications';
const MAX_STORED = 50;

export async function loadStoredNotifications(): Promise<AppNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AppNotification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveStoredNotifications(
  notifications: AppNotification[],
): Promise<void> {
  await AsyncStorage.setItem(
    NOTIFICATIONS_KEY,
    JSON.stringify(notifications.slice(0, MAX_STORED)),
  );
}

export async function appendStoredNotification(
  notification: AppNotification,
): Promise<AppNotification[]> {
  const existing = await loadStoredNotifications();
  const next = [notification, ...existing.filter(n => n.id !== notification.id)].slice(
    0,
    MAX_STORED,
  );
  await saveStoredNotifications(next);
  return next;
}

export async function markNotificationRead(id: string): Promise<AppNotification[]> {
  const existing = await loadStoredNotifications();
  const next = existing.map(item =>
    item.id === id ? { ...item, read: true } : item,
  );
  await saveStoredNotifications(next);
  return next;
}

export async function markAllNotificationsRead(): Promise<AppNotification[]> {
  const existing = await loadStoredNotifications();
  const next = existing.map(item => ({ ...item, read: true }));
  await saveStoredNotifications(next);
  return next;
}

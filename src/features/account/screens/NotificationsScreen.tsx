import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import {
  useProfileData,
  useUpdateProfileData,
} from '../../../lib/hooks/useApi';
import {
  NOTIFICATION_PREF_LABELS,
  type ProfileData,
} from '../../../lib/profile/profileData';
import {
  NotificationPrefToggle,
  NotificationItemCard,
} from '../components/NotificationPrefToggle';
import { useNotifications } from '../../../lib/notifications';
import { colors, spacing, TAB_BAR_CLEARANCE } from '../../../theme';

function formatNotificationTime(time?: string) {
  if (!time) return undefined;
  const parsed = new Date(time);
  if (Number.isNaN(parsed.getTime())) return time;
  return parsed.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function NotificationsContent() {
  const insets = useSafeAreaInsets();
  const { data: profileData, isLoading } = useProfileData();
  const updateProfileData = useUpdateProfileData();
  const {
    notifications: pushNotifications,
    permissionGranted,
    registerPushToken,
    markRead,
    refreshNotifications,
    sendTestNotification,
  } = useNotifications();
  const [localPrefs, setLocalPrefs] = useState(profileData.notificationPrefs);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    setLocalPrefs(profileData.notificationPrefs);
  }, [profileData.notificationPrefs]);

  const prefs = localPrefs || profileData.notificationPrefs;

  const recent = useMemo(() => {
    const profileItems = (profileData.recentNotifications || []).map(item => ({
      ...item,
      source: 'profile' as const,
    }));
    const pushItems = pushNotifications.map(item => ({
      id: item.id,
      title: item.title,
      message: item.message,
      time: item.time,
      read: item.read,
      source: 'push' as const,
    }));

    const merged = [...pushItems, ...profileItems];
    const seen = new Set<string>();
    return merged.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [profileData.recentNotifications, pushNotifications]);

  const togglePref = (key: keyof NonNullable<ProfileData['notificationPrefs']>) => {
    const next = {
      ...profileData,
      notificationPrefs: {
        ...prefs,
        [key]: !prefs?.[key],
      },
    };
    setLocalPrefs(next.notificationPrefs);
    updateProfileData.mutate(next);
  };

  const handleEnablePush = async () => {
    setRegistering(true);
    try {
      const token = await registerPushToken();
      await refreshNotifications();
      if (!token) {
        Alert.alert(
          'Notifications disabled',
          'Allow notifications in your device settings to receive order and appointment alerts.',
        );
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleTestPush = async () => {
    try {
      if (!permissionGranted) {
        await handleEnablePush();
      }
      await sendTestNotification();
      await refreshNotifications();
      Alert.alert('Test sent', 'Check your notification tray and the Recent list below.');
    } catch (error) {
      Alert.alert(
        'Test failed',
        error instanceof Error ? error.message : 'Could not send test notification.',
      );
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) },
      ]}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.subtitle}>
        Control order alerts, appointment reminders, offers, and health tips.
      </Text>

      {!permissionGranted ? (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Push notifications are off</Text>
          <Text style={styles.bannerText}>
            Enable alerts for order updates, appointments, and health reminders.
          </Text>
          <Pressable
            style={styles.bannerBtn}
            onPress={handleEnablePush}
            disabled={registering}>
            <Text style={styles.bannerBtnText}>
              {registering ? 'Enabling…' : 'Enable notifications'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <Pressable style={styles.testBtn} onPress={handleTestPush}>
        <Text style={styles.testBtnText}>Send test notification</Text>
      </Pressable>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.brandPrimary}
          style={styles.loader}
        />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {NOTIFICATION_PREF_LABELS.map(pref => (
            <NotificationPrefToggle
              key={pref.id}
              label={pref.label}
              description={pref.desc}
              value={Boolean(prefs?.[pref.id])}
              onToggle={() => togglePref(pref.id)}
            />
          ))}

          {recent.length > 0 ? (
            <>
              <Text style={[styles.sectionTitle, styles.sectionGap]}>
                Recent
              </Text>
              {recent.map(item => (
                <NotificationItemCard
                  key={item.id}
                  title={item.title}
                  message={item.message}
                  time={formatNotificationTime(item.time)}
                  read={item.read}
                  onPress={() => {
                    if (item.source === 'push' && !item.read) {
                      markRead(item.id);
                    }
                  }}
                />
              ))}
            </>
          ) : (
            <Text style={styles.emptyText}>No notifications yet.</Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

export function NotificationsScreen() {
  return (
    <ScreenLayout headerMode="stack" title="Notifications" showSearch={false}>
      <RequireAuthGate
        title="Sign in for notifications"
        subtitle="Manage notification preferences after signing in."
        icon="bell-outline">
        <NotificationsContent />
      </RequireAuthGate>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg },
  subtitle: {
    fontSize: 14,
    color: colors.neutral500,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  banner: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.brandLight,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  bannerText: {
    fontSize: 13,
    color: colors.neutral600,
    lineHeight: 18,
  },
  bannerBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    backgroundColor: colors.brandPrimary,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  bannerBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  testBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
  },
  testBtnText: {
    color: colors.brandPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: spacing.md,
  },
  sectionGap: { marginTop: spacing.lg },
  loader: { marginVertical: spacing.xxxl },
  emptyText: {
    marginTop: spacing.lg,
    fontSize: 14,
    color: colors.neutral500,
  },
});

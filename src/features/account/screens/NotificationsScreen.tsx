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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
import { notificationsBrand } from '../accountScreenBrands';
import { spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';

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

  const unreadCount = recent.filter(item => !item.read).length;

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
        { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) + spacing.lg },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Icon name="bell-ring-outline" size={22} color={notificationsBrand.accent} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.pageTitle}>Alerts inbox</Text>
          <Text style={styles.subtitle}>
            Orders, visits, offers, and health tips.
          </Text>
        </View>
        {unreadCount > 0 ? (
          <View style={styles.unreadPill}>
            <Text style={styles.unreadPillText}>{unreadCount} new</Text>
          </View>
        ) : null}
      </View>

      {!permissionGranted ? (
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Icon name="bell-off-outline" size={20} color={notificationsBrand.warning} />
          </View>
          <View style={styles.bannerBody}>
            <Text style={styles.bannerTitle}>Push is off</Text>
            <Text style={styles.bannerText}>
              Enable alerts for order updates, appointments, and reminders.
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
        </View>
      ) : (
        <Pressable style={styles.testBtn} onPress={handleTestPush}>
          <Icon name="send-outline" size={16} color={notificationsBrand.accent} />
          <Text style={styles.testBtnText}>Send test notification</Text>
        </Pressable>
      )}

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={notificationsBrand.accent}
          style={styles.loader}
        />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.prefs}>
            {NOTIFICATION_PREF_LABELS.map(pref => (
              <NotificationPrefToggle
                key={pref.id}
                label={pref.label}
                description={pref.desc}
                value={Boolean(prefs?.[pref.id])}
                onToggle={() => togglePref(pref.id)}
              />
            ))}
          </View>

          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recent</Text>
            {recent.length > 0 ? (
              <Text style={styles.sectionMeta}>{recent.length}</Text>
            ) : null}
          </View>

          {recent.length > 0 ? (
            <View style={styles.list}>
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
            </View>
          ) : (
            <View style={styles.emptyRecent}>
              <Icon name="bell-outline" size={22} color={notificationsBrand.muted} />
              <Text style={styles.emptyText}>
                No notifications yet. You’ll see order and visit updates here.
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

export function NotificationsScreen() {
  return (
    <ScreenLayout
      headerMode="stack"
      title="Notifications"
      showSearch={false}
      backgroundColor={notificationsBrand.page}>
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: notificationsBrand.card,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: notificationsBrand.border,
    padding: spacing.md,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: notificationsBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1, minWidth: 0, gap: 2 },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: notificationsBrand.ink,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: notificationsBrand.muted,
  },
  unreadPill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: notificationsBrand.accent,
  },
  unreadPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: notificationsBrand.onAccent,
  },
  banner: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: notificationsBrand.warningSoft,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: notificationsBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerBody: { flex: 1, gap: spacing.sm },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: notificationsBrand.ink,
  },
  bannerText: {
    fontSize: 13,
    color: notificationsBrand.muted,
    lineHeight: 18,
  },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: notificationsBrand.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  bannerBtnText: {
    color: notificationsBrand.onAccent,
    fontWeight: '700',
    fontSize: 13,
  },
  testBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: notificationsBrand.accent,
    backgroundColor: notificationsBrand.card,
  },
  testBtnText: {
    color: notificationsBrand.accent,
    fontWeight: '700',
    fontSize: 13,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: notificationsBrand.ink,
  },
  sectionMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: notificationsBrand.muted,
    backgroundColor: notificationsBrand.soft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  prefs: { gap: spacing.sm },
  list: { gap: spacing.sm },
  loader: { marginVertical: spacing.xxxl },
  emptyRecent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: notificationsBrand.soft,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  emptyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: notificationsBrand.muted,
  },
});

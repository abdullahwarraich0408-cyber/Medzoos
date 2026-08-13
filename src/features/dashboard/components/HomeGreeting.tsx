import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../../../theme';

type HomeGreetingProps = {
  firstName: string;
  fullName?: string;
  avatarUrl?: string | null;
  unreadCount?: number;
  onProfilePress?: () => void;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
};

/** Home-only greeting (no global top bar on this tab). */
export function HomeGreeting({
  firstName,
  fullName,
  avatarUrl,
  unreadCount = 0,
  onProfilePress,
  onMenuPress,
  onNotificationsPress,
}: HomeGreetingProps) {
  const displayName = fullName?.trim() || firstName;

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.identity}
        onPress={onProfilePress}
        accessibilityRole="button"
        accessibilityLabel="Open profile">
        <View style={styles.avatarRing}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {(firstName || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.copy}>
          <Text style={styles.hello}>Hello</Text>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}!
          </Text>
        </View>
      </Pressable>

      <View style={styles.actions}>
        {onNotificationsPress ? (
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            onPress={onNotificationsPress}
            accessibilityLabel="Notifications"
            hitSlop={8}>
            <Icon name="bell-outline" size={22} color={colors.primary900} />
            {unreadCount > 0 ? <View style={styles.notifDot} /> : null}
          </Pressable>
        ) : null}
        {onMenuPress ? (
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            onPress={onMenuPress}
            accessibilityLabel="Open menu"
            hitSlop={8}>
            <Icon name="menu" size={22} color={colors.primary900} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 2,
    backgroundColor: colors.primary100,
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  avatarFallback: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary800,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  hello: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary800,
    letterSpacing: -0.3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
    backgroundColor: colors.primary100,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
});

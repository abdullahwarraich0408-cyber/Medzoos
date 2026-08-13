import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';


type NotificationPrefToggleProps = {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
};

export function NotificationPrefToggle({
  label,
  description,
  value,
  onToggle,
}: NotificationPrefToggleProps) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.neutral300, true: colors.brandPrimary }}
        thumbColor={colors.white}
      />
    </View>
  );
}

type NotificationItemCardProps = {
  title: string;
  message: string;
  time?: string;
  read?: boolean;
  onPress?: () => void;
};

export function NotificationItemCard({
  title,
  message,
  time,
  read,
  onPress,
}: NotificationItemCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, !read && styles.cardUnread]}
      activeOpacity={0.85}
      onPress={onPress}>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardMessage}>{message}</Text>
      </View>
      {time ? <Text style={styles.time}>{time}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  text: { flex: 1 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.inkHeadline,
  },
  desc: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 2,
    lineHeight: 17,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  cardUnread: {
    borderColor: colors.brandLight,
    backgroundColor: `${colors.brandPrimary}08`,
  },
  cardBody: { flex: 1 },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  cardMessage: {
    fontSize: 13,
    color: colors.neutral600,
    marginTop: 4,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    color: colors.neutral500,
  },
});
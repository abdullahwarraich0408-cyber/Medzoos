import React from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { notificationsBrand } from '../accountScreenBrands';
import { spacing, radius } from '../../../theme';

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
        trackColor={{
          false: notificationsBrand.mist,
          true: notificationsBrand.accent,
        }}
        thumbColor={notificationsBrand.card}
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
      <View style={[styles.dot, !read && styles.dotUnread]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {title}
          </Text>
          {time ? <Text style={styles.time}>{time}</Text> : null}
        </View>
        <Text style={styles.cardMessage} numberOfLines={2}>
          {message}
        </Text>
      </View>
      {!read ? (
        <Icon name="circle-medium" size={18} color={notificationsBrand.accent} />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: notificationsBrand.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: notificationsBrand.border,
    padding: spacing.md,
  },
  text: { flex: 1 },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: notificationsBrand.ink,
  },
  desc: {
    fontSize: 12,
    color: notificationsBrand.muted,
    marginTop: 2,
    lineHeight: 17,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: notificationsBrand.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: notificationsBrand.border,
    padding: spacing.md,
  },
  cardUnread: {
    backgroundColor: notificationsBrand.soft,
    borderColor: notificationsBrand.mist,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    backgroundColor: notificationsBrand.mist,
  },
  dotUnread: {
    backgroundColor: notificationsBrand.accent,
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: notificationsBrand.ink,
  },
  cardMessage: {
    fontSize: 13,
    color: notificationsBrand.muted,
    marginTop: 4,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    fontWeight: '600',
    color: notificationsBrand.muted,
  },
});

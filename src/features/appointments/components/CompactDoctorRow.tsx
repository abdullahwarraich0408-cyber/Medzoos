import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { AppointmentCardModel } from './AppointmentCard';
import { specialtyVisual } from '../../home/data/homeData';
import { colors, spacing, radius, shadows } from '../../../theme';

type CompactDoctorRowProps = {
  item: AppointmentCardModel;
  onPress: () => void;
  onCalendarPress: () => void;
  onChatPress: () => void;
};

export function CompactDoctorRow({
  item,
  onPress,
  onCalendarPress,
  onChatPress,
}: CompactDoctorRowProps) {
  const visual = specialtyVisual(item.specialty);
  const whenLabel = item.slot
    ? `$150 Today, ${item.slot}`
    : '$150 Today, 2:00 PM';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}>
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.doctorName}
        </Text>
        <View style={styles.specRow}>
          <Icon name={visual.icon} size={12} color={colors.iconPrimary} />
          <Text style={styles.spec} numberOfLines={1}>
            {item.specialty}
          </Text>
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {whenLabel}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={onCalendarPress} hitSlop={6}>
          <Icon name="calendar-month" size={16} color={colors.iconWhite} />
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={onChatPress} hitSlop={6}>
          <Icon name="message-outline" size={16} color={colors.iconWhite} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.cardSoft,
  },
  pressed: { opacity: 0.96 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary100,
  },
  info: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spec: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary600,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary700,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

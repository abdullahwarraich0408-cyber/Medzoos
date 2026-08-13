import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { UnifiedOrder } from '../../../lib/mappers/order';
import { specialtyVisual } from '../../home/data/homeData';
import { colors, spacing, radius, shadows } from '../../../theme';

export type AppointmentCardModel = {
  id: string;
  sourceId: string;
  doctorName: string;
  specialty: string;
  rating: number;
  reviews: number;
  callType: string;
  image: string;
  tasksDone: number;
  tasksTotal: number;
  slot?: string;
};

type AppointmentCardProps = {
  item: AppointmentCardModel;
  onPress: () => void;
  onCalendarPress: () => void;
  onChatPress: () => void;
};

export function mapOrderToAppointmentCard(
  order: UnifiedOrder,
): AppointmentCardModel {
  const done = order.tracking.filter(t => t.done).length;
  const total = Math.max(order.tracking.length, 3);
  return {
    id: order.id,
    sourceId: order.sourceId,
    doctorName: order.vendor.startsWith('Dr')
      ? order.vendor
      : `Dr. ${order.vendor}`,
    specialty: order.specialty || 'General Physician',
    rating: 4.9,
    reviews: 1120,
    callType: order.isOnline ? 'Video via flex call' : 'In-clinic visit',
    image:
      order.items[0]?.img ||
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    tasksDone: Math.min(done, total),
    tasksTotal: total,
    slot: order.slot,
  };
}

export function AppointmentCard({
  item,
  onPress,
  onCalendarPress,
  onChatPress,
}: AppointmentCardProps) {
  const visual = specialtyVisual(item.specialty);
  const progress = item.tasksTotal
    ? item.tasksDone / item.tasksTotal
    : 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.topRow}>
        <Image source={{ uri: item.image }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.doctorName}
          </Text>
          <View style={styles.ratingRow}>
            <Icon name="star" size={14} color={colors.rating} />
            <Text style={styles.ratingText}>
              {item.rating.toFixed(1)} ({item.reviews})
            </Text>
          </View>
          <Text style={styles.callType}>{item.callType}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.actionBtn} onPress={onCalendarPress} hitSlop={6}>
            <Icon name="calendar-month" size={18} color={colors.iconWhite} />
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={onChatPress} hitSlop={6}>
            <Icon name="message-outline" size={18} color={colors.iconWhite} />
          </Pressable>
        </View>
      </View>

      <View style={styles.specRow}>
        <View style={styles.specIcon}>
          <Icon name={visual.icon} size={14} color={colors.iconPrimary} />
        </View>
        <Text style={styles.specName}>{item.specialty}</Text>
        <Text style={styles.specMeta}>Specialist • 5+ years</Text>
      </View>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Pre-visit tasks</Text>
        <Text style={styles.progressCount}>
          {item.tasksDone}/{item.tasksTotal} Done
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.cardElevated,
  },
  pressed: { opacity: 0.96 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary100,
  },
  info: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary500,
  },
  callType: {
    fontSize: 12,
    color: colors.textMuted,
  },
  actions: {
    gap: spacing.sm,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary100,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  specIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary600,
  },
  specMeta: {
    fontSize: 12,
    color: colors.textMuted,
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary700,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary100,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary700,
  },
});

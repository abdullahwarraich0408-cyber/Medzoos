import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { UnifiedOrder } from '../../../lib/mappers/order';
import { specialtyVisual } from '../../home/data/homeData';
import { appointmentsBrand } from '../appointmentsBrand';
import { spacing, radius } from '../../../theme';

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
  const isVideo = item.callType.toLowerCase().includes('video');

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
            <Icon name="star" size={13} color={appointmentsBrand.gold} />
            <Text style={styles.ratingText}>
              {item.rating.toFixed(1)} · {item.reviews} reviews
            </Text>
          </View>
          {item.slot ? (
            <View style={styles.slotRow}>
              <Icon name="clock-outline" size={13} color={appointmentsBrand.accent} />
              <Text style={styles.slotText}>{item.slot}</Text>
            </View>
          ) : (
            <Text style={styles.callType}>{item.callType}</Text>
          )}
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.actionBtn} onPress={onCalendarPress} hitSlop={6}>
            <Icon name="calendar-month" size={17} color={appointmentsBrand.onAccent} />
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnSoft]}
            onPress={onChatPress}
            hitSlop={6}>
            <Icon name="message-outline" size={17} color={appointmentsBrand.accent} />
          </Pressable>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.visitPill}>
          <Icon
            name={isVideo ? 'video-outline' : 'hospital-building'}
            size={13}
            color={appointmentsBrand.accent}
          />
          <Text style={styles.visitPillText}>
            {isVideo ? 'Video visit' : 'In-clinic'}
          </Text>
        </View>
        <View style={styles.specChip}>
          <Icon name={visual.icon} size={12} color={appointmentsBrand.accentSoft} />
          <Text style={styles.specName} numberOfLines={1}>
            {item.specialty}
          </Text>
        </View>
      </View>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Pre-visit tasks</Text>
        <Text style={styles.progressCount}>
          {item.tasksDone}/{item.tasksTotal}
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
    backgroundColor: appointmentsBrand.card,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: appointmentsBrand.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pressed: { backgroundColor: appointmentsBrand.soft },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: appointmentsBrand.soft,
  },
  info: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: appointmentsBrand.ink,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: appointmentsBrand.muted,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotText: {
    fontSize: 12,
    fontWeight: '600',
    color: appointmentsBrand.accent,
  },
  callType: {
    fontSize: 12,
    color: appointmentsBrand.muted,
  },
  actions: {
    gap: spacing.sm,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: appointmentsBrand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnSoft: {
    backgroundColor: appointmentsBrand.soft,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  visitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: appointmentsBrand.soft,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm + 2,
  },
  visitPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: appointmentsBrand.accent,
  },
  specChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: appointmentsBrand.chip,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm + 2,
  },
  specName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: appointmentsBrand.ink,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: appointmentsBrand.ink,
  },
  progressCount: {
    fontSize: 12,
    fontWeight: '700',
    color: appointmentsBrand.accent,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: appointmentsBrand.soft,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: appointmentsBrand.accent,
  },
});

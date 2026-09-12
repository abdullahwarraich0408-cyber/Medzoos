import React, { useMemo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { UnifiedOrder } from '../../../lib/mappers/order';
import type { LabBooking } from '../../../lib/mappers/labTest';
import { colors, spacing, radius, shadows } from '../../../theme';
import { homeBrand } from '../homeBrand';

type ScheduleItem = {
  id: string;
  title: string;
  subtitle: string;
  when: string;
  image?: string;
  icon: string;
  onPress: () => void;
};

type HomeCheckupScheduleProps = {
  doctorOrders: UnifiedOrder[];
  labBookings: LabBooking[];
  onSeeAll: () => void;
  onItemPress: (item: ScheduleItem) => void;
  onBookDoctor?: () => void;
  onBookLab?: () => void;
};

function formatWhen(dateStr?: string, slot?: string) {
  if (!dateStr && !slot) return 'Upcoming';
  const date = dateStr ? new Date(dateStr) : null;
  const dateLabel =
    date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      : null;
  if (dateLabel && slot) return `${dateLabel} • ${slot}`;
  return dateLabel || slot || 'Upcoming';
}

export function HomeCheckupSchedule({
  doctorOrders,
  labBookings,
  onSeeAll,
  onItemPress,
  onBookDoctor,
  onBookLab,
}: HomeCheckupScheduleProps) {
  const items = useMemo((): ScheduleItem[] => {
    const fromDoctors: ScheduleItem[] = doctorOrders
      .filter(o => o.status === 'pending' || o.status === 'processing')
      .slice(0, 3)
      .map(order => ({
        id: order.id,
        title: order.vendor || order.items?.[0]?.name || 'Doctor visit',
        subtitle:
          order.consultationMode === 'online'
            ? 'Online consultation'
            : 'Clinic visit',
        when: formatWhen(order.date, order.slot),
        image: order.items?.[0]?.img,
        icon: 'calendar-month',
        onPress: () => {},
      }));

    const fromLabs: ScheduleItem[] = labBookings.slice(0, 3).map(booking => ({
      id: booking.id,
      title: booking.testName || 'Lab test',
      subtitle: booking.lab || 'Home collection',
      when: formatWhen(booking.collectionDate, booking.timeSlot),
      icon: 'calendar-month',
      onPress: () => {},
    }));

    return [...fromDoctors, ...fromLabs].slice(0, 3);
  }, [doctorOrders, labBookings]);

  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>My Checkup Schedule</Text>
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {items.map(item => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() => onItemPress(item)}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.avatar} />
            ) : (
              <View style={styles.iconWrap}>
                <Icon name={item.icon} size={22} color={homeBrand.main} />
              </View>
            )}
            <View style={styles.body}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.itemSub} numberOfLines={1}>
                {item.subtitle}
              </Text>
              <Text style={styles.when}>{item.when}</Text>
            </View>
            <View style={styles.chevron}>
              <Icon name="chevron-right" size={20} color={homeBrand.muted} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: homeBrand.main,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: homeBrand.main,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: homeBrand.border,
    padding: spacing.md,
    ...shadows.cardSoft,
  },
  pressed: {
    opacity: 0.94,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: homeBrand.soft,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: homeBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: homeBrand.main,
  },
  itemSub: {
    fontSize: 12,
    color: homeBrand.muted,
  },
  when: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
    color: homeBrand.muted,
  },
  chevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: homeBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

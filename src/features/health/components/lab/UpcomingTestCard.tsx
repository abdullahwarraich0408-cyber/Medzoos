import { colors, spacing, radius } from '../../../../theme';
import { healthOs } from '../../../../theme/healthOs';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { LabBooking } from '../../../../lib/mappers/labTest';


type UpcomingTestCardProps = {
  booking: LabBooking;
};

function formatSchedule(date?: string, slot?: string) {
  if (!date) return slot || 'Scheduled';
  const parsed = new Date(date);
  const dayLabel = Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
  return slot ? `${dayLabel} · ${slot}` : dayLabel;
}

function getStatusLabel(status?: string) {
  if (status === 'collector_assigned') return 'Collector assigned';
  if (status === 'sample_collected') return 'Sample collected';
  if (status === 'confirmed') return 'Confirmed';
  if (status === 'testing') return 'Testing in lab';
  return 'Upcoming';
}

export function UpcomingTestCard({ booking }: UpcomingTestCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Icon name="calendar-clock" size={22} color={colors.brandPrimary} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {booking.testName || 'Lab Test'}
        </Text>
        <Text style={styles.schedule}>
          {formatSchedule(booking.collectionDate, booking.timeSlot)}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.lab}>{booking.lab || 'Partner Lab'}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getStatusLabel(booking.status)}</Text>
          </View>
        </View>
        {booking.collectionType === 'home' || !booking.collectionType ? (
          <View style={styles.homeRow}>
            <Icon name="home-outline" size={14} color={colors.statusSuccess} />
            <Text style={styles.homeText}>Home sample collection</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  schedule: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  lab: {
    flex: 1,
    fontSize: 12,
    color: colors.neutral500,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.brandLight,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brandPrimary,
  },
  homeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  homeText: {
    fontSize: 12,
    color: colors.statusSuccess,
    fontWeight: '600',
  },
});
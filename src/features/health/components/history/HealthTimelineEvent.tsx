import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { UnifiedOrder } from '../../../../lib/mappers/order';
import { colors, spacing, radius } from '../../../../theme';

type HealthTimelineEventProps = {
  event: UnifiedOrder;
};

const TYPE_CONFIG: Record<
  string,
  { icon: string; color: string; verb: string }
> = {
  lab: { icon: 'flask', color: '#059669', verb: 'Completed' },
  doctor: { icon: 'stethoscope', color: '#2563EB', verb: 'Booked' },
  medicines: { icon: 'pill', color: colors.brandPrimary, verb: 'Ordered' },
  prescription: {
    icon: 'file-document-outline',
    color: '#7C3AED',
    verb: 'Requested',
  },
};

function getEventLabel(event: UnifiedOrder) {
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.lab;
  if (event.type === 'lab' && event.status === 'delivered') {
    return `Completed ${event.testName || 'lab test'}`;
  }
  if (event.type === 'doctor') {
    return event.isOnline
      ? `Booked ${event.vendor} (Video)`
      : `Hospital appointment — ${event.vendor}`;
  }
  if (event.type === 'medicines') return 'Ordered medicines';
  if (event.type === 'prescription') return 'Prescription request';
  if (event.reportUrl && event.type === 'lab') return 'Downloaded report';
  return `${config.verb} ${event.title}`;
}

export function HealthTimelineEvent({ event }: HealthTimelineEventProps) {
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.lab;

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: `${config.color}20` }]}>
        <Icon name={config.icon} size={14} color={config.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>{getEventLabel(event)}</Text>
        <Text style={styles.meta}>
          {event.vendor} · {event.date}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  body: { flex: 1 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.inkHeadline,
    lineHeight: 20,
  },
  meta: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 2,
  },
});

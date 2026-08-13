import { colors, spacing, radius } from '../../../../theme';
import { healthOs } from '../../../../theme/healthOs';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { UnifiedOrder } from '../../../../lib/mappers/order';
import { HealthTimelineEvent } from './HealthTimelineEvent';


type HealthTimelineMonthProps = {
  month: string;
  events: UnifiedOrder[];
};

export function HealthTimelineMonth({ month, events }: HealthTimelineMonthProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.month}>{month}</Text>
      <View style={styles.card}>
        {events.map((event, index) => (
          <View key={event.id}>
            <HealthTimelineEvent event={event} />
            {index < events.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: spacing.lg },
  month: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.inkHeadline,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginVertical: spacing.xs,
  },
});
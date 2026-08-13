import { colors, spacing, radius } from '../../../../theme';
import { healthOs } from '../../../../theme/healthOs';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { formatVaultDate } from '../../lib/familyVaultConstants';

type VitalReading = {
  id: string;
  vital_type: string;
  value: string;
  unit?: string;
  recorded_at: string;
};

type VitalsTrendSectionProps = {
  vitals: VitalReading[];
};

function parseNumeric(value: string): number | null {
  const match = value.match(/[\d.]+/);
  if (!match) return null;
  const n = parseFloat(match[0]);
  return Number.isNaN(n) ? null : n;
}

function trendLabel(readings: VitalReading[]): string {
  if (readings.length < 2) return 'Add more readings to see trends';
  const latest = parseNumeric(readings[0].value);
  const previous = parseNumeric(readings[1].value);
  if (latest == null || previous == null) return 'Trend available after numeric readings';
  const diff = latest - previous;
  if (Math.abs(diff) < 0.01) return 'Stable compared to last reading';
  return diff > 0 ? 'Up from last reading' : 'Down from last reading';
}

function trendIcon(readings: VitalReading[]): string {
  if (readings.length < 2) return 'chart-timeline-variant';
  const latest = parseNumeric(readings[0].value);
  const previous = parseNumeric(readings[1].value);
  if (latest == null || previous == null) return 'chart-timeline-variant';
  const diff = latest - previous;
  if (Math.abs(diff) < 0.01) return 'minus';
  return diff > 0 ? 'trending-up' : 'trending-down';
}

export function VitalsTrendSection({ vitals }: VitalsTrendSectionProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, VitalReading[]>();
    vitals.forEach(v => {
      const list = map.get(v.vital_type) || [];
      list.push(v);
      map.set(v.vital_type, list);
    });
    map.forEach((list, key) => {
      list.sort(
        (a, b) =>
          new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
      );
      map.set(key, list);
    });
    return Array.from(map.entries());
  }, [vitals]);

  if (grouped.length === 0) {
    return (
      <View style={styles.empty}>
        <Icon name="heart-pulse" size={32} color={colors.neutral300} />
        <Text style={styles.emptyText}>No vitals recorded yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {grouped.map(([type, readings]) => (
        <View key={type} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.typeLabel}>{type.replace(/_/g, ' ')}</Text>
            <View style={styles.trendBadge}>
              <Icon name={trendIcon(readings)} size={14} color={colors.brandPrimary} />
              <Text style={styles.trendText}>{trendLabel(readings)}</Text>
            </View>
          </View>
          {readings.slice(0, 5).map(r => (
            <View key={r.id} style={styles.row}>
              <Text style={styles.value}>
                {r.value}
                {r.unit ? ` ${r.unit}` : ''}
              </Text>
              <Text style={styles.date}>{formatVaultDate(r.recorded_at)}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  empty: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: { fontSize: 14, color: colors.neutral500 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.md,
  },
  cardHeader: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.inkHeadline,
    textTransform: 'capitalize',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: { fontSize: 12, color: colors.brandPrimary, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral100,
  },
  value: { fontSize: 14, fontWeight: '600', color: colors.ink900 },
  date: { fontSize: 12, color: colors.neutral500 },
});
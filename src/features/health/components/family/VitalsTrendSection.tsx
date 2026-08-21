import { colors, spacing, radius } from '../../../../theme';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  if (readings.length < 2) return 'Need more readings';
  const latest = parseNumeric(readings[0].value);
  const previous = parseNumeric(readings[1].value);
  if (latest == null || previous == null) return 'Latest reading';
  const diff = latest - previous;
  if (Math.abs(diff) < 0.01) return 'Stable';
  return diff > 0 ? 'Up' : 'Down';
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
      <Text style={styles.empty}>No vitals recorded yet.</Text>
    );
  }

  return (
    <View style={styles.wrap}>
      {grouped.map(([type, readings]) => (
        <View key={type} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.typeLabel}>{type.replace(/_/g, ' ')}</Text>
            <Text style={styles.trendText}>{trendLabel(readings)}</Text>
          </View>
          {readings.slice(0, 4).map(r => (
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
  wrap: { gap: spacing.sm },
  empty: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary700,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

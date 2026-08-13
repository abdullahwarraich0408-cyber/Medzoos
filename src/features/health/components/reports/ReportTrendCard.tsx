import { colors, spacing, radius } from '../../../../theme';
import { healthOs } from '../../../../theme/healthOs';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { ReportTrend } from '../../data/healthData';


type ReportTrendCardProps = {
  trend: ReportTrend;
};

export function ReportTrendCard({ trend }: ReportTrendCardProps) {
  const values = trend.points.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{trend.testName} Trend</Text>
        {trend.improving ? (
          <View style={styles.improving}>
            <Icon name="trending-down" size={14} color={colors.statusSuccess} />
            <Text style={styles.improvingText}>Improving</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.chart}>
        {trend.points.map((point, index) => {
          const heightPct = ((point.value - min) / range) * 60 + 20;
          const isLast = index === trend.points.length - 1;
          return (
            <View key={point.label} style={styles.barCol}>
              <Text style={[styles.value, isLast && styles.valueHighlight]}>
                {point.value}
                {point.unit}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${heightPct}%` },
                    isLast && styles.barFillHighlight,
                  ]}
                />
              </View>
              <Text style={styles.label}>{point.label}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.hint}>
        Compare past reports to track progress over time.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  improving: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.statusSuccessBg,
  },
  improvingText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.statusSuccess,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    marginBottom: spacing.md,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  value: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral500,
    marginBottom: 4,
  },
  valueHighlight: {
    color: colors.brandPrimary,
    fontWeight: '800',
  },
  barTrack: {
    width: 28,
    height: 72,
    backgroundColor: colors.neutral100,
    borderRadius: radius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.neutral300,
    borderRadius: radius.sm,
  },
  barFillHighlight: {
    backgroundColor: colors.brandPrimary,
  },
  label: {
    fontSize: 11,
    color: colors.neutral500,
    marginTop: 6,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: colors.neutral500,
    lineHeight: 18,
  },
});
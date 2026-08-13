import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type ReportsSummaryCardProps = {
  totalReports: number;
  latestReportName: string;
  lastUpdated: string;
};

export function ReportsSummaryCard({
  totalReports,
  latestReportName,
  lastUpdated,
}: ReportsSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.stat}>
        <Text style={styles.statLabel}>Total reports</Text>
        <Text style={styles.statValue}>{totalReports}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.stat}>
        <Text style={styles.statLabel}>Latest report</Text>
        <Text style={styles.statValueCompact} numberOfLines={1}>
          {latestReportName}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.stat}>
        <Text style={styles.statLabel}>Last updated</Text>
        <Text style={styles.statValueCompact}>{lastUpdated}</Text>
      </View>
      <View style={styles.trendHint}>
        <Icon name="chart-timeline-variant" size={14} color={colors.brandPrimary} />
        <Text style={styles.trendText}>Track trends · Compare previous results</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.08)',
    ...shadows.cardElevated,
    marginBottom: spacing.lg,
  },
  stat: { gap: 4 },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral500,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.brandPrimary,
  },
  statValueCompact: {
    ...healthOsTypography.messageTitle,
    fontSize: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral200,
  },
  trendHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brandMist,
    padding: spacing.sm,
    borderRadius: radius.lg,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
});

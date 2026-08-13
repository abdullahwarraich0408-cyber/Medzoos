import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, shadows } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type HealthSummaryStripProps = {
  activeMedicines: number;
  newReports: number;
  nextVisit: string;
};

export function HealthSummaryStrip({
  activeMedicines,
  newReports,
  nextVisit,
}: HealthSummaryStripProps) {
  const stats = [
    {
      label: 'Medicines',
      value: `${activeMedicines} active`,
    },
    {
      label: 'Reports',
      value: newReports === 1 ? '1 new' : `${newReports} new`,
    },
    {
      label: 'Next visit',
      value: nextVisit,
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Summary</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          {stats.map(stat => (
            <View key={stat.label} style={styles.stat}>
              <Text style={styles.label}>{stat.label}</Text>
              <Text style={styles.value} numberOfLines={1}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  sectionTitle: {
    ...healthOsTypography.sectionTitle,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.1)',
    ...shadows.cardElevated,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral500,
    textAlign: 'center',
  },
  value: {
    ...healthOsTypography.messageTitle,
    fontSize: 14,
    textAlign: 'center',
  },
});

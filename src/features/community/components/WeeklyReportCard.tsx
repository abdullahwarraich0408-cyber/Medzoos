import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SimpleMessage } from '../../../design-system';
import { colors, spacing, radius } from '../../../theme';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';
import type { WeeklyReport } from '../../../lib/community/types';

type WeeklyReportCardProps = {
  report: WeeklyReport;
};

export function WeeklyReportCard({ report }: WeeklyReportCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.week}>{report.weekLabel}</Text>
      <Text style={styles.headline}>
        Health score {report.healthScoreChange >= 0 ? '+' : ''}
        {report.healthScoreChange} this week
      </Text>

      <View style={styles.stats}>
        <Stat icon="pill" label="Medicine" value={`${report.medicineAdherence}%`} />
        <Stat icon="walk" label="Steps" value={report.stepsTotal.toLocaleString()} />
        <Stat icon="cup-water" label="Water" value={`${report.waterGlasses} glasses`} />
        <Stat icon="sleep" label="Sleep" value={report.sleepAverage} />
      </View>

      <SimpleMessage message={report.streakSummary} tone="default" />
      <SimpleMessage
        label="AI recommendation"
        message={report.aiRecommendation}
        tone="info"
      />
    </View>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Icon name={icon} size={18} color={healthOs.communityViolet} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceBase,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
    gap: spacing.md,
  },
  week: healthOsTypography.messageCaption,
  headline: { ...healthOsTypography.messageTitle, fontSize: 18 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: {
    width: '47%',
    backgroundColor: healthOs.communitySurface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 15, fontWeight: '700', color: colors.ink900 },
  statLabel: { fontSize: 11, color: colors.neutral500 },
});

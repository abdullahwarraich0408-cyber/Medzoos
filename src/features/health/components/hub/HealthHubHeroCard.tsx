import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows, appIcons, appIconTile } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type HealthHubHeroCardProps = {
  healthScore: number;
  activePrescriptions: number;
  reportsReady: number;
  familyCount: number;
  upcomingVisit: string;
};

export function HealthHubHeroCard({
  healthScore,
  activePrescriptions,
  reportsReady,
  familyCount,
  upcomingVisit,
}: HealthHubHeroCardProps) {
  const stats = [
    {
      icon: 'heart-pulse',
      label: 'Health score',
      value: String(healthScore),
    },
    {
      icon: 'pill',
      label: 'Prescriptions',
      value: String(activePrescriptions),
    },
    {
      icon: 'file-chart-outline',
      label: 'New reports',
      value: String(reportsReady),
    },
    {
      icon: 'account-group-outline',
      label: 'Family',
      value: String(familyCount),
    },
    {
      icon: 'calendar-clock',
      label: 'Next visit',
      value: upcomingVisit,
      compact: true,
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.cardTitle}>Health Overview</Text>
          <Text style={styles.cardSubtitle}>Your personal health snapshot</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreValue}>{healthScore}</Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {stats.slice(1).map(stat => (
          <View key={stat.label} style={styles.stat}>
            <View style={styles.iconWrap}>
              <Icon name={stat.icon} size={appIcons.size.sm} color={appIcons.color} />
            </View>
            <Text style={[styles.statValue, stat.compact && styles.statValueCompact]} numberOfLines={1}>
              {stat.value}
            </Text>
            <Text style={styles.statLabel} numberOfLines={1}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.1)',
    ...shadows.cardElevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...healthOsTypography.sectionTitle,
    fontSize: 17,
  },
  cardSubtitle: {
    ...healthOsTypography.messageCaption,
    fontSize: 12,
    marginTop: 2,
  },
  scoreBadge: {
    alignItems: 'center',
    backgroundColor: colors.brandLight,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 64,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.brandPrimary,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.brandDark,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stat: {
    width: '31%',
    flexGrow: 1,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  iconWrap: {
    ...appIconTile('sm'),
    width: 32,
    height: 32,
    borderRadius: radius.md,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink900,
    textAlign: 'center',
  },
  statValueCompact: {
    fontSize: 11,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.neutral500,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
});

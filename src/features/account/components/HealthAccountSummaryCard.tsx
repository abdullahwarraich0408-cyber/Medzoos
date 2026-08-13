import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, cardStyles, appIcons, appIconTile } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

type HealthAccountSummaryCardProps = {
  medicinesDue?: number;
  reportsReady?: number;
  upcomingVisit?: string;
};

export function HealthAccountSummaryCard({
  medicinesDue = 2,
  reportsReady = 1,
  upcomingVisit = 'Tomorrow',
}: HealthAccountSummaryCardProps) {
  const stats = [
    {
      icon: 'pill',
      label: 'Medicines due today',
      value: String(medicinesDue),
    },
    {
      icon: 'file-document-outline',
      label: 'Reports ready',
      value: String(reportsReady),
    },
    {
      icon: 'calendar-clock',
      label: 'Upcoming visit',
      value: upcomingVisit,
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Account</Text>
        <View style={styles.liveDot} />
      </View>
      <View style={styles.statsPanel}>
        {stats.map((stat, index) => (
          <React.Fragment key={stat.label}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.stat}>
              <View style={styles.iconWrap}>
                <Icon name={stat.icon} size={appIcons.size.sm} color={appIcons.color} />
              </View>
              <Text style={styles.statValue} numberOfLines={1}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel} numberOfLines={2}>
                {stat.label}
              </Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyles.premium,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...healthOsTypography.sectionTitle,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.statusSuccess,
  },
  statsPanel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.neutral200,
    marginHorizontal: spacing.xs,
  },
  iconWrap: {
    ...appIconTile('sm'),
    width: 34,
    height: 34,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink900,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.neutral500,
    textAlign: 'center',
    lineHeight: 13,
  },
});

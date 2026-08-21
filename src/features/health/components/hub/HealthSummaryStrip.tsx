import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius } from '../../../../theme';

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
      icon: 'pill' as const,
      label: 'Medicines',
      value: String(activeMedicines),
      hint: 'active',
    },
    {
      icon: 'file-chart-outline' as const,
      label: 'Reports',
      value: String(newReports),
      hint: 'ready',
    },
    {
      icon: 'calendar-clock' as const,
      label: 'Next visit',
      value: nextVisit,
      hint: '',
      isText: true,
    },
  ];

  return (
    <View style={styles.card}>
      {stats.map((stat, index) => (
        <React.Fragment key={stat.label}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <View style={styles.stat}>
            <View style={styles.iconWrap}>
              <Icon name={stat.icon} size={16} color={colors.primary700} />
            </View>
            <Text style={styles.label}>{stat.label}</Text>
            <Text
              style={[styles.value, stat.isText && styles.valueText]}
              numberOfLines={1}>
              {stat.value}
            </Text>
            {stat.hint ? <Text style={styles.hint}>{stat.hint}</Text> : null}
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.xs,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary900,
    letterSpacing: -0.3,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
  },
  hint: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textMuted,
  },
});

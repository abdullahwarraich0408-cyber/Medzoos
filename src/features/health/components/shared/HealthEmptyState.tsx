import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type HealthEmptyStateProps = {
  icon: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function HealthEmptyState({
  icon,
  title,
  subtitle,
  action,
}: HealthEmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={36} color={colors.brandPrimary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.08)',
    padding: spacing.xxxl,
    alignItems: 'center',
    ...shadows.cardElevated,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...healthOsTypography.sectionTitle,
    fontSize: 16,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    ...healthOsTypography.sectionHint,
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 21,
  },
});

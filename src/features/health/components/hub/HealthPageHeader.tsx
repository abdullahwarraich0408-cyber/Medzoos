import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { healthOsTypography } from '../../../../theme/healthOs';
import { colors, spacing } from '../../../../theme';

type HealthPageHeaderProps = {
  title?: string;
  subtitle?: string;
};

export function HealthPageHeader({ title, subtitle }: HealthPageHeaderProps) {
  if (!title && !subtitle) return null;

  return (
    <View style={styles.wrap}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  title: {
    ...healthOsTypography.greeting,
    fontSize: 24,
    color: colors.ink900,
  },
  subtitle: {
    ...healthOsTypography.sectionHint,
    fontSize: 14,
    lineHeight: 21,
  },
});

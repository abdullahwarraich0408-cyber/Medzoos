import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type HealthPageHeaderProps = {
  title?: string;
  subtitle?: string;
  /** Used with variant="hero" */
  firstName?: string;
  healthScore?: number;
  variant?: 'simple' | 'hero';
};

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HealthPageHeader({
  title,
  subtitle,
  firstName,
  healthScore = 85,
  variant = 'simple',
}: HealthPageHeaderProps) {
  if (variant === 'hero') {
    const name = firstName?.trim() || 'there';
    return (
      <View style={styles.hero}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>{timeGreeting()}</Text>
          <Text style={styles.heroTitle} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.heroSubtitle}>
            {subtitle || 'Medicines, reports, and records in one place'}
          </Text>
        </View>

        <View style={styles.scoreWell}>
          <View style={styles.scoreRing}>
            <Text style={styles.scoreValue}>{healthScore}</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!title && !subtitle) return null;

  return (
    <View style={styles.simple}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  simple: { gap: spacing.xs },
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
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.primary100,
    borderRadius: radius.xxl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(23, 97, 142, 0.12)',
    overflow: 'hidden',
  },
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary700,
    letterSpacing: 0.2,
  },
  heroTitle: {
    ...healthOsTypography.greeting,
    fontSize: 28,
    letterSpacing: -0.4,
    color: colors.primary900,
  },
  heroSubtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 19,
    color: colors.primary600,
  },
  scoreWell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.primary300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary800,
    letterSpacing: -0.5,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: -1,
  },
});

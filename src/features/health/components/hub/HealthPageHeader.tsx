import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';
import { healthBrand } from '../../healthBrand';
import { TabScreenHeroHeader } from '../../../../components/navigation/TabScreenHeroHeader';

type HealthPageHeaderProps = {
  title?: string;
  subtitle?: string;
  firstName?: string;
  healthScore?: number;
  /**
   * - simple: in-page title (Community / Copilot)
   * - vault: Health-tab creative hero (light, not Home-like)
   * - hero: legacy score card
   */
  variant?: 'simple' | 'vault' | 'brand' | 'hero';
  onBackPress?: () => void;
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
  onBackPress,
}: HealthPageHeaderProps) {
  // "brand" kept as alias → vault (older Health home calls)
  if (variant === 'vault' || variant === 'brand') {
    const displayName = (firstName?.trim() || '').split(/\s+/)[0];
    const headline = displayName || 'there';

    return (
      <TabScreenHeroHeader
        screenTitle="Health vault"
        pageBackground={healthBrand.page}
        cardBackground={healthBrand.accent}
        onBackPress={onBackPress}
        cardStyle={styles.cardInner}>
        <View pointerEvents="none" style={styles.blobA} />
        <View pointerEvents="none" style={styles.blobB} />

        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>{timeGreeting()}</Text>
            <Text style={styles.heroName} numberOfLines={1}>
              {title || headline}
            </Text>
            <Text style={styles.heroSub} numberOfLines={2}>
              {subtitle ||
                'Your records, medicines, and care history — kept calm and clear.'}
            </Text>
          </View>

          <View style={styles.scoreOrb}>
            <View style={styles.scoreTrack}>
              <View style={styles.scoreFill} />
              <View style={styles.scoreInner}>
                <Text style={styles.scoreValue}>{healthScore}</Text>
                <Text style={styles.scoreLabel}>well</Text>
              </View>
            </View>
          </View>
        </View>
      </TabScreenHeroHeader>
    );
  }

  if (variant === 'hero') {
    const name = firstName?.trim() || 'there';
    return (
      <View style={styles.heroLegacy}>
        <View style={styles.copy}>
          <Text style={styles.eyebrowLegacy}>{timeGreeting()}</Text>
          <Text style={styles.heroTitle} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.heroSubtitle}>
            {subtitle || 'Medicines, reports, and records in one place'}
          </Text>
        </View>
        <View style={styles.scoreWell}>
          <View style={styles.scoreRing}>
            <Text style={styles.scoreValueLegacy}>{healthScore}</Text>
            <Text style={styles.scoreLabelLegacy}>Score</Text>
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
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blobA: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(23, 107, 125, 0.4)',
    top: -40,
    right: -20,
  },
  blobB: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.1)',
    bottom: -18,
    left: 28,
  },
  heroRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    zIndex: 1,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.72)',
    letterSpacing: 0.3,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '800',
    color: healthBrand.onAccent,
    letterSpacing: -0.4,
  },
  heroSub: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.82)',
  },
  scoreOrb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreTrack: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreFill: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: 'rgba(255,255,255,0.55)',
    borderRightColor: 'rgba(255,255,255,0.55)',
    transform: [{ rotate: '-20deg' }],
  },
  scoreInner: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '800',
    color: healthBrand.onAccent,
    letterSpacing: -0.6,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: -2,
  },

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

  heroLegacy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: healthBrand.soft,
    borderRadius: 24,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  copy: { flex: 1, gap: 4, minWidth: 0 },
  eyebrowLegacy: {
    fontSize: 13,
    fontWeight: '600',
    color: healthBrand.accent,
  },
  heroTitle: {
    ...healthOsTypography.greeting,
    fontSize: 28,
    color: healthBrand.ink,
  },
  heroSubtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 19,
    color: healthBrand.muted,
  },
  scoreWell: { alignItems: 'center', justifyContent: 'center' },
  scoreRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: healthBrand.card,
    borderWidth: 3,
    borderColor: healthBrand.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValueLegacy: {
    fontSize: 22,
    fontWeight: '800',
    color: healthBrand.accent,
  },
  scoreLabelLegacy: {
    fontSize: 10,
    fontWeight: '700',
    color: healthBrand.muted,
    textTransform: 'uppercase',
  },
});

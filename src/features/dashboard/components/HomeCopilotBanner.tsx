import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows, healthOsTypography } from '../../../theme';

type HomeCopilotBannerProps = {
  summary?: string;
  onPress: () => void;
};

export function HomeCopilotBanner({ summary, onPress }: HomeCopilotBannerProps) {
  const message =
    summary || 'You have 2 medicines due today and 1 lab report ready.';

  return (
    <Pressable
      style={({ pressed }) => [styles.banner, pressed && styles.bannerPressed]}
      onPress={onPress}>
      <View style={styles.glowOrbLarge} />
      <View style={styles.glowOrbSmall} />

      <View style={styles.content}>
        <View style={styles.left}>
          <View style={styles.iconCircle}>
            <Icon name="robot-outline" size={22} color={colors.white} />
          </View>
          <View style={styles.textBlock}>
            <View style={styles.labelRow}>
              <View style={styles.aiDot} />
              <Text style={styles.label}>AI Health Copilot</Text>
            </View>
            <Text style={styles.message} numberOfLines={2}>
              {message}
            </Text>
          </View>
        </View>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>View Briefing</Text>
          <Icon name="arrow-right" size={14} color={colors.textPrimary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
    backgroundColor: colors.brandBanner,
    ...shadows.cardElevated,
  },
  bannerPressed: { opacity: 0.96, transform: [{ scale: 0.99 }] },
  glowOrbLarge: {
    position: 'absolute',
    right: -32,
    top: -32,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  glowOrbSmall: {
    position: 'absolute',
    left: -16,
    bottom: -16,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1, gap: 4 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
  },
  message: {
    ...healthOsTypography.messageTitle,
    fontSize: 13,
    color: colors.white,
    lineHeight: 18,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

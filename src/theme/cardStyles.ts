import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing, radius, shadows } from './spacing';
import { healthOs } from './healthOs';
import { appIcons, appIconArrowChip, appIconTile } from './appIcons';

/** Shared premium card patterns for home & profile screens */
export const cardStyles = StyleSheet.create({
  premium: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.cardElevated,
  },
  premiumSoft: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  grouped: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.cardElevated,
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.cardElevated,
  },
  pale: {
    backgroundColor: colors.surfaceBlue,
    borderRadius: radius.xxl,
    borderWidth: 0,
    ...shadows.cardSoft,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral200,
    marginLeft: spacing.lg + 48 + spacing.md,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    backgroundColor: appIcons.bg,
  },
  iconTileSm: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink900,
    letterSpacing: -0.2,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
});

export function pastelTileStyle(bg: string) {
  return {
    backgroundColor: bg,
    borderRadius: radius.xxl,
    borderWidth: 0,
    ...shadows.cardSoft,
  };
}

export function iconTileStyle(_bg?: string) {
  return appIconTile('md');
}

export function arrowChipStyle(_color?: string) {
  return appIconArrowChip();
}

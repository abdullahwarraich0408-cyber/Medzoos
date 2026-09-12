import { Platform } from 'react-native';
import { spacing } from './spacing';
import { appBrand } from './appBrand';

/**
 * Shared metrics for Health / Community / You tab hero cards.
 * Same size + same shell position so tab switches feel aligned.
 */
export const tabHeroBanner = {
  /** Fixed card height — fits You (avatar + actions) and Health/Community content. */
  height: 160,
  radius: 28,
  padding: spacing.lg,
  shellGap: spacing.md,
  shellPaddingBottom: spacing.md,
  horizontalInset: spacing.lg,
  shadowColor: appBrand.main,
} as const;

export const tabHeroCardShadow = Platform.select({
  ios: {
    shadowColor: tabHeroBanner.shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
  },
  android: { elevation: 5 },
  default: {},
});

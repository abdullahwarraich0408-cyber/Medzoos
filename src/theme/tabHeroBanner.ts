import { Platform } from 'react-native';
import { spacing } from './spacing';
import { appBrand } from './appBrand';

/**
 * Shared metrics for Health / Community / You / Medzoos tab hero headers.
 * Matches Home full-bleed gradient shell spacing.
 */
export const tabHeroBanner = {
  /** Soft floor for hero copy area under the title row */
  height: 120,
  radius: 0,
  padding: spacing.lg,
  shellGap: spacing.md,
  shellPaddingBottom: spacing.lg,
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

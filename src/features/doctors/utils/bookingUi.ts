import { useMemo } from 'react';
import { useWindowDimensions, PixelRatio } from 'react-native';
import { colors } from '../../../theme';

/** Booking screen tokens — same healthcare blue as the rest of the app. */
export const bookingUi = {
  accent: colors.primary700,
  accentSoft: colors.primary100,
  gradientTop: colors.background,
  gradientMid: colors.surfaceBlue,
  gradientBottom: colors.background,
  ink: colors.primary900,
  muted: colors.textSecondary,
  card: colors.white,
  white: colors.white,
  sheet: colors.surface,
  circleBg: colors.white,
  dayIdle: colors.white,
} as const;

const BASE_WIDTH = 390;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function scaleFont(size: number, width: number, isTablet: boolean) {
  const scaled = size * (width / BASE_WIDTH);
  const maxMult = isTablet ? 1.18 : 1.08;
  const minMult = 0.86;
  return Math.round(
    PixelRatio.roundToNearestPixel(
      clamp(scaled, size * minMult, size * maxMult),
    ),
  );
}

export function useBookingLayout() {
  const { width, height } = useWindowDimensions();
  const isCompact = width < 360;
  const isTablet = width >= 600;
  const isWide = width >= 900;
  const isTall = height > 780;
  const pad = isTablet
    ? clamp(Math.round(width * 0.05), 24, 40)
    : clamp(Math.round(width * 0.04), 14, 20);
  const contentMaxWidth = isWide ? 720 : isTablet ? 560 : width;
  const contentWidth = Math.min(width, contentMaxWidth);
  const scale = contentWidth / BASE_WIDTH;

  return useMemo(() => {
    // Account for horizontal screen padding so photo + copy never overflow.
    const innerWidth = Math.max(contentWidth - pad * 2, 280);
    const photoW = clamp(
      innerWidth * (isCompact ? 0.32 : isTablet ? 0.28 : 0.34),
      104,
      isTablet ? 168 : 128,
    );
    const photoH = photoW * 1.2;
    const actionSize = clamp(Math.round(44 * scale), 40, isTablet ? 54 : 48);
    const daySize = clamp(Math.round(40 * scale), 36, isTablet ? 52 : 46);
    const dateCount = isTablet
      ? 7
      : width < 340
        ? 5
        : width < 400
          ? 6
          : 7;
    const slotCols = isCompact ? 1 : isTablet ? 3 : 2;
    const slotGap = isCompact ? 8 : isTablet ? 14 : 12;
    const statsGap = isCompact ? 10 : isTablet ? 16 : 12;

    return {
      width,
      height,
      contentWidth,
      contentMaxWidth,
      innerWidth,
      isCompact,
      isTablet,
      isWide,
      isTall,
      pad,
      photoW,
      photoH,
      actionSize,
      daySize,
      dateCount,
      slotCols,
      slotGap,
      statsGap,
      heroOverlap: 0,
      navBtn: clamp(Math.round(44 * scale), 40, isTablet ? 52 : 48),
      font: {
        specialty: scaleFont(14, contentWidth, isTablet),
        name: scaleFont(isCompact ? 24 : 28, contentWidth, isTablet),
        fee: scaleFont(isCompact ? 20 : 24, contentWidth, isTablet),
        feeUnit: scaleFont(14, contentWidth, isTablet),
        statValue: scaleFont(isCompact ? 20 : 24, contentWidth, isTablet),
        statLabel: scaleFont(12, contentWidth, isTablet),
        rating: scaleFont(14, contentWidth, isTablet),
        month: scaleFont(isCompact ? 17 : 20, contentWidth, isTablet),
        weekday: scaleFont(12, contentWidth, isTablet),
        dayNum: scaleFont(15, contentWidth, isTablet),
        availTitle: scaleFont(isCompact ? 16 : 18, contentWidth, isTablet),
        availMeta: scaleFont(13, contentWidth, isTablet),
        slot: scaleFont(14, contentWidth, isTablet),
        cta: scaleFont(16, contentWidth, isTablet),
      },
    };
  }, [
    width,
    height,
    contentWidth,
    contentMaxWidth,
    isCompact,
    isTablet,
    isWide,
    isTall,
    pad,
    scale,
  ]);
}

export type BookingLayout = ReturnType<typeof useBookingLayout>;

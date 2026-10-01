import { Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/** Clamp scale so compact phones shrink slightly and tall phones don't blow up. */
const SCALE = Math.min(Math.max(SCREEN_H / 812, 0.86), 1.05);

const logoW = Math.round(Math.min(SCREEN_W * 0.46, SCREEN_H < 740 ? 138 : 160));

export const authLayout = {
  screenW: SCREEN_W,
  screenH: SCREEN_H,
  isCompact: SCREEN_H < 740,
  scale: SCALE,
  /** Scaled pixel helper */
  s: (n: number) => Math.round(n * SCALE),
  /** Horizontal page padding */
  pagePad: Math.round(Math.min(Math.max(SCREEN_W * 0.06, 20), 28)),
  /** Logo wordmark — scales with screen; slightly larger for a fuller header */
  logoWidth: logoW,
  logoHeight: Math.round(logoW * 0.24),
} as const;

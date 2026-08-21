/**
 * MedCare design tokens — healthcare blue system
 * Prefer semantic names; legacy brand* aliases map to these for compatibility.
 */
export const colors = {
  // Primary scale
  primary900: '#082B3F',
  primary800: '#124362',
  primary700: '#17618E',
  primary600: '#415F78',
  primary500: '#5B84A0',
  primary400: '#7A99AD',
  primary300: '#99CAF3',
  primary200: '#C6E3F4',
  primary100: '#DEEEF9',

  // Surfaces
  background: '#F0F6FB',
  surface: '#FDFEFE',
  surfaceBlue: '#EBF3FA',
  border: '#DEE4E8',
  borderLight: '#E7EEF2',

  // Text
  textPrimary: '#082B3F',
  textSecondary: '#5B84A0',
  textMuted: '#7A99AD',
  textDisabled: '#97ADBD',

  // Icons
  iconPrimary: '#17618E',
  iconMuted: '#7A99AD',
  iconWhite: '#FFFFFF',

  // Accents & semantic
  accentCyan: '#0FA7E3',
  success: '#22A06B',
  successBg: '#E4F5ED',
  successText: '#176B4C',
  warning: '#E6A23C',
  warningBg: '#FFF4DD',
  error: '#D64545',
  errorBg: '#FCE8E8',
  rating: '#F2B84B',
  ratingText: '#5B84A0',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // ——— Legacy aliases (keep existing screens working) ———
  brandPrimary: '#17618E',
  brandDark: '#082B3F',
  brandDarker: '#081F29',
  brandMedium: '#124362',
  buttonStart: '#082B3F',
  buttonEnd: '#17618E',
  brandBanner: '#5B829C',
  brandLight: '#DEEEF9',
  brandMist: '#F0F6FB',
  brandHighlight: '#17618E',
  brandSoft: '#DEEEF9',
  brandPale: '#99CAF3',

  ink900: '#082B3F',
  ink800: '#124362',
  inkHeadline: '#082B3F',

  surfaceBase: '#FDFEFE',
  surfaceSubtle: '#F0F6FB',
  surfaceRaised: '#FDFEFE',
  surfaceOverlay: '#EBF3FA',

  appBgStart: '#F0F6FB',
  appBgEnd: '#F0F6FB',

  neutral100: '#F0F6FB',
  neutral200: '#DEE4E8',
  neutral300: '#C6E3F4',
  neutral400: '#97ADBD',
  neutral500: '#7A99AD',
  neutral600: '#5B84A0',
  neutral700: '#415F78',
  neutral800: '#124362',
  neutral900: '#082B3F',

  statusSuccess: '#22A06B',
  statusSuccessBg: '#E4F5ED',
  statusSuccessText: '#176B4C',
  statusWarning: '#E6A23C',
  statusWarningBg: '#FFF4DD',
  statusWarningText: '#E6A23C',
  statusDanger: '#D64545',
  statusDangerBg: '#FCE8E8',
  statusInfo: '#17618E',
  statusInfoBg: '#DEEEF9',

  accentGold: '#F2B84B',
  accentPromo: '#0FA7E3',
  accentSoftPurple: '#C6E3F4',
} as const;

export type ColorName = keyof typeof colors;

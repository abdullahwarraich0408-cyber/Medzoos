/**
 * Home-screen brand — primary teal (#105568).
 * Page wash matches app-wide `appBrand.page`.
 */
export const homeBrand = {
  /** Main brand color for Home */
  main: '#105568',
  /** Header uses the same main brand */
  header: '#105568',
  /** Soft tint for washes / icon wells */
  soft: '#E4F0F3',
  /** Mid surface blue */
  mist: '#C5DCE2',
  /** Secondary text on home */
  muted: '#5B7A85',
  /** Borders */
  border: 'rgba(16, 85, 104, 0.14)',
  /** White on brand */
  onMain: '#FFFFFF',
  /** Base screen wash — app-wide white */
  page: '#FFFFFF',
  /** Banner depth variants around main */
  bannerDeep: '#0C4554',
  bannerMid: '#105568',
  bannerSoft: '#176B7D',
} as const;

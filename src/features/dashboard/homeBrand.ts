/**
 * Home-screen brand — DoctorApp / auth teal system.
 * Keep in sync with `authUi` and `appBrand` gradients.
 */
export const homeBrand = {
  /** Primary teal (DoctorApp) */
  main: '#006D72',
  /** Header fill / fallback under gradient */
  header: '#006D72',
  /** Soft tint for washes / icon wells */
  soft: '#EAF8F8',
  /** Mid surface mint */
  mist: '#DDF6F2',
  /** Secondary text on home */
  muted: '#56657A',
  /** Borders */
  border: 'rgba(0, 109, 114, 0.14)',
  /** White on brand */
  onMain: '#FFFFFF',
  /** Base screen wash */
  page: '#FFFFFF',
  /**
   * Bright hero banner washes — same DoctorApp teal family as the header,
   * lifted so each slide reads vivid (not deep/dark).
   */
  bannerDeep: '#00A3A8',
  bannerMid: '#00B9BF',
  bannerSoft: '#1FC8CE',
  bannerAqua: '#14BDB4',
  /** DoctorApp header gradient stops */
  gradientStart: '#00A3A8',
  gradientMid: '#006D72',
  gradientEnd: '#003E42',
} as const;

/** Four bright teal fills for hero carousel slides */
export const homeBannerPalette = [
  homeBrand.bannerDeep,
  homeBrand.bannerMid,
  homeBrand.bannerSoft,
  homeBrand.bannerAqua,
] as const;

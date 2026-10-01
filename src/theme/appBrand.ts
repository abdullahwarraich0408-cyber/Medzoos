/**
 * App-wide visual system — DoctorApp / Medzoos auth teal.
 * Use for headers, accents, and L→R brand washes.
 */
export const appBrand = {
  /** Primary teal (DoctorApp) */
  main: '#006D72',
  header: '#006D72',
  /** Same stops as DoctorApp GreenGradientHeader / auth headers */
  gradientStart: '#00A3A8',
  gradientMid: '#006D72',
  gradientEnd: '#003E42',
  ink: '#10233F',
  soft: '#EAF8F8',
  mist: '#DDF6F2',
  muted: '#56657A',
  border: 'rgba(0, 109, 114, 0.14)',
  onMain: '#FFFFFF',
  page: '#FFFFFF',
  card: '#FFFFFF',
} as const;

/**
 * Centered stack / tab screen name — same format as Health / Community / You
 * (e.g. HEALTH VAULT, PHARMACIES, DOCTORS).
 */
export const stackScreenTitleStyle = {
  fontSize: 13,
  fontWeight: '700' as const,
  letterSpacing: 1.2,
  textTransform: 'uppercase' as const,
  color: appBrand.muted,
  textAlign: 'center' as const,
};

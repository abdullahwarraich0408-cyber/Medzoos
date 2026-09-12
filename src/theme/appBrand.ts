/**
 * App-wide visual system — matches Home.
 * Use these for screen washes and primary accents so every surface stays consistent.
 */
export const appBrand = {
  /** Primary teal (Home header / accents) */
  main: '#105568',
  header: '#105568',
  ink: '#0C4554',
  soft: '#E4F0F3',
  mist: '#C5DCE2',
  muted: '#5B7A85',
  border: 'rgba(16, 85, 104, 0.14)',
  onMain: '#FFFFFF',
  /** Base screen wash — same as Home */
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

/**
 * Shared teal tokens for You-tab account surfaces.
 * Layout identity differs per screen; palette stays consistent with Home.
 */
export const accountTeal = {
  ink: '#0C4554',
  accent: '#105568',
  accentDeep: '#0C4554',
  accentSoft: '#176B7D',
  soft: '#E4F0F3',
  mist: '#C5DCE2',
  glaze: '#D7E8ED',
  page: '#FFFFFF',
  card: '#FFFFFF',
  muted: '#5B7A85',
  border: 'rgba(16, 85, 104, 0.14)',
  onAccent: '#FFFFFF',
  chip: '#E8F3F6',
  success: '#1F7A65',
  successSoft: '#E3F5EF',
  warning: '#B54708',
  warningSoft: '#FEF0C7',
  danger: '#B42318',
  dangerSoft: '#FEE4E2',
} as const;

/** Lab reports — “Results vault” */
export const labReportsBrand = accountTeal;

/** Addresses — “Places” */
export const addressesBrand = accountTeal;

/** Payments — “Wallet” */
export const paymentsBrand = accountTeal;

/** Notifications — “Alerts” */
export const notificationsBrand = accountTeal;

/** Privacy & security — “Vault lock” */
export const privacyBrand = accountTeal;

/** Support — “Help desk” */
export const supportBrand = accountTeal;

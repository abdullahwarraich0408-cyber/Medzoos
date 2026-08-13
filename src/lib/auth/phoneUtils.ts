/**
 * Normalize phone numbers for Firebase (E.164).
 * Pakistan: 0336... → +92336...
 */
export function normalizePhoneNumber(input: string): string {
  const raw = String(input || '').trim().replace(/[\s-]/g, '');
  if (!raw) return '';

  if (raw.startsWith('+')) {
    return raw;
  }

  if (/^0[3]\d{9}$/.test(raw)) {
    return `+92${raw.slice(1)}`;
  }

  if (/^92[3]\d{9}$/.test(raw)) {
    return `+${raw}`;
  }

  return `+${raw.replace(/^0+/, '')}`;
}

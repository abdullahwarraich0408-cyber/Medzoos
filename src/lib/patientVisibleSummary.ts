/** Patient-visible clinical summary only — never full private notes. */
export function shortPatientSummary(text?: string | null, max = 280) {
  if (!text) return '';
  const cleaned = String(text).replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trim()}…`;
}

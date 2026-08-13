export const VAULT_VIEWS = [
  { id: 'dashboard' as const, label: 'Overview', icon: 'view-dashboard-outline' },
  { id: 'calendar' as const, label: 'Calendar', icon: 'calendar-month-outline' },
  { id: 'copilot' as const, label: 'Copilot', icon: 'robot-outline' },
  { id: 'summary' as const, label: 'Summary', icon: 'chart-line' },
];

export type VaultViewId = (typeof VAULT_VIEWS)[number]['id'];

export const COPILOT_SUGGESTIONS = [
  "How is my father's diabetes?",
  'Who missed their medicine today?',
  'What vaccinations are due this month?',
  'Which family members have appointments this week?',
];

export const VITAL_TYPES = [
  { value: 'blood_pressure', label: 'Blood Pressure' },
  { value: 'sugar', label: 'Blood Sugar' },
  { value: 'weight', label: 'Weight' },
  { value: 'heart_rate', label: 'Heart Rate' },
  { value: 'spo2', label: 'Oxygen Saturation' },
];

export function formatVaultDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function scoreTone(score?: number | null): 'good' | 'warn' | 'bad' {
  if (score == null) return 'warn';
  if (score >= 80) return 'good';
  if (score >= 65) return 'warn';
  return 'bad';
}

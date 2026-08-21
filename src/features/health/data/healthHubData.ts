import type { HealthStackParamList } from '../../../navigation/types';
import { iconScheme } from '../../../theme';

export type HealthQuickAction = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  tileBg: string;
  screen: keyof Pick<
    HealthStackParamList,
    | 'LabReports'
    | 'MedicalRecords'
    | 'MedicinesList'
    | 'FamilyProfiles'
    | 'HealthHistory'
    | 'UploadMedicalDocument'
  >;
  badgeKey?: 'reports' | 'prescriptions' | 'family' | null;
  badgeFallback?: string;
};

export const HEALTH_QUICK_ACTIONS: HealthQuickAction[] = [
  {
    id: 'prescriptions',
    title: 'Prescriptions',
    subtitle: 'Issued and uploaded',
    icon: 'file-document-outline',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    tileBg: '#F0F7FF',
    screen: 'MedicinesList',
    badgeKey: 'prescriptions',
    badgeFallback: 'View Rx',
  },
  {
    id: 'medicines',
    title: 'Medicines',
    subtitle: 'Active and refills',
    icon: 'pill',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    tileBg: '#EAF4FB',
    screen: 'MedicinesList',
    badgeKey: null,
    badgeFallback: 'Manage meds',
  },
  {
    id: 'reports',
    title: 'Lab reports',
    subtitle: 'Results and trends',
    icon: 'flask-outline',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    tileBg: '#EAF4FB',
    screen: 'LabReports',
    badgeKey: 'reports',
    badgeFallback: 'View labs',
  },
  {
    id: 'consults',
    title: 'Consultations',
    subtitle: 'Visits and notes',
    icon: 'stethoscope',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    tileBg: '#E8F4FF',
    screen: 'MedicalRecords',
    badgeKey: null,
    badgeFallback: 'Your visits',
  },
  {
    id: 'documents',
    title: 'Documents',
    subtitle: 'Upload records',
    icon: 'folder-outline',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    tileBg: '#E8F4FF',
    screen: 'UploadMedicalDocument',
    badgeKey: null,
    badgeFallback: 'Add record',
  },
  {
    id: 'timeline',
    title: 'Health timeline',
    subtitle: 'Full journey',
    icon: 'timeline-clock-outline',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    tileBg: '#DEEEF9',
    screen: 'HealthHistory',
    badgeKey: null,
    badgeFallback: 'Chronology',
  },
];

export type HealthAttentionItem = {
  id: string;
  title: string;
  message: string;
  icon: string;
  screen: 'LabReports' | 'MedicinesList' | 'FamilyProfiles' | 'MedicalRecords';
};

export type HealthTodayItem = {
  id: string;
  title: string;
  actionLabel: string;
  screen: 'LabReports' | 'MedicinesList' | 'FamilyProfiles' | 'MedicalRecords';
};

export const DEFAULT_TODAY: HealthTodayItem[] = [
  {
    id: 'meds',
    title: '2 medicines due',
    actionLabel: 'Take',
    screen: 'MedicinesList',
  },
  {
    id: 'cbc',
    title: 'CBC report ready',
    actionLabel: 'View',
    screen: 'LabReports',
  },
];

export type HealthRecordLink = {
  id: string;
  title: string;
  screen: keyof Pick<
    HealthStackParamList,
    'LabReports' | 'MedicalRecords' | 'MedicinesList' | 'FamilyProfiles'
  >;
};

export const HEALTH_RECORD_LINKS: HealthRecordLink[] = [
  { id: 'reports', title: 'Reports', screen: 'LabReports' },
  { id: 'records', title: 'Medical Records', screen: 'MedicalRecords' },
  { id: 'prescriptions', title: 'Prescriptions', screen: 'MedicinesList' },
  { id: 'family', title: 'Family Vault', screen: 'FamilyProfiles' },
];

export type HealthActivityItem = {
  id: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  time: string;
};

export const DEFAULT_ACTIVITY: HealthActivityItem[] = [
  {
    id: '1',
    icon: 'flask-outline',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    title: 'Lab test completed',
    time: '2 days ago',
  },
  {
    id: '2',
    icon: 'file-upload-outline',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    title: 'Prescription uploaded',
    time: '4 days ago',
  },
  {
    id: '3',
    icon: 'pill',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    title: 'Medicine reminder marked taken',
    time: 'Today',
  },
];

export const MEDICINE_SEGMENTS = [
  { id: 'active', label: 'Active' },
  { id: 'refill', label: 'Refill' },
  { id: 'otc', label: 'OTC' },
  { id: 'supplements', label: 'Supplements' },
] as const;

export type MedicineSegmentId = (typeof MEDICINE_SEGMENTS)[number]['id'];

export type FamilyMember = {
  id?: string;
  name: string;
  relation?: string;
  age?: string;
  bloodGroup?: string;
};

export type MedicalRecord = {
  id: string;
  type: string;
  title: string;
  date: string;
  lab?: string;
  fileUrl?: string;
  source?: 'manual';
};

export type PaymentMethod = {
  id: string;
  type?: string;
  label: string;
  expiry?: string;
  isDefault?: boolean;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time?: string;
  read?: boolean;
};

export type ProfileData = {
  dob?: string;
  bloodGroup?: string;
  familyMembers?: FamilyMember[];
  medicalRecords?: MedicalRecord[];
  paymentMethods?: PaymentMethod[];
  notificationPrefs?: {
    orders?: boolean;
    appointments?: boolean;
    offers?: boolean;
    health?: boolean;
  };
  recentNotifications?: NotificationItem[];
};

export const DEFAULT_PROFILE_DATA: ProfileData = {
  dob: '',
  bloodGroup: '',
  familyMembers: [],
  medicalRecords: [],
  paymentMethods: [],
  notificationPrefs: {
    orders: true,
    appointments: true,
    offers: false,
    health: true,
  },
  recentNotifications: [],
};

export function mergeProfileData(
  profileData?: ProfileData | null,
): ProfileData {
  return {
    ...DEFAULT_PROFILE_DATA,
    ...(profileData || {}),
    familyMembers: profileData?.familyMembers || [],
    medicalRecords: profileData?.medicalRecords || [],
    notificationPrefs: {
      ...DEFAULT_PROFILE_DATA.notificationPrefs,
      ...(profileData?.notificationPrefs || {}),
    },
  };
}

export function formatDobDisplay(dob?: string) {
  if (!dob) return '—';
  const parsed = new Date(dob);
  if (Number.isNaN(parsed.getTime())) return dob;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatMemberSince(dateString?: string) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export const NOTIFICATION_PREF_LABELS = [
  { id: 'orders' as const, label: 'Order updates', desc: 'Delivery and status changes' },
  { id: 'appointments' as const, label: 'Appointment reminders', desc: 'Doctor and lab bookings' },
  { id: 'offers' as const, label: 'Offers & promotions', desc: 'Deals and discount alerts' },
  { id: 'health' as const, label: 'Health tips', desc: 'Wellness articles and reminders' },
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export type MedicineStatus =
  | 'active'
  | 'completed'
  | 'paused'
  | 'refill_due'
  | 'pending_verification';

export type MedicineSourceType =
  | 'doctor_prescribed'
  | 'uploaded_prescription'
  | 'pharmacy_order'
  | 'manual_added'
  | 'shop';

export type PrescriptionVerificationStatus =
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'needs_review';

export type MedicineHubTabId = 'my_medicines' | 'prescriptions' | 'refills' | 'shop';

export const MEDICINE_HUB_TABS: { id: MedicineHubTabId; label: string }[] = [
  { id: 'my_medicines', label: 'My Medicines' },
  { id: 'prescriptions', label: 'Prescriptions' },
  { id: 'refills', label: 'Refills' },
  { id: 'shop', label: 'Shop' },
];

export const SHOP_CATEGORIES = [
  { id: 'prescription', label: 'Prescription medicines' },
  { id: 'otc', label: 'OTC' },
  { id: 'supplements', label: 'Supplements' },
  { id: 'first_aid', label: 'First aid' },
] as const;

export type ShopCategoryId = (typeof SHOP_CATEGORIES)[number]['id'];

export type PatientMedicine = {
  medicineId: string;
  patientId?: string;
  medicineName: string;
  genericName: string;
  strength: string;
  dosage: string;
  timing: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: MedicineStatus;
  sourceType: MedicineSourceType;
  doctorId?: string;
  doctorName?: string;
  pharmacyId?: string;
  pharmacyName?: string;
  prescriptionId?: string;
  refillDueDate?: string;
  remainingDays?: number;
  price?: number;
  requiresPrescription: boolean;
  reminderEnabled: boolean;
  nextReminderTime?: string;
  productId?: string;
};

export type PatientPrescription = {
  prescriptionId: string;
  patientId?: string;
  doctorId?: string;
  doctorName?: string;
  uploadedByUser: boolean;
  title: string;
  imageUrl?: string;
  fileUrl?: string;
  date: string;
  sortDate: string;
  verificationStatus: PrescriptionVerificationStatus;
  medicineCount: number;
  linkedMedicineIds: string[];
  linkedOrderId?: string;
};

export type TodayReminder = {
  medicineId: string;
  medicineName: string;
  timingLabel: string;
  time: string;
  taken: boolean;
};

export const DEMO_PATIENT_MEDICINES: PatientMedicine[] = [
  {
    medicineId: 'med-amoxil',
    medicineName: 'Amoxil 500mg',
    genericName: 'Amoxicillin',
    strength: '500mg',
    dosage: '1 tablet',
    timing: 'Morning and night',
    frequency: 'Twice daily',
    duration: '7 days',
    instructions: 'Take after food with water.',
    status: 'active',
    sourceType: 'doctor_prescribed',
    doctorId: 'dr-babur-basir',
    doctorName: 'Dr. Babur Basir',
    prescriptionId: 'rx-babur-1',
    refillDueDate: '2026-07-18',
    remainingDays: 5,
    price: 420,
    requiresPrescription: true,
    reminderEnabled: true,
    nextReminderTime: '9:00 AM',
    pharmacyName: 'Zubair Pharmacy',
    pharmacyId: 'pharm-zubair',
    productId: '2',
  },
  {
    medicineId: 'med-arinac',
    medicineName: 'Arinac Forte',
    genericName: 'Ibuprofen',
    strength: '400mg',
    dosage: '1 tablet',
    timing: 'After meal · As needed',
    frequency: 'As needed',
    duration: 'Ongoing',
    instructions: 'Do not exceed 3 tablets per day.',
    status: 'active',
    sourceType: 'pharmacy_order',
    pharmacyName: 'City Pharmacy',
    pharmacyId: 'pharm-city',
    remainingDays: undefined,
    price: 95,
    requiresPrescription: false,
    reminderEnabled: true,
    nextReminderTime: '2:00 PM',
    productId: '7',
  },
  {
    medicineId: 'med-glucophage',
    medicineName: 'Glucophage 500mg',
    genericName: 'Metformin',
    strength: '500mg',
    dosage: '1 tablet',
    timing: 'After dinner',
    frequency: 'Once daily',
    duration: '30 days',
    instructions: 'Take with evening meal.',
    status: 'refill_due',
    sourceType: 'uploaded_prescription',
    prescriptionId: 'rx-upload-1',
    refillDueDate: '2026-07-09',
    remainingDays: 0,
    price: 320,
    requiresPrescription: true,
    reminderEnabled: false,
    pharmacyName: 'HealthPlus Pharmacy',
    pharmacyId: 'pharm-healthplus',
    productId: '5',
  },
];

export const DEMO_PRESCRIPTIONS: PatientPrescription[] = [
  {
    prescriptionId: 'rx-babur-1',
    doctorId: 'dr-babur-basir',
    doctorName: 'Dr. Babur Basir',
    uploadedByUser: false,
    title: 'Prescription from Dr. Babur Basir',
    date: 'Jul 13, 2026',
    sortDate: '2026-07-13',
    verificationStatus: 'verified',
    medicineCount: 3,
    linkedMedicineIds: ['med-amoxil'],
    fileUrl: 'https://example.com/rx-babur.pdf',
  },
  {
    prescriptionId: 'rx-upload-1',
    uploadedByUser: true,
    title: 'Latest uploaded prescription',
    date: 'Jul 9, 2026',
    sortDate: '2026-07-09',
    verificationStatus: 'verified',
    medicineCount: 2,
    linkedMedicineIds: ['med-glucophage'],
    fileUrl: 'https://example.com/rx-upload.pdf',
  },
  {
    prescriptionId: 'rx-pending-1',
    uploadedByUser: true,
    title: 'Pending prescription',
    date: 'Uploaded today',
    sortDate: '2026-07-09',
    verificationStatus: 'pending',
    medicineCount: 0,
    linkedMedicineIds: [],
  },
];

export function getRefillLabel(medicine: PatientMedicine): string {
  if (medicine.remainingDays === undefined || medicine.remainingDays > 7) {
    return 'No refill needed';
  }
  if (medicine.remainingDays === 0) return 'Refill due today';
  if (medicine.remainingDays === 1) return 'Refill in 1 day';
  return `Refill in ${medicine.remainingDays} days`;
}

export function getSourceLabel(medicine: PatientMedicine): string {
  if (medicine.doctorName) return `Prescribed by ${medicine.doctorName}`;
  if (medicine.pharmacyName) return medicine.pharmacyName;
  return 'Added manually';
}

export function getVerificationLabel(status: PrescriptionVerificationStatus): string {
  switch (status) {
    case 'verified':
      return 'Verified';
    case 'pending':
      return 'Under review';
    case 'needs_review':
      return 'Needs review';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
}

export function buildTodayReminders(
  medicines: PatientMedicine[],
  takenIds: Set<string>,
): TodayReminder[] {
  return medicines
    .filter(m => m.status === 'active' && m.reminderEnabled && m.nextReminderTime)
    .slice(0, 4)
    .map(m => ({
      medicineId: m.medicineId,
      medicineName: m.medicineName,
      timingLabel: m.timing.includes('·') ? m.timing.split('·')[0].trim() : m.timing,
      time: m.nextReminderTime!,
      taken: takenIds.has(m.medicineId),
    }));
}

export function getActiveMedicines(medicines: PatientMedicine[]): PatientMedicine[] {
  return medicines.filter(m => m.status === 'active' || m.status === 'paused');
}

export function getRefillMedicines(medicines: PatientMedicine[]): PatientMedicine[] {
  return medicines.filter(
    m =>
      m.status === 'refill_due' ||
      (m.remainingDays !== undefined && m.remainingDays <= 7),
  );
}

export function searchMedicines(medicines: PatientMedicine[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return medicines;
  return medicines.filter(
    m =>
      m.medicineName.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.doctorName?.toLowerCase().includes(q) ||
      m.pharmacyName?.toLowerCase().includes(q),
  );
}

export function searchPrescriptions(prescriptions: PatientPrescription[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return prescriptions;
  return prescriptions.filter(
    p =>
      p.title.toLowerCase().includes(q) ||
      p.doctorName?.toLowerCase().includes(q),
  );
}

export function getMedicineById(
  medicines: PatientMedicine[],
  medicineId: string,
): PatientMedicine | undefined {
  return medicines.find(m => m.medicineId === medicineId);
}

export function getPrescriptionById(
  prescriptions: PatientPrescription[],
  prescriptionId: string,
): PatientPrescription | undefined {
  return prescriptions.find(p => p.prescriptionId === prescriptionId);
}

export function getMedicinesForPrescription(
  medicines: PatientMedicine[],
  prescription: PatientPrescription,
): PatientMedicine[] {
  return medicines.filter(
    m =>
      prescription.linkedMedicineIds.includes(m.medicineId) ||
      m.prescriptionId === prescription.prescriptionId,
  );
}

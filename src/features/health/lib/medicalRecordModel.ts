import type { LabBooking } from '../../../lib/mappers/labTest';
import type { UnifiedOrder } from '../../../lib/mappers/order';
import type { MedicalRecord } from '../../../lib/profile/profileData';

export type RecordType =
  | 'doctor_visit'
  | 'prescription'
  | 'test_request'
  | 'lab_booking'
  | 'lab_report'
  | 'medical_report'
  | 'invoice'
  | 'chat'
  | 'upload';

export type SourceType = 'doctor' | 'lab' | 'pharmacy' | 'user_upload' | 'system';

export type MedicalRecordItem = {
  recordId: string;
  patientId?: string;
  recordType: RecordType;
  title: string;
  description: string;
  date: string;
  sortDate: string;
  fileUrl?: string;
  sourceType: SourceType;
  doctorId?: string;
  doctorName?: string;
  labId?: string;
  labName?: string;
  visitId?: string;
  testBookingId?: string;
  prescriptionId?: string;
  uploadedByUser?: boolean;
  status?: string;
  isUnread?: boolean;
  orderRef?: string;
  icon: string;
};

export type DoctorFolder = {
  doctorId: string;
  name: string;
  specialty: string;
  lastVisitDate: string;
  sortDate: string;
  visitCount: number;
  reportCount: number;
  prescriptionCount: number;
  testCount: number;
  chatCount: number;
  uploadCount: number;
};

export type LabFolder = {
  labId: string;
  name: string;
  subtitle: string;
  lastTestDate: string;
  sortDate: string;
  testCount: number;
  reportCount: number;
  invoiceCount: number;
  homeSampleCount: number;
  uploadCount: number;
};

export const DOCTOR_DETAIL_GROUPS = [
  { id: 'visits', title: 'Visits', types: ['doctor_visit'] as RecordType[] },
  { id: 'prescriptions', title: 'Prescriptions', types: ['prescription'] as RecordType[] },
  { id: 'tests', title: 'Tests requested', types: ['test_request'] as RecordType[] },
  { id: 'reports', title: 'Reports', types: ['lab_report', 'medical_report'] as RecordType[] },
  { id: 'uploads', title: 'Uploads', types: ['upload'] as RecordType[] },
  { id: 'chat', title: 'Chat', types: ['chat'] as RecordType[] },
] as const;

export const LAB_DETAIL_GROUPS = [
  { id: 'bookings', title: 'Test bookings', types: ['lab_booking'] as RecordType[] },
  { id: 'reports', title: 'Reports', types: ['lab_report', 'medical_report'] as RecordType[] },
  { id: 'doctor_tests', title: 'Doctor requested tests', types: ['test_request'] as RecordType[] },
  { id: 'invoices', title: 'Invoices', types: ['invoice'] as RecordType[] },
  { id: 'uploads', title: 'Uploads', types: ['upload'] as RecordType[] },
] as const;

const REPORT_TYPES: RecordType[] = ['lab_report', 'medical_report'];
const UPLOAD_TYPES: RecordType[] = ['upload'];

function formatDate(value?: string) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function sortKey(value?: string) {
  if (!value) return '';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

function recordIcon(type: RecordType): string {
  switch (type) {
    case 'doctor_visit':
      return 'stethoscope';
    case 'prescription':
      return 'pill';
    case 'test_request':
      return 'clipboard-text-outline';
    case 'lab_booking':
      return 'flask-outline';
    case 'lab_report':
    case 'medical_report':
      return 'file-chart-outline';
    case 'invoice':
      return 'receipt';
    case 'chat':
      return 'chat-outline';
    case 'upload':
      return 'cloud-upload-outline';
    default:
      return 'file-document-outline';
  }
}

export const DEMO_MEDICAL_RECORD_ITEMS: MedicalRecordItem[] = [
  {
    recordId: 'visit-babur-1',
    recordType: 'doctor_visit',
    title: 'Cardiology follow-up',
    description: 'Dr. Babur Basir · Cardiologist',
    date: 'Jul 13, 2026',
    sortDate: '2026-07-13',
    sourceType: 'doctor',
    doctorId: 'dr-babur-basir',
    doctorName: 'Dr. Babur Basir',
    visitId: 'visit-babur-1',
    icon: 'stethoscope',
  },
  {
    recordId: 'rx-babur-1',
    recordType: 'prescription',
    title: 'Prescription from Dr. Babur Basir',
    description: 'Cardiology follow-up',
    date: 'Jul 13, 2026',
    sortDate: '2026-07-13',
    sourceType: 'doctor',
    doctorId: 'dr-babur-basir',
    doctorName: 'Dr. Babur Basir',
    visitId: 'visit-babur-1',
    prescriptionId: 'rx-babur-1',
    icon: 'pill',
  },
  {
    recordId: 'test-req-babur-1',
    recordType: 'test_request',
    title: 'CBC test requested',
    description: 'Requested by Dr. Babur Basir',
    date: 'Jul 13, 2026',
    sortDate: '2026-07-13',
    sourceType: 'doctor',
    doctorId: 'dr-babur-basir',
    doctorName: 'Dr. Babur Basir',
    visitId: 'visit-babur-1',
    testBookingId: 'booking-cbc-1',
    labId: 'chughtai-lab',
    labName: 'Chughtai Lab',
    icon: 'clipboard-text-outline',
  },
  {
    recordId: 'report-cbc-1',
    recordType: 'lab_report',
    title: 'CBC Report',
    description: 'Chughtai Lab · Requested by Dr. Babur Basir',
    date: 'Jul 14, 2026',
    sortDate: '2026-07-14',
    sourceType: 'lab',
    doctorId: 'dr-babur-basir',
    doctorName: 'Dr. Babur Basir',
    labId: 'chughtai-lab',
    labName: 'Chughtai Lab',
    testBookingId: 'booking-cbc-1',
    isUnread: true,
    status: 'Ready',
    icon: 'file-chart-outline',
  },
  {
    recordId: 'upload-ecg-1',
    recordType: 'upload',
    title: 'ECG file uploaded',
    description: 'Linked to Dr. Babur Basir',
    date: 'Jul 13, 2026',
    sortDate: '2026-07-13',
    sourceType: 'user_upload',
    doctorId: 'dr-babur-basir',
    doctorName: 'Dr. Babur Basir',
    visitId: 'visit-babur-1',
    uploadedByUser: true,
    icon: 'cloud-upload-outline',
  },
  {
    recordId: 'chat-babur-1',
    recordType: 'chat',
    title: 'Chat with Dr. Babur Basir',
    description: 'Last message Jul 13, 2026',
    date: 'Jul 13, 2026',
    sortDate: '2026-07-13',
    sourceType: 'doctor',
    doctorId: 'dr-babur-basir',
    doctorName: 'Dr. Babur Basir',
    icon: 'chat-outline',
  },
  {
    recordId: 'visit-hassan-1',
    recordType: 'doctor_visit',
    title: 'Cardiology follow-up',
    description: 'Dr. Hassan Ali · Cardiologist',
    date: 'Jul 9, 2026',
    sortDate: '2026-07-09',
    sourceType: 'doctor',
    doctorId: 'dr-hassan-ali',
    doctorName: 'Dr. Hassan Ali',
    visitId: 'visit-hassan-1',
    icon: 'stethoscope',
  },
  {
    recordId: 'report-lipid-idc',
    recordType: 'lab_report',
    title: 'Lipid Profile',
    description: 'IDC Lab',
    date: 'Jul 5, 2026',
    sortDate: '2026-07-05',
    sourceType: 'lab',
    labId: 'idc-lab',
    labName: 'IDC Lab',
    icon: 'file-chart-outline',
  },
  {
    recordId: 'booking-cbc-1',
    recordType: 'lab_booking',
    title: 'Complete Blood Count CBC',
    description: 'Sample collected',
    date: 'Jul 12, 2026',
    sortDate: '2026-07-12',
    sourceType: 'lab',
    labId: 'chughtai-lab',
    labName: 'Chughtai Lab',
    testBookingId: 'booking-cbc-1',
    doctorId: 'dr-babur-basir',
    doctorName: 'Dr. Babur Basir',
    status: 'Sample collected',
    icon: 'flask-outline',
  },
  {
    recordId: 'booking-thyroid-1',
    recordType: 'lab_booking',
    title: 'Thyroid Panel',
    description: 'Home sample booked',
    date: 'Jul 10, 2026',
    sortDate: '2026-07-10',
    sourceType: 'lab',
    labId: 'chughtai-lab',
    labName: 'Chughtai Lab',
    testBookingId: 'booking-thyroid-1',
    status: 'Home sample booked',
    icon: 'flask-outline',
  },
  {
    recordId: 'report-lipid-chughtai',
    recordType: 'lab_report',
    title: 'Lipid Profile',
    description: 'Ready',
    date: 'Jul 5, 2026',
    sortDate: '2026-07-05',
    sourceType: 'lab',
    labId: 'chughtai-lab',
    labName: 'Chughtai Lab',
    status: 'Ready',
    icon: 'file-chart-outline',
  },
  {
    recordId: 'invoice-chughtai-1',
    recordType: 'invoice',
    title: 'Lab invoice',
    description: 'Paid',
    date: 'Jul 12, 2026',
    sortDate: '2026-07-12',
    sourceType: 'lab',
    labId: 'chughtai-lab',
    labName: 'Chughtai Lab',
    status: 'Paid',
    icon: 'receipt',
  },
  {
    recordId: 'upload-lab-old',
    recordType: 'upload',
    title: 'Old lab report uploaded',
    description: 'Linked to Chughtai Lab',
    date: 'Jul 1, 2026',
    sortDate: '2026-07-01',
    sourceType: 'user_upload',
    labId: 'chughtai-lab',
    labName: 'Chughtai Lab',
    uploadedByUser: true,
    icon: 'cloud-upload-outline',
  },
  {
    recordId: 'booking-idc-1',
    recordType: 'lab_booking',
    title: 'Lipid Profile',
    description: 'Sample collected',
    date: 'Jul 5, 2026',
    sortDate: '2026-07-05',
    sourceType: 'lab',
    labId: 'idc-lab',
    labName: 'IDC Lab',
    testBookingId: 'booking-idc-1',
    status: 'Sample collected',
    icon: 'flask-outline',
  },
  {
    recordId: 'upload-rx-manual',
    recordType: 'upload',
    title: 'Uploaded prescription',
    description: 'Manual upload',
    date: 'Jun 20, 2026',
    sortDate: '2026-06-20',
    sourceType: 'user_upload',
    uploadedByUser: true,
    icon: 'cloud-upload-outline',
  },
];

function fromManualRecord(record: MedicalRecord): MedicalRecordItem {
  return {
    recordId: `manual-${record.id}`,
    recordType: 'upload',
    title: record.title,
    description: record.lab || 'Manual upload',
    date: formatDate(record.date),
    sortDate: sortKey(record.date),
    fileUrl: record.fileUrl,
    sourceType: 'user_upload',
    uploadedByUser: true,
    icon: 'cloud-upload-outline',
  };
}

function fromDoctorOrder(order: UnifiedOrder): MedicalRecordItem | null {
  if (order.type !== 'doctor') return null;
  const doctorId = `dr-${order.sourceId}`;
  const doctorName = order.vendor.startsWith('Dr.')
    ? order.vendor
    : `Dr. ${order.vendor}`;
  const specialty = order.specialty || 'General';
  const visitId = `visit-${order.sourceId}-${order.sortDate}`;

  return {
    recordId: `doctor-${order.sourceId}`,
    recordType: 'doctor_visit',
    title: `${specialty} ${order.isOnline ? 'consultation' : 'follow-up'}`,
    description: `${doctorName} · ${specialty}`,
    date: order.date,
    sortDate: sortKey(order.sortDate),
    sourceType: 'doctor',
    doctorId,
    doctorName,
    visitId,
    orderRef: order.id,
    icon: 'stethoscope',
  };
}

function fromLabBooking(booking: LabBooking): MedicalRecordItem[] {
  if (!booking.id) return [];
  const labId = `lab-${(booking.lab || 'partner').toLowerCase().replace(/\s+/g, '-')}`;
  const labName = booking.lab || 'Lab Partner';
  const testName = booking.testName || 'Lab Test';
  const date = formatDate(booking.collectionDate);
  const sortDate = sortKey(booking.collectionDate);
  const hasReport = Boolean(booking.reportUrl);
  const items: MedicalRecordItem[] = [];

  items.push({
    recordId: `booking-${booking.id}`,
    recordType: 'lab_booking',
    title: testName,
    description: hasReport ? 'Completed' : 'Sample collected',
    date,
    sortDate,
    sourceType: 'lab',
    labId,
    labName,
    testBookingId: `booking-${booking.id}`,
    orderRef: `lab-${booking.id}`,
    status: hasReport ? 'Completed' : 'Sample collected',
    icon: 'flask-outline',
  });

  if (hasReport) {
    items.push({
      recordId: `report-${booking.id}`,
      recordType: 'lab_report',
      title: `${testName} Report`,
      description: labName,
      date,
      sortDate,
      fileUrl: booking.reportUrl,
      sourceType: 'lab',
      labId,
      labName,
      testBookingId: `booking-${booking.id}`,
      orderRef: `lab-${booking.id}`,
      status: 'Ready',
      icon: 'file-chart-outline',
    });
  }

  return items;
}

function fromPrescriptionOrder(order: UnifiedOrder): MedicalRecordItem | null {
  if (order.type !== 'prescription') return null;
  return {
    recordId: `rx-${order.sourceId}`,
    recordType: 'prescription',
    title: 'Prescription order',
    description: order.vendor || 'Pharmacy',
    date: order.date,
    sortDate: sortKey(order.sortDate),
    fileUrl: order.fileUrl,
    sourceType: 'pharmacy',
    prescriptionId: `rx-${order.sourceId}`,
    orderRef: order.id,
    icon: 'pill',
  };
}

export function buildMedicalRecordItems(input: {
  manualRecords?: MedicalRecord[];
  labReports?: LabBooking[];
  orders?: UnifiedOrder[];
}): MedicalRecordItem[] {
  const seen = new Set<string>();
  const merged: MedicalRecordItem[] = [];

  const push = (item: MedicalRecordItem | null) => {
    if (!item || seen.has(item.recordId)) return;
    seen.add(item.recordId);
    merged.push(item);
  };

  const pushMany = (items: MedicalRecordItem[]) => {
    items.forEach(push);
  };

  (input.manualRecords || []).forEach(r => push(fromManualRecord(r)));
  (input.labReports || []).forEach(b => pushMany(fromLabBooking(b)));
  (input.orders || []).forEach(o => {
    push(fromDoctorOrder(o));
    push(fromPrescriptionOrder(o));
  });

  const sorted = merged.sort(
    (a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime(),
  );

  return sorted.length > 0 ? sorted : DEMO_MEDICAL_RECORD_ITEMS;
}

export function searchMedicalRecords(
  records: MedicalRecordItem[],
  query: string,
): MedicalRecordItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return records;
  return records.filter(
    r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.doctorName?.toLowerCase().includes(q) ||
      r.labName?.toLowerCase().includes(q),
  );
}

export function buildDoctorFolders(records: MedicalRecordItem[]): DoctorFolder[] {
  const map = new Map<string, DoctorFolder & { records: MedicalRecordItem[] }>();

  records.forEach(record => {
    if (!record.doctorId || !record.doctorName) return;

    const existing = map.get(record.doctorId);
    const specialty =
      record.description.split('·')[1]?.trim() ||
      existing?.specialty ||
      'Specialist';

    if (!existing) {
      map.set(record.doctorId, {
        doctorId: record.doctorId,
        name: record.doctorName,
        specialty,
        lastVisitDate: record.date,
        sortDate: record.sortDate,
        visitCount: 0,
        reportCount: 0,
        prescriptionCount: 0,
        testCount: 0,
        chatCount: 0,
        uploadCount: 0,
        records: [],
      });
    }

    const folder = map.get(record.doctorId)!;
    folder.records.push(record);

    if (record.recordType === 'doctor_visit') folder.visitCount += 1;
    if (REPORT_TYPES.includes(record.recordType)) folder.reportCount += 1;
    if (record.recordType === 'prescription') folder.prescriptionCount += 1;
    if (record.recordType === 'test_request') folder.testCount += 1;
    if (record.recordType === 'chat') folder.chatCount += 1;
    if (record.recordType === 'upload') folder.uploadCount += 1;

    if (new Date(record.sortDate) > new Date(folder.sortDate)) {
      folder.sortDate = record.sortDate;
      folder.lastVisitDate = record.date;
    }
  });

  return Array.from(map.values())
    .map(({ records: _r, ...folder }) => folder)
    .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());
}

export function buildLabFolders(records: MedicalRecordItem[]): LabFolder[] {
  const map = new Map<string, LabFolder & { records: MedicalRecordItem[] }>();

  records.forEach(record => {
    if (!record.labId || !record.labName) return;

    if (!map.has(record.labId)) {
      map.set(record.labId, {
        labId: record.labId,
        name: record.labName,
        subtitle: 'Lab and diagnostics',
        lastTestDate: record.date,
        sortDate: record.sortDate,
        testCount: 0,
        reportCount: 0,
        invoiceCount: 0,
        homeSampleCount: 0,
        uploadCount: 0,
        records: [],
      });
    }

    const folder = map.get(record.labId)!;
    folder.records.push(record);

    if (record.recordType === 'lab_booking') {
      folder.testCount += 1;
      if (record.description.toLowerCase().includes('home sample')) {
        folder.homeSampleCount += 1;
      }
    }
    if (REPORT_TYPES.includes(record.recordType)) folder.reportCount += 1;
    if (record.recordType === 'invoice') folder.invoiceCount += 1;
    if (record.recordType === 'upload') folder.uploadCount += 1;

    if (new Date(record.sortDate) > new Date(folder.sortDate)) {
      folder.sortDate = record.sortDate;
      folder.lastTestDate = record.date;
    }
  });

  return Array.from(map.values())
    .map(({ records: _r, ...folder }) => folder)
    .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());
}

export function getRecordsForDoctor(
  doctorId: string,
  records: MedicalRecordItem[],
): MedicalRecordItem[] {
  return records
    .filter(r => r.doctorId === doctorId)
    .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());
}

export function getRecordsForLab(
  labId: string,
  records: MedicalRecordItem[],
): MedicalRecordItem[] {
  return records
    .filter(r => r.labId === labId)
    .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());
}

export function getReportRecords(records: MedicalRecordItem[]): MedicalRecordItem[] {
  return records
    .filter(r => REPORT_TYPES.includes(r.recordType))
    .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());
}

export function getUploadRecords(records: MedicalRecordItem[]): MedicalRecordItem[] {
  return records
    .filter(r => UPLOAD_TYPES.includes(r.recordType) || r.uploadedByUser)
    .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());
}

export function formatDoctorFolderCounts(folder: DoctorFolder): string {
  const parts: string[] = [];
  if (folder.visitCount) parts.push(`${folder.visitCount} visit${folder.visitCount === 1 ? '' : 's'}`);
  if (folder.reportCount) parts.push(`${folder.reportCount} report${folder.reportCount === 1 ? '' : 's'}`);
  if (folder.prescriptionCount) {
    parts.push(`${folder.prescriptionCount} prescription${folder.prescriptionCount === 1 ? '' : 's'}`);
  }
  return parts.join(' · ') || 'No records yet';
}

export function formatLabFolderCounts(folder: LabFolder): string {
  const parts: string[] = [];
  if (folder.testCount) parts.push(`${folder.testCount} test${folder.testCount === 1 ? '' : 's'}`);
  if (folder.reportCount) parts.push(`${folder.reportCount} report${folder.reportCount === 1 ? '' : 's'}`);
  if (folder.invoiceCount) {
    parts.push(`${folder.invoiceCount} invoice${folder.invoiceCount === 1 ? '' : 's'}`);
  }
  return parts.join(' · ') || 'No records yet';
}

export function getDoctorById(
  doctorId: string,
  records: MedicalRecordItem[],
): DoctorFolder | null {
  return buildDoctorFolders(records).find(d => d.doctorId === doctorId) ?? null;
}

export function getLabById(labId: string, records: MedicalRecordItem[]): LabFolder | null {
  return buildLabFolders(records).find(l => l.labId === labId) ?? null;
}

export function groupRecordsByTypes(
  records: MedicalRecordItem[],
  groups: readonly { id: string; title: string; types: readonly RecordType[] }[],
) {
  return groups
    .map(group => ({
      ...group,
      items: records.filter(r => group.types.includes(r.recordType)),
    }))
    .filter(group => group.items.length > 0);
}

export function getReportSourceLabel(record: MedicalRecordItem): string {
  if (record.doctorName && record.labName) {
    return `${record.labName} · Requested by ${record.doctorName}`;
  }
  if (record.labName) return record.labName;
  if (record.doctorName) return `Requested by ${record.doctorName}`;
  if (record.uploadedByUser) return 'Uploaded manually';
  return record.description;
}

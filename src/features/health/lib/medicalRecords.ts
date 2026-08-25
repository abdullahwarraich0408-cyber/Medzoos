import type { LabBooking } from '../../../lib/mappers/labTest';
import type { UnifiedOrder } from '../../../lib/mappers/order';
import type { MedicalRecord } from '../../../lib/profile/profileData';
import type {
  MedicalRecordTabId,
  RecordCategoryId,
  RecordSectionId,
} from '../data/healthData';
import { inferRecordCategory } from '../data/healthData';

export type MedicalRecordSource =
  | 'manual'
  | 'lab'
  | 'doctor'
  | 'pharmacy';

export type UnifiedMedicalRecord = {
  id: string;
  category: RecordCategoryId;
  title: string;
  detail: string;
  provider: string;
  date: string;
  sortDate: string;
  source: MedicalRecordSource;
  sourceLabel: string;
  status?: string;
  fileUrl?: string;
  orderRef?: string;
  isManual: boolean;
  typeLabel: string;
  icon: string;
};

export const RECORD_SOURCE_META: Record<
  MedicalRecordSource,
  { label: string; icon: string; color: string; bg: string }
> = {
  manual: {
    label: 'Uploaded',
    icon: 'cloud-upload-outline',
    color: '#113D63',
    bg: '#E8F4FF',
  },
  lab: {
    label: 'Lab',
    icon: 'flask-outline',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  doctor: {
    label: 'Doctor',
    icon: 'stethoscope',
    color: '#0891A0',
    bg: '#E8F4FF',
  },
  pharmacy: {
    label: 'Pharmacy',
    icon: 'pill',
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
};

const REPORT_READY_STATUSES = new Set([
  'completed',
  'report_ready',
  'report_uploaded',
]);

function formatDisplayDate(value?: string) {
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

function formatDoctorName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return 'Doctor';
  if (/^dr\.?\s/i.test(trimmed)) return trimmed;
  return `Dr. ${trimmed}`;
}

function buildVisitTitle(specialty?: string, isOnline?: boolean) {
  const label = specialty?.trim() || 'General';
  const kind = isOnline ? 'consultation' : 'follow-up';
  return `${label} ${kind}`;
}

export function getRecordDisplayGroup(
  record: UnifiedMedicalRecord,
): Exclude<MedicalRecordTabId, 'all'> {
  if (record.isManual || record.source === 'manual') return 'uploads';
  if (record.source === 'doctor' || record.category === 'doctor-notes') {
    return 'doctors';
  }
  if (record.source === 'lab') {
    if (record.fileUrl || record.status === 'Report ready') return 'reports';
    return 'labs';
  }
  if (record.category === 'imaging' || record.category === 'lab-report') {
    return 'reports';
  }
  return 'uploads';
}

function fromManualRecord(record: MedicalRecord): UnifiedMedicalRecord {
  const category = inferRecordCategory(record.type);
  const detail = record.lab || 'Uploaded document';
  return {
    id: `manual-${record.id}`,
    category,
    title: record.title,
    detail,
    provider: detail,
    date: formatDisplayDate(record.date),
    sortDate: sortKey(record.date),
    source: 'manual',
    sourceLabel: RECORD_SOURCE_META.manual.label,
    fileUrl: record.fileUrl,
    isManual: true,
    typeLabel: record.type || 'Document',
    icon: 'cloud-upload-outline',
  };
}

function fromLabBooking(booking: LabBooking): UnifiedMedicalRecord | null {
  if (!booking.id) return null;

  const hasReport = Boolean(booking.reportUrl);
  const isReportReady =
    hasReport || REPORT_READY_STATUSES.has(booking.status || '');

  const testName = booking.testName || 'Lab Test';
  const date = formatDisplayDate(booking.collectionDate);
  const sortDate = sortKey(booking.collectionDate);

  if (isReportReady) {
    const title = testName.toLowerCase().includes('report')
      ? testName
      : `${testName} Report`;

    return {
      id: `lab-report-${booking.id}`,
      category: 'lab-report',
      title,
      detail: 'Test result',
      provider: booking.lab || 'Lab Partner',
      date,
      sortDate,
      source: 'lab',
      sourceLabel: RECORD_SOURCE_META.lab.label,
      status: hasReport ? 'Report ready' : undefined,
      fileUrl: booking.reportUrl,
      orderRef: `lab-${booking.id}`,
      isManual: false,
      typeLabel: 'Lab report',
      icon: 'file-chart-outline',
    };
  }

  return {
    id: `lab-${booking.id}`,
    category: 'lab-report',
    title: testName,
    detail: 'Sample collected',
    provider: booking.lab || 'Lab Partner',
    date,
    sortDate,
    source: 'lab',
    sourceLabel: RECORD_SOURCE_META.lab.label,
    orderRef: `lab-${booking.id}`,
    isManual: false,
    typeLabel: 'Lab test',
    icon: 'flask-outline',
  };
}

function fromDoctorVisit(order: UnifiedOrder): UnifiedMedicalRecord | null {
  if (order.type !== 'doctor') return null;

  const specialty = order.specialty?.trim() || 'General';
  const doctorLabel = formatDoctorName(order.vendor || 'Doctor');
  const detail = `${doctorLabel} · ${specialty}`;

  return {
    id: `doctor-${order.sourceId}`,
    category: 'doctor-notes',
    title: buildVisitTitle(specialty, order.isOnline),
    detail,
    provider: detail,
    date: order.date,
    sortDate: sortKey(order.sortDate),
    source: 'doctor',
    sourceLabel: RECORD_SOURCE_META.doctor.label,
    orderRef: order.id,
    isManual: false,
    typeLabel: detail,
    icon: 'stethoscope',
  };
}

function fromLabOrder(order: UnifiedOrder): UnifiedMedicalRecord | null {
  if (order.type !== 'lab') return null;

  const hasReport = Boolean(order.fileUrl);
  const testName = order.testName || order.title || order.vendor || 'Lab Test';

  if (hasReport) {
    const title = testName.toLowerCase().includes('report')
      ? testName
      : `${testName} Report`;

    return {
      id: `lab-order-report-${order.sourceId}`,
      category: 'lab-report',
      title,
      detail: 'Test result',
      provider: order.vendor || 'Lab Partner',
      date: order.date,
      sortDate: sortKey(order.sortDate),
      source: 'lab',
      sourceLabel: RECORD_SOURCE_META.lab.label,
      fileUrl: order.fileUrl,
      orderRef: order.id,
      isManual: false,
      typeLabel: 'Lab report',
      icon: 'file-chart-outline',
    };
  }

  return {
    id: `lab-order-${order.sourceId}`,
    category: 'lab-report',
    title: testName,
    detail: 'Sample collected',
    provider: order.vendor || 'Lab Partner',
    date: order.date,
    sortDate: sortKey(order.sortDate),
    source: 'lab',
    sourceLabel: RECORD_SOURCE_META.lab.label,
    orderRef: order.id,
    isManual: false,
    typeLabel: 'Lab test',
    icon: 'flask-outline',
  };
}

function fromPrescriptionOrder(order: UnifiedOrder): UnifiedMedicalRecord | null {
  if (order.type !== 'prescription') return null;

  return {
    id: `rx-${order.sourceId}`,
    category: 'prescription',
    title: 'Prescription order',
    detail: order.vendor || 'Pharmacy',
    provider: order.vendor || 'Pharmacy',
    date: order.date,
    sortDate: sortKey(order.sortDate),
    source: 'pharmacy',
    sourceLabel: RECORD_SOURCE_META.pharmacy.label,
    fileUrl: order.fileUrl,
    orderRef: order.id,
    isManual: false,
    typeLabel: 'Pharmacy prescription',
    icon: 'file-document-outline',
  };
}

export const DEMO_MEDICAL_RECORDS: UnifiedMedicalRecord[] = [
  {
    id: 'demo-doc-1',
    category: 'doctor-notes',
    title: 'Cardiology follow-up',
    detail: 'Dr. Hassan Ali · Cardiologist',
    provider: 'Dr. Hassan Ali · Cardiologist',
    date: 'Jul 13, 2026',
    sortDate: '2026-07-13',
    source: 'doctor',
    sourceLabel: 'Doctor',
    isManual: false,
    typeLabel: 'Doctor visit',
    icon: 'stethoscope',
  },
  {
    id: 'demo-doc-2',
    category: 'doctor-notes',
    title: 'Dermatology consultation',
    detail: 'Dr. Sara Ahmed · Dermatologist',
    provider: 'Dr. Sara Ahmed · Dermatologist',
    date: 'Jul 9, 2026',
    sortDate: '2026-07-09',
    source: 'doctor',
    sourceLabel: 'Doctor',
    isManual: false,
    typeLabel: 'Doctor visit',
    icon: 'stethoscope',
  },
  {
    id: 'demo-doc-3',
    category: 'doctor-notes',
    title: 'Psychology consultation',
    detail: 'Zubair · Psychologist',
    provider: 'Zubair · Psychologist',
    date: 'Jul 2, 2026',
    sortDate: '2026-07-02',
    source: 'doctor',
    sourceLabel: 'Doctor',
    isManual: false,
    typeLabel: 'Doctor visit',
    icon: 'stethoscope',
  },
  {
    id: 'demo-report-1',
    category: 'lab-report',
    title: 'CBC Report',
    detail: 'Test result',
    provider: 'Lab Partner',
    date: 'Jul 12, 2026',
    sortDate: '2026-07-12',
    source: 'lab',
    sourceLabel: 'Lab',
    status: 'Report ready',
    isManual: false,
    typeLabel: 'Lab report',
    icon: 'file-chart-outline',
  },
  {
    id: 'demo-report-2',
    category: 'lab-report',
    title: 'Lipid Profile',
    detail: 'Test result',
    provider: 'Lab Partner',
    date: 'Jul 5, 2026',
    sortDate: '2026-07-05',
    source: 'lab',
    sourceLabel: 'Lab',
    status: 'Report ready',
    isManual: false,
    typeLabel: 'Lab report',
    icon: 'file-chart-outline',
  },
  {
    id: 'demo-report-3',
    category: 'lab-report',
    title: 'ECG Report',
    detail: 'Test result',
    provider: 'Lab Partner',
    date: 'Jun 28, 2026',
    sortDate: '2026-06-28',
    source: 'lab',
    sourceLabel: 'Lab',
    status: 'Report ready',
    isManual: false,
    typeLabel: 'Lab report',
    icon: 'file-chart-outline',
  },
  {
    id: 'demo-lab-1',
    category: 'lab-report',
    title: 'Complete Blood Count CBC',
    detail: 'Sample collected',
    provider: 'Lab Partner',
    date: 'Jul 12, 2026',
    sortDate: '2026-07-12',
    source: 'lab',
    sourceLabel: 'Lab',
    isManual: false,
    typeLabel: 'Lab test',
    icon: 'flask-outline',
  },
  {
    id: 'demo-lab-2',
    category: 'lab-report',
    title: 'Lipid Profile',
    detail: 'Sample collected',
    provider: 'Lab Partner',
    date: 'Jul 5, 2026',
    sortDate: '2026-07-05',
    source: 'lab',
    sourceLabel: 'Lab',
    isManual: false,
    typeLabel: 'Lab test',
    icon: 'flask-outline',
  },
  {
    id: 'demo-lab-3',
    category: 'lab-report',
    title: 'Thyroid Panel',
    detail: 'Sample collected',
    provider: 'Lab Partner',
    date: 'Jun 28, 2026',
    sortDate: '2026-06-28',
    source: 'lab',
    sourceLabel: 'Lab',
    isManual: false,
    typeLabel: 'Lab test',
    icon: 'flask-outline',
  },
];

export function buildUnifiedMedicalRecords(input: {
  manualRecords?: MedicalRecord[];
  labReports?: LabBooking[];
  orders?: UnifiedOrder[];
}): UnifiedMedicalRecord[] {
  const seen = new Set<string>();
  const merged: UnifiedMedicalRecord[] = [];

  const push = (record: UnifiedMedicalRecord | null) => {
    if (!record || seen.has(record.id)) return;
    seen.add(record.id);
    merged.push(record);
  };

  (input.manualRecords || []).forEach(r => push(fromManualRecord(r)));
  (input.labReports || []).forEach(b => push(fromLabBooking(b)));
  (input.orders || []).forEach(o => {
    push(fromDoctorVisit(o));
    push(fromLabOrder(o));
    push(fromPrescriptionOrder(o));
  });

  const sorted = merged.sort(
    (a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime(),
  );

  return sorted;
}

export function filterMedicalRecordsByTab(
  records: UnifiedMedicalRecord[],
  tab: MedicalRecordTabId,
  search: string,
): UnifiedMedicalRecord[] {
  let list =
    tab === 'all'
      ? records
      : records.filter(r => getRecordDisplayGroup(r) === tab);

  const q = search.trim().toLowerCase();
  if (!q) return list;

  return list.filter(
    r =>
      r.title.toLowerCase().includes(q) ||
      r.detail.toLowerCase().includes(q) ||
      r.provider.toLowerCase().includes(q) ||
      r.typeLabel.toLowerCase().includes(q),
  );
}

export function groupRecordsForAllView(records: UnifiedMedicalRecord[]) {
  const doctors = records.filter(r => getRecordDisplayGroup(r) === 'doctors');
  const reports = records.filter(r => getRecordDisplayGroup(r) === 'reports');
  const labs = records.filter(r => getRecordDisplayGroup(r) === 'labs');

  return { doctors, reports, labs } satisfies Record<
    RecordSectionId,
    UnifiedMedicalRecord[]
  >;
}

export const ALL_VIEW_SECTIONS: RecordSectionId[] = ['doctors', 'reports', 'labs'];

export const SECTION_TAB_MAP: Record<RecordSectionId, MedicalRecordTabId> = {
  doctors: 'doctors',
  reports: 'reports',
  labs: 'labs',
};

/** @deprecated Use filterMedicalRecordsByTab */
export function filterMedicalRecords(
  records: UnifiedMedicalRecord[],
  category: string,
  search: string,
): UnifiedMedicalRecord[] {
  if (category === 'all') {
    return filterMedicalRecordsByTab(records, 'all', search);
  }
  return filterMedicalRecordsByTab(records, 'all', search).filter(
    r => r.category === category,
  );
}

export function countRecordsByCategory(
  records: UnifiedMedicalRecord[],
): Record<string, number> {
  const counts: Record<string, number> = { all: records.length };
  records.forEach(r => {
    const group = getRecordDisplayGroup(r);
    counts[group] = (counts[group] || 0) + 1;
    counts[r.category] = (counts[r.category] || 0) + 1;
  });
  return counts;
}

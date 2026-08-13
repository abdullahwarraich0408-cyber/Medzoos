import type {
  VaultCalendarEvent,
  VaultDashboardMember,
  FamilyHealthVault,
} from '../../../lib/api';

export type VaultMemberStatus =
  | 'all_good'
  | 'medicine_due'
  | 'report_ready'
  | 'appointment_due'
  | 'needs_attention';

export type VaultTabId = 'members' | 'calendar' | 'records';

export type VaultAlertType =
  | 'medicine_due'
  | 'report_ready'
  | 'appointment_due'
  | 'lab_booking'
  | 'prescription_refill'
  | 'manual_reminder';

export type VaultEventType =
  | 'appointment'
  | 'medicine_reminder'
  | 'lab_test'
  | 'vaccination'
  | 'follow_up'
  | 'custom';

export type FamilyVaultView = {
  familyId: string;
  familyName: string;
  memberCount: number;
  familyScore?: number;
  overallStatus: string;
};

export type FamilyMemberView = {
  memberId: string;
  familyId: string;
  name: string;
  relationship: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  phone?: string;
  avatarUrl?: string;
  healthScore?: number;
  status: VaultMemberStatus;
  statusLabel: string;
  urgentItemCount: number;
  activeMedicineCount: number;
  reportCount: number;
  appointmentCount: number;
  lastActivityAt?: string;
};

export type FamilyAlertView = {
  alertId: string;
  familyId: string;
  memberId: string;
  memberName: string;
  alertType: VaultAlertType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  date?: string;
  isResolved: boolean;
};

export type FamilyEventView = {
  eventId: string;
  familyId: string;
  memberId: string;
  memberName: string;
  eventType: VaultEventType;
  title: string;
  description?: string;
  date: string;
  time?: string;
  status: string;
  dayLabel: string;
};

export type FamilyRecordView = {
  recordId: string;
  memberId: string;
  memberName: string;
  title: string;
  type: 'report' | 'prescription' | 'appointment' | 'upload';
  date: string;
};

export type FamilyActivityView = {
  id: string;
  message: string;
  icon: string;
  date?: string;
};

export const VAULT_TABS: { id: VaultTabId; label: string }[] = [
  { id: 'members', label: 'Members' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'records', label: 'Records' },
];

export const RELATIONSHIPS = [
  'Father',
  'Mother',
  'Spouse',
  'Son',
  'Daughter',
  'Grandfather',
  'Grandmother',
  'Other',
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const GENDERS = ['Male', 'Female', 'Other'];

function getInitials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function mapStatusFromLines(statusLines?: string[]): {
  status: VaultMemberStatus;
  label: string;
} {
  if (!statusLines?.length) {
    return { status: 'all_good', label: 'No urgent items' };
  }
  const line = statusLines[0].toLowerCase();
  if (line.includes('medicine') || line.includes('refill') || line.includes('due today')) {
    return { status: 'medicine_due', label: statusLines[0] };
  }
  if (line.includes('report')) {
    return { status: 'report_ready', label: statusLines[0] };
  }
  if (line.includes('appointment') || line.includes('visit')) {
    return { status: 'appointment_due', label: statusLines[0] };
  }
  return { status: 'needs_attention', label: statusLines[0] };
}

function mapEventType(type: string): VaultEventType {
  const t = type.toLowerCase();
  if (t.includes('appointment')) return 'appointment';
  if (t.includes('medicine') || t.includes('refill')) return 'medicine_reminder';
  if (t.includes('lab') || t.includes('test')) return 'lab_test';
  if (t.includes('vaccin')) return 'vaccination';
  if (t.includes('follow')) return 'follow_up';
  return 'custom';
}

function formatDayLabel(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, tomorrow)) return 'Tomorrow';
  return date.toLocaleDateString(undefined, { weekday: 'long' });
}

export function buildFamilyVaultView(
  vault: FamilyHealthVault,
  dashboard?: { overall_score?: number; family_name?: string },
): FamilyVaultView {
  const members = vault.members ?? [];
  return {
    familyId: vault.id,
    familyName: dashboard?.family_name || vault.name || 'Warraich Family',
    memberCount: members.length,
    familyScore: dashboard?.overall_score,
    overallStatus: 'All good today',
  };
}

export function buildMemberViews(
  members: VaultDashboardMember[],
  familyId: string,
): FamilyMemberView[] {
  return members.map(m => {
    const { status, label } = mapStatusFromLines(m.status_lines);
    const urgent = m.status_lines?.length ?? 0;
    return {
      memberId: m.id,
      familyId,
      name: m.full_name,
      relationship: m.relationship,
      healthScore: m.health_score,
      status,
      statusLabel: label,
      urgentItemCount: urgent,
      activeMedicineCount: 0,
      reportCount: 0,
      appointmentCount: 0,
    };
  });
}

export function buildAlertsFromMembers(
  members: FamilyMemberView[],
  aiAlerts?: Array<{
    member_id: string;
    member_name: string;
    alerts?: Array<{ type: string; message: string }>;
  }>,
): FamilyAlertView[] {
  const alerts: FamilyAlertView[] = [];

  if (aiAlerts?.length) {
    aiAlerts.forEach(m => {
      (m.alerts || []).forEach((a, i) => {
        alerts.push({
          alertId: `${m.member_id}-${i}`,
          familyId: '',
          memberId: m.member_id,
          memberName: m.member_name,
          alertType: 'manual_reminder',
          title: a.message,
          description: a.message,
          priority: 'medium',
          isResolved: false,
        });
      });
    });
  }

  members.forEach(m => {
    if (m.status !== 'all_good') {
      alerts.push({
        alertId: `status-${m.memberId}`,
        familyId: m.familyId,
        memberId: m.memberId,
        memberName: m.name,
        alertType:
          m.status === 'medicine_due'
            ? 'medicine_due'
            : m.status === 'report_ready'
              ? 'report_ready'
              : m.status === 'appointment_due'
                ? 'appointment_due'
                : 'manual_reminder',
        title: `${m.name} — ${m.statusLabel}`,
        description: m.statusLabel,
        priority: 'medium',
        isResolved: false,
      });
    }
  });

  if (alerts.length === 0) return [];
  return alerts;
}

export function buildEventViews(
  events: VaultCalendarEvent[],
  familyId: string,
  useDemo = false,
): FamilyEventView[] {
  if (events.length === 0) return useDemo ? DEMO_EVENTS : [];
  return events.map(e => ({
    eventId: e.id,
    familyId,
    memberId: e.member_id,
    memberName: e.member_name,
    eventType: mapEventType(e.type),
    title: e.title,
    date: e.date,
    status: 'upcoming',
    dayLabel: formatDayLabel(e.date),
  }));
}

export function buildActivityFromAlerts(alerts: FamilyAlertView[]): FamilyActivityView[] {
  if (alerts.length === 0) return [];
  return alerts.slice(0, 4).map(a => ({
    id: a.alertId,
    message: a.description,
    icon:
      a.alertType === 'report_ready'
        ? 'file-document-outline'
        : a.alertType === 'medicine_due'
          ? 'pill'
          : a.alertType === 'appointment_due'
          ? 'calendar-clock'
          : 'bell-outline',
    date: a.date,
  }));
}

export function buildRecentRecords(
  members: FamilyMemberView[],
  useDemo = false,
): FamilyRecordView[] {
  if (members.length === 0) return useDemo ? DEMO_RECENT_RECORDS : [];
  const records: FamilyRecordView[] = [];
  members.forEach(m => {
    if (m.reportCount > 0) {
      records.push({
        recordId: `report-${m.memberId}`,
        memberId: m.memberId,
        memberName: m.name,
        title: 'Lab report',
        type: 'report',
        date: 'Recent',
      });
    }
  });
  return records.length > 0 ? records : DEMO_RECENT_RECORDS;
}

export function getMemberRecordSummary(member: FamilyMemberView): string {
  const parts: string[] = [];
  if (member.reportCount > 0) {
    parts.push(`${member.reportCount} report${member.reportCount === 1 ? '' : 's'}`);
  }
  if (member.activeMedicineCount > 0) {
    parts.push(`${member.activeMedicineCount} prescription${member.activeMedicineCount === 1 ? '' : 's'}`);
  }
  if (member.appointmentCount > 0) {
    parts.push(`${member.appointmentCount} appointment${member.appointmentCount === 1 ? '' : 's'}`);
  }
  if (parts.length === 0) return 'No records yet';
  return parts.join(' · ');
}

export function getStatusColor(status: VaultMemberStatus): string {
  switch (status) {
    case 'all_good':
      return '#059669';
    case 'medicine_due':
      return '#D97706';
    case 'report_ready':
      return '#2563EB';
    case 'appointment_due':
      return '#113D63';
    default:
      return '#DC2626';
  }
}

export const DEMO_MEMBERS: FamilyMemberView[] = [
  {
    memberId: 'demo-abduah',
    familyId: 'demo-family',
    name: 'Abduah',
    relationship: 'Father',
    bloodGroup: 'B+',
    status: 'all_good',
    statusLabel: 'No urgent items',
    urgentItemCount: 0,
    activeMedicineCount: 2,
    reportCount: 3,
    appointmentCount: 0,
  },
  {
    memberId: 'demo-abc',
    familyId: 'demo-family',
    name: 'abc',
    relationship: 'Mother',
    bloodGroup: 'A+',
    status: 'report_ready',
    statusLabel: 'Report ready',
    urgentItemCount: 1,
    activeMedicineCount: 0,
    reportCount: 1,
    appointmentCount: 1,
  },
  {
    memberId: 'demo-bdb',
    familyId: 'demo-family',
    name: 'bdb',
    relationship: 'Son',
    status: 'all_good',
    statusLabel: 'No urgent items',
    urgentItemCount: 0,
    activeMedicineCount: 0,
    reportCount: 0,
    appointmentCount: 0,
  },
];

export const DEMO_VAULT: FamilyVaultView = {
  familyId: 'demo-family',
  familyName: 'Warraich Family',
  memberCount: 3,
  familyScore: 85,
  overallStatus: 'All good today',
};

export const DEMO_ALERTS: FamilyAlertView[] = [
  {
    alertId: 'alert-1',
    familyId: 'demo-family',
    memberId: 'demo-abduah',
    memberName: 'Abduah',
    alertType: 'medicine_due',
    title: 'Abduah needs medicine reminder',
    description: 'Abduah needs medicine reminder',
    priority: 'medium',
    isResolved: false,
  },
  {
    alertId: 'alert-2',
    familyId: 'demo-family',
    memberId: 'demo-abc',
    memberName: 'abc',
    alertType: 'report_ready',
    title: 'abc has lab report ready',
    description: 'abc has lab report ready',
    priority: 'medium',
    isResolved: false,
  },
];

export const DEMO_EVENTS: FamilyEventView[] = [
  {
    eventId: 'evt-1',
    familyId: 'demo-family',
    memberId: 'demo-abc',
    memberName: 'Mother',
    eventType: 'follow_up',
    title: 'Dermatology follow-up',
    date: new Date(Date.now() + 86400000).toISOString(),
    time: '10:30 AM',
    status: 'upcoming',
    dayLabel: 'Tomorrow',
  },
  {
    eventId: 'evt-2',
    familyId: 'demo-family',
    memberId: 'demo-abduah',
    memberName: 'Father',
    eventType: 'lab_test',
    title: 'CBC test',
    description: 'Home sample',
    date: new Date(Date.now() + 3 * 86400000).toISOString(),
    status: 'upcoming',
    dayLabel: 'Friday',
  },
];

export const DEMO_RECENT_RECORDS: FamilyRecordView[] = [
  {
    recordId: 'rec-1',
    memberId: 'demo-abduah',
    memberName: 'Abduah',
    title: 'CBC Report',
    type: 'report',
    date: 'Jul 13, 2026',
  },
  {
    recordId: 'rec-2',
    memberId: 'demo-abc',
    memberName: 'abc',
    title: 'Prescription uploaded',
    type: 'prescription',
    date: 'Jul 9, 2026',
  },
];

export const DEMO_ACTIVITY: FamilyActivityView[] = [
  {
    id: 'act-1',
    message: 'Prescription uploaded for Abduah',
    icon: 'file-upload-outline',
  },
  {
    id: 'act-2',
    message: 'CBC report ready for abc',
    icon: 'flask-outline',
  },
  {
    id: 'act-3',
    message: 'Appointment booked for bdb',
    icon: 'calendar-check',
  },
];

export function getMemberInitials(name: string) {
  return getInitials(name);
}

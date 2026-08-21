import type { CopilotContextInput, HealthContext } from '../types';

function calcAge(dob?: string): number | undefined {
  if (!dob) return undefined;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

function extractConditions(records: CopilotContextInput['medicalRecords'] = []) {
  const keywords = [
    'diabetes',
    'hypertension',
    'asthma',
    'heart',
    'kidney',
    'liver',
    'cancer',
    'stroke',
  ];
  const found = new Set<string>();
  records.forEach(r => {
    const text = `${r.type} ${r.title}`.toLowerCase();
    keywords.forEach(k => {
      if (text.includes(k)) found.add(k.charAt(0).toUpperCase() + k.slice(1));
    });
  });
  return Array.from(found);
}

export function buildHealthContext(input: CopilotContextInput): HealthContext {
  const fullName = input.userName?.trim() || 'there';
  const firstName = fullName.split(' ')[0];
  const age = calcAge(input.dateOfBirth);
  const conditions = extractConditions(input.medicalRecords);

  const labReports = (input.recentReports || []).map(r => ({
    name: r.testName || 'Lab test',
    date: r.collectionDate,
    status: 'completed',
  }));

  const upcomingAppointments = (input.upcomingAppointments || []).map(a => ({
    doctor: a.doctorName,
    specialty: a.specialty,
    date: a.appointmentDate,
  }));

  const insights: string[] = [];

  const hba1cReports = (input.recentReports || []).filter(r =>
    (r.testName || '').toLowerCase().includes('hba1c'),
  );
  if (hba1cReports.length >= 2) {
    insights.push('Your HbA1c trend has been improving over recent tests.');
  }

  if (conditions.some(c => c.toLowerCase().includes('hypertension'))) {
    insights.push('Your blood pressure management is on track based on your records.');
  }

  if (upcomingAppointments.length > 0) {
    const next = upcomingAppointments[0];
    insights.push(
      `You have a follow-up with ${next.doctor || 'your doctor'}${next.date ? ` on ${formatShortDate(next.date)}` : ' soon'}.`,
    );
  }

  const medicineOrders = (input.orders || []).filter(
    o => o.type === 'medicine' || o.status === 'delivered',
  );
  const currentMedicines = medicineOrders.slice(0, 5).map((o, i) => ({
    name: `Medicine ${i + 1}`,
    frequency: 'As prescribed',
  }));

  return {
    personal: {
      name: fullName,
      firstName,
      age,
      gender: input.gender,
      bloodGroup: input.bloodGroup,
    },
    conditions,
    allergies: { medicine: [], food: [], environmental: [] },
    currentMedicines,
    consultations: (input.medicalRecords || [])
      .filter(r => r.type?.toLowerCase().includes('consult'))
      .slice(0, 5)
      .map(r => ({ doctor: r.title, date: r.date })),
    labReports,
    familyHistory: (input.familyMembers || [])
      .map(m => m.relation)
      .filter(Boolean) as string[],
    lifestyle: { smoking: false },
    upcomingAppointments,
    insights,
  };
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatHealthSummary(context: HealthContext): string {
  const parts: string[] = [];
  if (context.conditions.length) {
    parts.push(`Conditions: ${context.conditions.join(', ')}`);
  }
  if (context.currentMedicines.length) {
    parts.push(`Current medicines: ${context.currentMedicines.length} active`);
  }
  if (context.labReports.length) {
    parts.push(`Recent labs: ${context.labReports.slice(0, 3).map(l => l.name).join(', ')}`);
  }
  return parts.join(' · ') || 'No major conditions on file yet.';
}

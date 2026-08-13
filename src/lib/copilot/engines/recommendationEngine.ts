import type {
  CopilotAction,
  CopilotIntent,
  HealthContext,
  RiskLevel,
} from '../types';
import { getSpecialtyForIntent } from './intentDetection';

let actionCounter = 0;
function nextActionId() {
  actionCounter += 1;
  return `action-${Date.now()}-${actionCounter}`;
}

export function generateActions(
  intent: CopilotIntent,
  riskLevel: RiskLevel,
  message: string,
  context: HealthContext,
): CopilotAction[] {
  const actions: CopilotAction[] = [];
  const specialty = getSpecialtyForIntent(intent, message);

  if (riskLevel === 'critical') {
    actions.push({
      id: nextActionId(),
      type: 'emergency_alert',
      label: 'Call emergency (1122)',
      reason: 'Your symptoms may need immediate emergency care.',
      priority: 100,
    });
    actions.push({
      id: nextActionId(),
      type: 'book_doctor',
      label: 'Find nearest emergency care',
      reason: 'Emergency departments can evaluate chest pain and other acute symptoms.',
      navigation: {
        tab: 'Home',
        screen: 'Services',
        params: { screen: 'ConsultHome' },
      },
      priority: 90,
    });
    return actions;
  }

  if (intent === 'symptoms' && /\bchest\b/i.test(message)) {
    if (riskLevel === 'high' || riskLevel === 'medium') {
      actions.push({
        id: nextActionId(),
        type: 'book_lab',
        label: 'Book ECG + Troponin',
        reason: 'Chest pain with risk factors warrants cardiac testing.',
        navigation: {
          tab: 'Home',
          screen: 'Services',
          params: { screen: 'LabTestsList' },
        },
        priority: 85,
      });
    }
    actions.push({
      id: nextActionId(),
      type: 'book_doctor',
      label: `Book ${specialty || 'Cardiologist'}`,
      reason: 'A specialist can evaluate your symptoms in person or online.',
      navigation: {
        tab: 'Home',
        screen: 'Services',
        params: {
          screen: 'DoctorsList',
          params: { specialty: specialty || 'Cardiology', screenTitle: specialty || 'Cardiology' },
        },
      },
      priority: 80,
    });
  }

  if (/\bfever\b/i.test(message) || intent === 'symptoms') {
    if (riskLevel !== 'high') {
      actions.push({
        id: nextActionId(),
        type: 'health_plan',
        label: 'Rest & monitor plan',
        reason: 'Track temperature and hydration for the next 24 hours.',
        priority: 40,
      });
    }
    if (riskLevel === 'medium' || riskLevel === 'high') {
      actions.push({
        id: nextActionId(),
        type: 'book_doctor',
        label: 'Book GP today',
        reason: 'Persistent or high fever should be reviewed by a doctor.',
        navigation: {
          tab: 'Home',
          screen: 'Services',
          params: {
            screen: 'DoctorsList',
            params: { specialty: 'General Physician', screenTitle: 'General Physician' },
          },
        },
        priority: 75,
      });
    }
  }

  if (intent === 'medicine') {
    actions.push({
      id: nextActionId(),
      type: 'schedule_reminder',
      label: 'Set medicine reminder',
      reason: 'Reminders improve adherence and reduce missed doses.',
      navigation: { tab: 'Health', screen: 'MedicinesList' },
      priority: 70,
    });
    actions.push({
      id: nextActionId(),
      type: 'order_medicine',
      label: 'Order medicines',
      reason: 'Refill prescriptions from verified pharmacies.',
      navigation: { tab: 'Health', screen: 'MedicinesList' },
      priority: 65,
    });
    actions.push({
      id: nextActionId(),
      type: 'compare_prices',
      label: 'Compare prices',
      reason: 'Find the best price across partner pharmacies.',
      navigation: { tab: 'Health', screen: 'MedicinesList' },
      priority: 50,
    });
  }

  if (intent === 'lab' || intent === 'report') {
    actions.push({
      id: nextActionId(),
      type: 'book_lab',
      label: 'Book recommended lab tests',
      reason: 'Home collection available for most tests.',
      navigation: {
        tab: 'Home',
        screen: 'Services',
        params: { screen: 'LabTestsList' },
      },
      priority: 75,
    });
    if (intent === 'report') {
      actions.push({
        id: nextActionId(),
        type: 'book_doctor',
        label: 'Discuss results with doctor',
        reason: 'A doctor can interpret abnormal values in your full clinical context.',
        navigation: {
          tab: 'Home',
          screen: 'Services',
          params: { screen: 'DoctorsList' },
        },
        priority: 60,
      });
    }
  }

  if (intent === 'doctor' || intent === 'appointment') {
    actions.push({
      id: nextActionId(),
      type: 'book_doctor',
      label: 'See top matched doctors',
      reason: 'Matched by specialty, availability, and your health profile.',
      navigation: {
        tab: 'Home',
        screen: 'Services',
        params: {
          screen: 'DoctorsList',
          params: specialty ? { specialty, screenTitle: specialty } : undefined,
        },
      },
      priority: 80,
    });
  }

  if (intent === 'family') {
    actions.push({
      id: nextActionId(),
      type: 'family_notification',
      label: 'Check family health',
      reason: 'Review medicines, vaccinations, and lab trends for linked family members.',
      navigation: { tab: 'Health', screen: 'FamilyProfiles' },
      priority: 70,
    });
  }

  if (intent === 'prescription') {
    actions.push({
      id: nextActionId(),
      type: 'order_medicine',
      label: 'Order from prescription',
      reason: 'Upload your prescription and order medicines in one flow.',
      navigation: { tab: 'Health', screen: 'MedicinesList' },
      priority: 75,
    });
    actions.push({
      id: nextActionId(),
      type: 'auto_refill',
      label: 'Enable auto-refill',
      reason: 'Never run out of chronic medicines again.',
      priority: 55,
    });
  }

  if (intent === 'health_advice' || intent === 'vaccination' || intent === 'lifestyle') {
    actions.push({
      id: nextActionId(),
      type: 'health_plan',
      label: 'View preventive care plan',
      reason: 'Personalized screenings and wellness tasks based on your profile.',
      navigation: { tab: 'Health', screen: 'HealthHome' },
      priority: 60,
    });
    actions.push({
      id: nextActionId(),
      type: 'follow_up_reminder',
      label: 'Schedule follow-up',
      reason: 'Stay on track with checkups and screenings.',
      priority: 50,
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: nextActionId(),
      type: 'book_doctor',
      label: 'Book a doctor',
      reason: 'A clinician can help with your specific concern.',
      navigation: {
        tab: 'Home',
        screen: 'Services',
        params: { screen: 'DoctorsList' },
      },
      priority: 50,
    });
    actions.push({
      id: nextActionId(),
      type: 'book_lab',
      label: 'Book a lab test',
      reason: 'Lab tests help clarify many health questions.',
      navigation: {
        tab: 'Home',
        screen: 'Services',
        params: { screen: 'LabTestsList' },
      },
      priority: 45,
    });
  }

  return actions.sort((a, b) => b.priority - a.priority).slice(0, 4);
}

export function buildRecommendationText(
  riskLevel: RiskLevel,
  reasoning: string[],
  actions: CopilotAction[],
): string {
  const lines: string[] = [];

  if (riskLevel === 'critical') {
    lines.push('⚠️ This may be an emergency.');
    lines.push('');
    lines.push('Call 1122 immediately. Do not wait for chat support.');
  } else {
    lines.push('Here is what I recommend next:');
  }

  if (reasoning.length) {
    lines.push('');
    reasoning.forEach(r => lines.push(`• ${r}`));
  }

  if (actions.length && riskLevel !== 'critical') {
    lines.push('');
    lines.push('Choose an action below to continue your care journey.');
  }

  return lines.join('\n');
}

export function suggestLabTests(message: string, riskLevel: RiskLevel): string[] {
  const tests: string[] = [];
  if (/\bchest|heart\b/i.test(message) || riskLevel === 'high') {
    tests.push('ECG', 'Troponin', 'CBC', 'Lipid Profile');
  } else if (/\bfever\b/i.test(message)) {
    tests.push('CBC', 'CRP');
  } else if (/\bdiabetes|hba1c|sugar\b/i.test(message)) {
    tests.push('HbA1c', 'Fasting Glucose', 'Lipid Profile');
  }
  return tests;
}

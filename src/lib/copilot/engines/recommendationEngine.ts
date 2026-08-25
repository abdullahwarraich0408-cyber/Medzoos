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

type ObservationProfile = {
  fever: boolean;
  cough: boolean;
  cold: boolean;
  headache: boolean;
  stomach: boolean;
  pain: boolean;
  fatigue: boolean;
  chest: boolean;
  breathlessness: boolean;
  dizziness: boolean;
  skin: boolean;
  mental: boolean;
  durationLong: boolean;
  highTemp: boolean;
};

function buildObservation(
  message: string,
  answers: Record<string, string> = {},
): ObservationProfile {
  const blob = `${message} ${Object.values(answers).join(' ')}`.toLowerCase();
  return {
    fever: /\bfever|temperature|pyrexia|chills?\b/i.test(blob),
    cough: /\bcough|phlegm|sputum\b/i.test(blob),
    cold: /\bcold|runny nose|sneezing|congestion|flu\b/i.test(blob),
    headache: /\bheadache|migraine\b/i.test(blob),
    stomach: /\bstomach|nausea|vomit|diarrhea|diarrhoea|abdomen|gastric\b/i.test(
      blob,
    ),
    pain: /\bpain|ache|sore|hurt\b/i.test(blob),
    fatigue: /\btired|fatigue|weak|exhaust|letharg/i.test(blob),
    chest: /\bchest\b/i.test(blob),
    breathlessness: /\bbreath|breathless|short of breath|wheez/i.test(blob),
    dizziness: /\bdizz|vertigo|faint\b/i.test(blob),
    skin: /\brash|itch|skin|allergy\b/i.test(blob),
    mental: /\banxious|anxiety|stress|depress|sleep\b/i.test(blob),
    durationLong:
      /more than 3 days|over a week|1 week|weeks/i.test(blob) ||
      answers.duration === 'More than 3 days',
    highTemp: /above 39|39°|high fever/i.test(blob),
  };
}

function doctorNav(specialty?: string) {
  return {
    tab: 'Home' as const,
    screen: 'Services',
    params: {
      screen: 'DoctorsList',
      params: specialty
        ? { specialty, screenTitle: specialty }
        : undefined,
    },
  };
}

function labNav() {
  return {
    tab: 'Home' as const,
    screen: 'Services',
    params: { screen: 'LabTestsList' },
  };
}

function medsNav(params?: Record<string, unknown>) {
  return {
    tab: 'Health' as const,
    screen: 'MedicinesList',
    params,
  };
}

function healthNav() {
  return { tab: 'Health' as const, screen: 'HealthHome' };
}

/**
 * Build care actions from the original observation + Q&A answers,
 * not only the last short answer ("No" / "1–3 days").
 */
export function generateActions(
  intent: CopilotIntent,
  riskLevel: RiskLevel,
  message: string,
  context: HealthContext,
  answers: Record<string, string> = {},
): CopilotAction[] {
  const actions: CopilotAction[] = [];
  const specialty = getSpecialtyForIntent(intent, message);
  const obs = buildObservation(message, answers);
  const push = (action: Omit<CopilotAction, 'id'>) => {
    actions.push({ ...action, id: nextActionId() });
  };

  if (riskLevel === 'critical') {
    push({
      type: 'emergency_alert',
      label: 'Call emergency (1122)',
      reason: 'Your symptoms may need immediate emergency care.',
      priority: 100,
    });
    push({
      type: 'book_doctor',
      label: 'Find nearest emergency care',
      reason: 'Emergency departments can evaluate acute symptoms now.',
      navigation: {
        tab: 'Home',
        screen: 'Services',
        params: { screen: 'ConsultHome' },
      },
      priority: 90,
    });
    return actions;
  }

  // ——— Symptom / observation journey ———
  if (intent === 'symptoms' || intent === 'emergency') {
    if (obs.chest || obs.breathlessness) {
      if (riskLevel === 'high' || riskLevel === 'medium') {
        push({
          type: 'book_lab',
          label: 'Book ECG + basic cardiac labs',
          reason: 'Chest or breathing symptoms with risk factors need testing.',
          navigation: labNav(),
          priority: 88,
        });
      }
      push({
        type: 'book_doctor',
        label: `Book ${specialty || 'Cardiologist'}`,
        reason: 'A specialist should review chest-related symptoms.',
        navigation: doctorNav(specialty || 'Cardiology'),
        priority: 86,
      });
      push({
        type: 'health_plan',
        label: 'Stop activity & rest upright',
        reason:
          'Avoid exertion. Sit upright, loosen tight clothing, and seek care if pain worsens.',
        navigation: healthNav(),
        priority: 55,
      });
    } else if (obs.fever) {
      push({
        type: 'health_plan',
        label: 'Fever rest & hydration plan',
        reason:
          'Rest, sip fluids often, and check temperature every 4–6 hours for 24 hours.',
        navigation: healthNav(),
        priority: 82,
      });
      push({
        type: 'order_medicine',
        label: 'Browse fever-care medicines',
        reason:
          'Pharmacy options for fever comfort (use only as labeled; ask a pharmacist if unsure).',
        navigation: medsNav({ category: 'fever' }),
        priority: 74,
      });
      if (!obs.highTemp && riskLevel === 'low') {
        push({
          type: 'health_plan',
          label: 'Light recovery movement',
          reason:
            'Skip intense workouts. Short indoor walks are fine once fever eases.',
          navigation: healthNav(),
          priority: 58,
        });
      }
      if (
        riskLevel === 'medium' ||
        riskLevel === 'high' ||
        obs.durationLong ||
        obs.highTemp
      ) {
        push({
          type: 'book_doctor',
          label: 'Book GP today',
          reason: 'Persistent or high fever should be reviewed by a doctor.',
          navigation: doctorNav('General Physician'),
          priority: 80,
        });
        push({
          type: 'book_lab',
          label: 'Book CBC / infection labs',
          reason: 'Blood tests help clarify prolonged fever.',
          navigation: labNav(),
          priority: 70,
        });
      }
    } else if (obs.cough || obs.cold) {
      push({
        type: 'health_plan',
        label: 'Cough & cold recovery plan',
        reason:
          'Warm fluids, steam inhalation, and rest. Avoid smoke and cold drinks.',
        navigation: healthNav(),
        priority: 80,
      });
      push({
        type: 'order_medicine',
        label: 'Browse cough & cold care',
        reason:
          'OTC syrups, lozenges, and saline sprays — confirm suitability with a pharmacist.',
        navigation: medsNav({ category: 'cough' }),
        priority: 72,
      });
      push({
        type: 'health_plan',
        label: 'Breathing & gentle mobility',
        reason:
          'Try slow deep breaths and short walks; pause if breathlessness increases.',
        navigation: healthNav(),
        priority: 60,
      });
      if (riskLevel !== 'low' || obs.durationLong) {
        push({
          type: 'book_doctor',
          label: 'Book GP / chest review',
          reason: 'Ongoing cough may need clinical assessment.',
          navigation: doctorNav('General Physician'),
          priority: 76,
        });
      }
    } else if (obs.headache) {
      push({
        type: 'health_plan',
        label: 'Headache relief routine',
        reason:
          'Rest in a dark quiet room, hydrate, and limit screens for a few hours.',
        navigation: healthNav(),
        priority: 80,
      });
      push({
        type: 'order_medicine',
        label: 'Browse headache relief',
        reason:
          'Pharmacy pain-relief options — follow label dosing and avoid if allergic.',
        navigation: medsNav({ category: 'pain' }),
        priority: 70,
      });
      push({
        type: 'health_plan',
        label: 'Neck stretch & posture reset',
        reason:
          'Gentle neck rolls and shoulder stretches can ease tension headaches.',
        navigation: healthNav(),
        priority: 58,
      });
      if (riskLevel !== 'low' || obs.durationLong) {
        push({
          type: 'book_doctor',
          label: 'Book a doctor',
          reason: 'Severe or lasting headaches need clinical review.',
          navigation: doctorNav(specialty || 'Neurology'),
          priority: 75,
        });
      }
    } else if (obs.stomach) {
      push({
        type: 'health_plan',
        label: 'Stomach-settling care plan',
        reason:
          'Small sips of ORS/water, bland foods, and rest. Avoid spicy/oily meals today.',
        navigation: healthNav(),
        priority: 80,
      });
      push({
        type: 'order_medicine',
        label: 'Browse digestive care',
        reason:
          'ORS, antacids, and related pharmacy items — check labels before use.',
        navigation: medsNav({ category: 'digestive' }),
        priority: 72,
      });
      if (riskLevel !== 'low' || obs.durationLong) {
        push({
          type: 'book_doctor',
          label: 'Book GP',
          reason: 'Ongoing stomach symptoms may need examination.',
          navigation: doctorNav('General Physician'),
          priority: 74,
        });
      }
    } else if (obs.fatigue || obs.mental) {
      push({
        type: 'health_plan',
        label: 'Energy & sleep reset plan',
        reason:
          'Aim for consistent sleep, hydration, and 20–30 minutes of daylight walking.',
        navigation: healthNav(),
        priority: 78,
      });
      push({
        type: 'health_plan',
        label: 'Low-impact exercise starter',
        reason:
          'Light walking or stretching 3–4 days/week — stop if you feel faint or breathless.',
        navigation: healthNav(),
        priority: 65,
      });
      push({
        type: 'book_doctor',
        label: 'Discuss with a doctor',
        reason: 'Persistent fatigue can need labs and a clinical check.',
        navigation: doctorNav('General Physician'),
        priority: 60,
      });
    } else if (obs.pain) {
      push({
        type: 'health_plan',
        label: 'Pain pacing & rest plan',
        reason:
          'Alternate rest with gentle movement; avoid heavy lifting until pain eases.',
        navigation: healthNav(),
        priority: 78,
      });
      push({
        type: 'order_medicine',
        label: 'Browse pain-care options',
        reason:
          'Pharmacy pain-relief and topical options — use only as directed on the label.',
        navigation: medsNav({ category: 'pain' }),
        priority: 70,
      });
      push({
        type: 'book_doctor',
        label: riskLevel === 'low' ? 'See a doctor if it persists' : 'Book a doctor',
        reason: 'A clinician can assess the cause of your pain.',
        navigation: doctorNav(specialty || 'General Physician'),
        priority: riskLevel === 'low' ? 55 : 78,
      });
    } else if (obs.skin) {
      push({
        type: 'order_medicine',
        label: 'Browse skin-care pharmacy',
        reason: 'Soothing lotions and allergy-care items from partner pharmacies.',
        navigation: medsNav({ category: 'skin' }),
        priority: 70,
      });
      push({
        type: 'book_doctor',
        label: 'Book GP / dermatology',
        reason: 'Rashes with fever or spreading marks need clinical review.',
        navigation: doctorNav('Dermatology'),
        priority: 68,
      });
    } else {
      // Generic symptom observation — still give a useful mix
      push({
        type: 'health_plan',
        label: 'Rest, fluids & monitor plan',
        reason:
          'Rest today, drink water regularly, and note if symptoms worsen overnight.',
        navigation: healthNav(),
        priority: 76,
      });
      push({
        type: 'order_medicine',
        label: 'Browse supportive medicines',
        reason:
          'Find pharmacy essentials matched to common symptom care (not a prescription).',
        navigation: medsNav(),
        priority: 68,
      });
      push({
        type: 'health_plan',
        label: 'Gentle recovery exercise',
        reason:
          'Short walks and light stretching once you feel stable — avoid intense workouts.',
        navigation: healthNav(),
        priority: 58,
      });
      push({
        type: 'book_doctor',
        label: 'Book a doctor',
        reason: 'Get a clinical opinion if symptoms continue or worry you.',
        navigation: doctorNav(specialty || 'General Physician'),
        priority: riskLevel === 'low' ? 52 : 75,
      });
    }

    // Profile-aware extras
    if (context.currentMedicines.length > 0 && riskLevel !== 'high') {
      push({
        type: 'schedule_reminder',
        label: 'Review your current medicines',
        reason: `You have ${context.currentMedicines.length} medicine(s) on file — check dosing while you recover.`,
        navigation: medsNav(),
        priority: 48,
      });
    }
  }

  if (intent === 'medicine') {
    push({
      type: 'schedule_reminder',
      label: 'Set medicine reminder',
      reason: 'Reminders improve adherence and reduce missed doses.',
      navigation: medsNav(),
      priority: 70,
    });
    push({
      type: 'order_medicine',
      label: 'Order medicines',
      reason: 'Refill prescriptions from verified pharmacies.',
      navigation: medsNav(),
      priority: 65,
    });
    push({
      type: 'compare_prices',
      label: 'Compare prices',
      reason: 'Find the best price across partner pharmacies.',
      navigation: medsNav(),
      priority: 50,
    });
  }

  if (intent === 'lab' || intent === 'report') {
    push({
      type: 'book_lab',
      label: 'Book recommended lab tests',
      reason: 'Home collection available for most tests.',
      navigation: labNav(),
      priority: 75,
    });
    if (intent === 'report') {
      push({
        type: 'book_doctor',
        label: 'Discuss results with doctor',
        reason: 'A doctor can interpret values in your full clinical context.',
        navigation: doctorNav(),
        priority: 60,
      });
    }
  }

  if (intent === 'doctor' || intent === 'appointment') {
    push({
      type: 'book_doctor',
      label: 'See top matched doctors',
      reason: 'Matched by specialty, availability, and your health profile.',
      navigation: doctorNav(specialty),
      priority: 80,
    });
  }

  if (intent === 'family') {
    push({
      type: 'family_notification',
      label: 'Check family health',
      reason: 'Review medicines, vaccinations, and lab trends for linked family.',
      navigation: { tab: 'Health', screen: 'FamilyProfiles' },
      priority: 70,
    });
  }

  if (intent === 'prescription') {
    push({
      type: 'order_medicine',
      label: 'Order from prescription',
      reason: 'Upload your prescription and order medicines in one flow.',
      navigation: medsNav(),
      priority: 75,
    });
    push({
      type: 'auto_refill',
      label: 'Enable auto-refill',
      reason: 'Never run out of chronic medicines again.',
      priority: 55,
    });
  }

  if (
    intent === 'health_advice' ||
    intent === 'vaccination' ||
    intent === 'lifestyle'
  ) {
    const wantsBack =
      /\bback|spine|kamar|lumbar\b/i.test(message) ||
      /\bexercise|stretch|mobility|physio\b/i.test(message);

    if (wantsBack) {
      push({
        type: 'health_plan',
        label: 'Save this mobility plan',
        reason: 'Keep gentle walk + stretch habits in your Health tab.',
        navigation: healthNav(),
        priority: 85,
      });
      push({
        type: 'book_doctor',
        label: 'Book orthopedic / physio consult',
        reason: 'Persistent or worsening back pain deserves a clinical exam.',
        navigation: doctorNav('Orthopedic'),
        priority: 70,
      });
      push({
        type: 'follow_up_reminder',
        label: 'Remind me to recheck in 3 days',
        reason: 'If pain is not easing with gentle mobility, escalate care.',
        priority: 55,
      });
    } else {
      push({
        type: 'health_plan',
        label: 'View preventive care plan',
        reason: 'Personalized screenings and wellness tasks based on your profile.',
        navigation: healthNav(),
        priority: 60,
      });
      push({
        type: 'health_plan',
        label: 'Weekly exercise starter',
        reason: 'Build a simple walk + stretch routine aligned with your fitness level.',
        navigation: healthNav(),
        priority: 55,
      });
      push({
        type: 'follow_up_reminder',
        label: 'Schedule follow-up',
        reason: 'Stay on track with checkups and screenings.',
        priority: 50,
      });
    }
  }

  if (actions.length === 0) {
    push({
      type: 'book_doctor',
      label: 'Book a doctor',
      reason: 'A clinician can help with your specific concern.',
      navigation: doctorNav(),
      priority: 50,
    });
    push({
      type: 'order_medicine',
      label: 'Browse medicines',
      reason: 'Find pharmacy support while you decide next steps.',
      navigation: medsNav(),
      priority: 45,
    });
    push({
      type: 'book_lab',
      label: 'Book a lab test',
      reason: 'Lab tests help clarify many health questions.',
      navigation: labNav(),
      priority: 42,
    });
  }

  // Deduplicate by label, keep highest priority, return top 4
  const byLabel = new Map<string, CopilotAction>();
  for (const action of actions) {
    const existing = byLabel.get(action.label);
    if (!existing || action.priority > existing.priority) {
      byLabel.set(action.label, action);
    }
  }

  return [...byLabel.values()]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4);
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
    lines.push('Based on your observation, here is what I recommend next:');
  }

  if (reasoning.length) {
    lines.push('');
    reasoning.forEach(r => lines.push(`• ${r}`));
  }

  if (actions.length && riskLevel !== 'critical') {
    lines.push('');
    lines.push(
      'Pick a next step below — rest plan, medicines, exercise guidance, labs, or a doctor.',
    );
  }

  return lines.join('\n');
}

/**
 * Direct exercise / mobility reply (no chest-pain questionnaire).
 * Educational only — not a physio prescription.
 */
export function buildExerciseGuidanceText(message: string): string {
  const isBack = /\bback|spine|kamar|lumbar|neck\b/i.test(message);

  const lines: string[] = [];

  if (isBack) {
    lines.push('Here are gentle mobility ideas often used for mild mechanical back discomfort:');
    lines.push('');
    lines.push('1. Short walks — 5–10 minutes, a few times a day, within comfort.');
    lines.push('2. Pelvic tilts — lie on your back, knees bent; gently flatten then release the lower back (8–10 slow reps).');
    lines.push('3. Knee-to-chest — hug one knee toward the chest, 20–30 seconds each side (skip if it increases pain).');
    lines.push('4. Cat–camel — on hands and knees, slowly round then gently arch the spine (6–8 slow reps).');
    lines.push('');
    lines.push('Stop and seek care if you get new leg weakness, numbness in the saddle area, or bladder/bowel changes.');
  } else {
    lines.push('Here is a simple starter mobility routine:');
    lines.push('');
    lines.push('1. Easy walk — 10–15 minutes at a pace you can talk through.');
    lines.push('2. Gentle shoulder rolls and neck mobility (no forcing).');
    lines.push('3. Hip openers / light stretches within a pain-free range.');
    lines.push('4. Rest days between harder sessions; hydrate.');
    lines.push('');
    lines.push('Stop if you feel chest pain, dizziness, or unusual shortness of breath.');
  }

  lines.push('');
  lines.push(
    'These are general educational suggestions, not a treatment plan. A clinician or physiotherapist can personalize this for you.',
  );

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
  } else if (/\bcough|cold|flu\b/i.test(message)) {
    tests.push('CBC', 'CRP');
  } else if (/\bfatigue|tired\b/i.test(message)) {
    tests.push('CBC', 'TSH', 'Vitamin D', 'Ferritin');
  }
  return tests;
}

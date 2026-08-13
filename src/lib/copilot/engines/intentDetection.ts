import type { CopilotIntent } from '../types';

type IntentRule = { intent: CopilotIntent; patterns: RegExp[]; priority: number };

const RULES: IntentRule[] = [
  {
    intent: 'emergency',
    priority: 100,
    patterns: [
      /\b(emergency|1122|ambulance|can't breathe|cannot breathe|unconscious|severe bleeding)\b/i,
    ],
  },
  {
    intent: 'symptoms',
    priority: 90,
    patterns: [
      /\b(pain|chest|fever|headache|cough|dizzy|nausea|vomit|symptom|hurt|ache|breath)\b/i,
    ],
  },
  {
    intent: 'medicine',
    priority: 80,
    patterns: [
      /\b(medicine|medication|pill|dose|missed|refill|reminder|adherence|tablet)\b/i,
    ],
  },
  {
    intent: 'prescription',
    priority: 75,
    patterns: [/\b(prescription|rx|upload prescription)\b/i],
  },
  {
    intent: 'lab',
    priority: 70,
    patterns: [/\b(lab test|blood test|book lab|home collection|sample)\b/i],
  },
  {
    intent: 'report',
    priority: 68,
    patterns: [/\b(lab report|test result|explain my report|cbc|hba1c|lipid|ecg)\b/i],
  },
  {
    intent: 'doctor',
    priority: 65,
    patterns: [
      /\b(doctor|specialist|cardiolog|dermatolog|gp|physician|consult)\b/i,
    ],
  },
  {
    intent: 'appointment',
    priority: 60,
    patterns: [/\b(appointment|follow.?up|reschedule|cancel booking)\b/i],
  },
  {
    intent: 'mental_health',
    priority: 55,
    patterns: [/\b(anxiety|depression|stress|mental|sleep trouble|insomnia)\b/i],
  },
  {
    intent: 'lifestyle',
    priority: 50,
    patterns: [/\b(diet|exercise|smoke|alcohol|weight|sleep|walk|water)\b/i],
  },
  {
    intent: 'vaccination',
    priority: 45,
    patterns: [/\b(vaccin|immuniz|flu shot|covid shot)\b/i],
  },
  {
    intent: 'family',
    priority: 40,
    patterns: [/\b(family|mother|father|child|parent|spouse)\b/i],
  },
  {
    intent: 'insurance',
    priority: 35,
    patterns: [/\b(insurance|coverage|claim|panel)\b/i],
  },
  {
    intent: 'health_advice',
    priority: 30,
    patterns: [/\b(prevent|screening|checkup|annual|wellness|tip)\b/i],
  },
];

export function detectIntent(message: string): CopilotIntent {
  const trimmed = message.trim();
  if (!trimmed) return 'general';

  let best: { intent: CopilotIntent; priority: number } | null = null;

  for (const rule of RULES) {
    if (rule.patterns.some(p => p.test(trimmed))) {
      if (!best || rule.priority > best.priority) {
        best = { intent: rule.intent, priority: rule.priority };
      }
    }
  }

  return best?.intent ?? 'general';
}

export function getSpecialtyForIntent(intent: CopilotIntent, message: string): string | undefined {
  const lower = message.toLowerCase();
  if (/\bchest|heart|cardio\b/i.test(lower)) return 'Cardiology';
  if (/\bskin|rash|acne\b/i.test(lower)) return 'Dermatology';
  if (/\bstomach|gut|digest\b/i.test(lower)) return 'Gastroenterology';
  if (/\bchild|baby|pediatr\b/i.test(lower)) return 'Pediatrics';
  if (intent === 'mental_health') return 'Psychiatry';
  if (intent === 'symptoms' && /\bfever|cough\b/i.test(lower)) return 'General Physician';
  return undefined;
}

export function getUrgencyHint(intent: CopilotIntent, message: string): 'routine' | 'soon' | 'urgent' {
  if (intent === 'emergency') return 'urgent';
  if (/\bchest pain|crushing|arm pain|shortness of breath\b/i.test(message)) return 'urgent';
  if (intent === 'symptoms') return 'soon';
  return 'routine';
}

import type {
  CopilotIntent,
  DifferentialHypothesis,
  HealthContext,
  RiskLevel,
} from '../types';

export type RiskAssessment = {
  level: RiskLevel;
  score: number;
  factors: string[];
  reasoning: string[];
  differentials: DifferentialHypothesis[];
};

const MEDICAL_DISCLAIMER =
  'These are educational hypotheses only — not a diagnosis. Only a qualified clinician can diagnose and treat you.';

export { MEDICAL_DISCLAIMER };

export function assessRisk(
  intent: CopilotIntent,
  message: string,
  answers: Record<string, string>,
  context: HealthContext,
): RiskAssessment {
  const factors: string[] = [];
  const reasoning: string[] = [];
  let score = 0;

  const lower = message.toLowerCase();
  const isChestPain = /\bchest\b/i.test(lower) || /\bchest\b/i.test(answers.location || '');

  if (intent === 'emergency') {
    return criticalAssessment(['Explicit emergency request'], message);
  }

  if (isChestPain) {
    score += 30;
    factors.push('Chest pain reported');
    reasoning.push('Chest pain requires careful cardiovascular assessment.');

    if (answers.radiation === 'Yes') {
      score += 20;
      factors.push('Pain radiates to arm/jaw/neck');
    }
    if (answers.breathlessness === 'Yes') {
      score += 20;
      factors.push('Shortness of breath');
    }
    if (answers.sweating === 'Yes') {
      score += 15;
      factors.push('Sweating or clammy feeling');
    }
    if (answers.severity?.includes('9') || answers.severity?.includes('Worst')) {
      score += 25;
      factors.push('Severe pain (9–10)');
    }
    if (context.conditions.some(c => /diabetes|heart|hypertension/i.test(c))) {
      score += 15;
      factors.push('Cardiovascular risk condition on file');
      reasoning.push('Diabetes and heart conditions increase cardiovascular risk with chest pain.');
    }
    if (context.personal.age && context.personal.age >= 45) {
      score += 10;
      factors.push(`Age ${context.personal.age}`);
    }
    if (context.lifestyle.smoking || answers.smoking === 'Yes') {
      score += 10;
      factors.push('Smoking history');
    }
    if (answers.onset === 'Just now' || answers.onset === 'Within the last hour') {
      score += 10;
      factors.push('Sudden onset');
    }

    const differentials = buildChestPainDifferentials(score);
    return {
      level: scoreToLevel(score),
      score,
      factors,
      reasoning,
      differentials,
    };
  }

  if (/\bfever\b/i.test(lower)) {
    if (answers.temperature?.includes('Above 39')) {
      score += 25;
      factors.push('High fever above 39°C');
    }
    if (answers.duration === 'More than 3 days') {
      score += 15;
      factors.push('Fever lasting more than 3 days');
    }
    return {
      level: scoreToLevel(score),
      score,
      factors,
      reasoning: score > 30 ? ['Persistent high fever needs medical review.'] : ['Most fevers resolve with rest and monitoring.'],
      differentials: [
        { condition: 'Viral infection', confidence: 'medium' },
        { condition: 'Bacterial infection', confidence: 'low' },
      ],
    };
  }

  const isBackPain =
    /\bback|spine|kamar|lumbar\b/i.test(lower) ||
    /lower back|upper back|neck/i.test(answers.location || '');

  if (isBackPain) {
    if (answers.leg_symptoms === 'Yes') {
      score += 35;
      factors.push('Leg numbness, tingling, or weakness');
      reasoning.push('Neurological symptoms with back pain need prompt clinical review.');
    }
    if (answers.bladder_bowel === 'Yes') {
      score += 50;
      factors.push('Bladder or bowel control change');
      reasoning.push('New bladder/bowel changes with back pain can be an emergency.');
    }
    if (answers.severity?.includes('9') || answers.severity?.includes('Worst') || answers.severity?.includes('7–8')) {
      score += 20;
      factors.push('Severe back pain');
    }
    return {
      level: scoreToLevel(score),
      score,
      factors,
      reasoning:
        reasoning.length > 0
          ? reasoning
          : ['Many back pains are mechanical and improve with gentle movement and rest.'],
      differentials: [
        { condition: 'Mechanical / muscle strain', confidence: 'medium' },
        { condition: 'Disc-related irritation', confidence: 'low' },
      ],
    };
  }

  if (intent === 'lifestyle') {
    return {
      level: 'low',
      score: 5,
      factors: ['Lifestyle / exercise request'],
      reasoning: ['No emergency red flags detected from your message.'],
      differentials: [],
    };
  }

  if (intent === 'mental_health') {
    if (/\bsuicid|kill myself|end my life\b/i.test(lower)) {
      return criticalAssessment(['Possible self-harm language'], message);
    }
    return {
      level: 'medium',
      score: 40,
      factors: ['Mental health concern'],
      reasoning: ['Professional support can help — you are not alone.'],
      differentials: [],
    };
  }

  return {
    level: 'low',
    score,
    factors,
    reasoning: ['No immediate red flags detected from your message.'],
    differentials: [],
  };
}

function scoreToLevel(score: number): RiskLevel {
  if (score >= 70) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

function criticalAssessment(factors: string[], _message: string): RiskAssessment {
  return {
    level: 'critical',
    score: 100,
    factors,
    reasoning: [
      'This may be a medical emergency.',
      'Do not wait for chat — seek emergency care immediately.',
    ],
    differentials: [
      { condition: 'Possible acute emergency', confidence: 'high', note: 'Requires immediate evaluation' },
    ],
  };
}

function buildChestPainDifferentials(score: number): DifferentialHypothesis[] {
  const list: DifferentialHypothesis[] = [
    { condition: 'Muscle strain', confidence: 'low' },
    { condition: 'Acid reflux (GERD)', confidence: 'medium' },
    { condition: 'Angina', confidence: score >= 40 ? 'medium' : 'low' },
  ];
  if (score >= 50) {
    list.push({
      condition: 'Heart attack (possible)',
      confidence: score >= 70 ? 'high' : 'medium',
      note: 'Emergency evaluation recommended',
    });
  }
  return list;
}

export function riskLevelLabel(level: RiskLevel): string {
  switch (level) {
    case 'critical':
      return 'Critical — Emergency';
    case 'high':
      return 'High urgency';
    case 'medium':
      return 'Moderate urgency';
    default:
      return 'Low urgency';
  }
}

export function riskLevelColor(level: RiskLevel): string {
  switch (level) {
    case 'critical':
      return '#DC2626';
    case 'high':
      return '#EA580C';
    case 'medium':
      return '#CA8A04';
    default:
      return '#16A34A';
  }
}

import type { CopilotIntent, CopilotQuestion, HealthContext } from '../types';
import { wantsExerciseGuidance } from './intentDetection';

type QuestionTemplate = {
  id: string;
  text: string;
  options?: string[];
  /** Skip if context already provides this */
  skipIfKnown?: (ctx: HealthContext, answers: Record<string, string>) => boolean;
};

const CHEST_PAIN_QUESTIONS: QuestionTemplate[] = [
  {
    id: 'location',
    text: 'Where exactly do you feel the pain or discomfort?',
    options: ['Chest center', 'Left chest', 'Right chest', 'Upper abdomen', 'Other'],
  },
  {
    id: 'onset',
    text: 'When did this start?',
    options: ['Just now', 'Within the last hour', 'Today', 'A few days ago', 'Over a week ago'],
  },
  {
    id: 'radiation',
    text: 'Does the pain spread to your arm, jaw, neck, or back?',
    options: ['Yes', 'No', 'Not sure'],
  },
  {
    id: 'severity',
    text: 'How severe is it on a scale of 1–10?',
    options: ['1–3 Mild', '4–6 Moderate', '7–8 Severe', '9–10 Worst ever'],
  },
  {
    id: 'breathlessness',
    text: 'Do you have shortness of breath?',
    options: ['Yes', 'No'],
  },
  {
    id: 'sweating',
    text: 'Are you sweating unusually or feeling clammy?',
    options: ['Yes', 'No'],
  },
  {
    id: 'nausea',
    text: 'Do you feel nauseous or have you vomited?',
    options: ['Yes', 'No'],
  },
  {
    id: 'heart_history',
    text: 'Do you have a history of heart disease?',
    skipIfKnown: ctx =>
      ctx.conditions.some(c => /heart|cardio|angina/i.test(c)),
  },
  {
    id: 'smoking',
    text: 'Do you smoke or have you smoked recently?',
    skipIfKnown: ctx => ctx.lifestyle.smoking !== undefined,
  },
  {
    id: 'bp_recent',
    text: 'Do you know your recent blood pressure reading?',
    options: ['Normal', 'High', 'Low', 'Not sure'],
  },
];

const BACK_PAIN_QUESTIONS: QuestionTemplate[] = [
  {
    id: 'location',
    text: 'Where is the back pain mainly located?',
    options: ['Lower back', 'Upper back', 'Neck', 'Side of back', 'Whole back'],
  },
  {
    id: 'onset',
    text: 'When did this start?',
    options: ['Today', 'A few days ago', 'About a week', 'Over a week ago'],
  },
  {
    id: 'severity',
    text: 'How severe is it on a scale of 1–10?',
    options: ['1–3 Mild', '4–6 Moderate', '7–8 Severe', '9–10 Worst ever'],
  },
  {
    id: 'leg_symptoms',
    text: 'Any numbness, tingling, or weakness in your legs?',
    options: ['Yes', 'No', 'Not sure'],
  },
  {
    id: 'bladder_bowel',
    text: 'Any new trouble controlling bladder or bowel?',
    options: ['Yes', 'No'],
  },
];

const GENERAL_PAIN_QUESTIONS: QuestionTemplate[] = [
  {
    id: 'location',
    text: 'Where do you feel the pain or discomfort?',
    options: ['Head', 'Throat', 'Abdomen', 'Back', 'Joints / limbs', 'Other'],
  },
  {
    id: 'onset',
    text: 'When did this start?',
    options: ['Just now', 'Today', 'A few days ago', 'Over a week ago'],
  },
  {
    id: 'severity',
    text: 'How severe is it on a scale of 1–10?',
    options: ['1–3 Mild', '4–6 Moderate', '7–8 Severe', '9–10 Worst ever'],
  },
];

const FEVER_QUESTIONS: QuestionTemplate[] = [
  {
    id: 'duration',
    text: 'How long have you had the fever?',
    options: ['Less than 24 hours', '1–3 days', 'More than 3 days'],
  },
  {
    id: 'temperature',
    text: 'Do you know your temperature?',
    options: ['Below 38°C', '38–39°C', 'Above 39°C', 'Not measured'],
  },
  {
    id: 'other_symptoms',
    text: 'Any other symptoms?',
    options: ['Cough', 'Body aches', 'Rash', 'None'],
  },
];

const MEDICINE_QUESTIONS: QuestionTemplate[] = [
  {
    id: 'which_medicine',
    text: 'Which medicine do you need help with?',
  },
  {
    id: 'missed_when',
    text: 'When was your last dose?',
    options: ['On time', 'Missed today', 'Missed yesterday', 'Several days'],
  },
];

const REPORT_QUESTIONS: QuestionTemplate[] = [
  {
    id: 'report_type',
    text: 'Which report would you like me to explain?',
    options: ['CBC', 'HbA1c', 'Lipid profile', 'Vitamin D', 'ECG', 'Other'],
  },
];

function isChestRelated(message: string): boolean {
  return /\bchest|heart|cardio|angina\b/i.test(message);
}

function isBackRelated(message: string): boolean {
  return /\bback|spine|kamar|lumbar|neck pain\b/i.test(message);
}

export function getQuestionsForIntent(
  intent: CopilotIntent,
  message: string,
  context: HealthContext,
  existingAnswers: Record<string, string>,
): CopilotQuestion[] {
  let templates: QuestionTemplate[] = [];

  // Exercise / lifestyle: answer directly — no chest-style questionnaire
  if (intent === 'lifestyle' || wantsExerciseGuidance(message)) {
    return [];
  }

  if (intent === 'symptoms') {
    if (/\bfever\b/i.test(message)) {
      templates = FEVER_QUESTIONS;
    } else if (isChestRelated(message)) {
      templates = CHEST_PAIN_QUESTIONS;
    } else if (isBackRelated(message)) {
      templates = BACK_PAIN_QUESTIONS;
    } else if (/\bpain|ache|hurt|sore\b/i.test(message)) {
      templates = GENERAL_PAIN_QUESTIONS;
    } else {
      templates = GENERAL_PAIN_QUESTIONS;
    }
  } else if (intent === 'medicine') {
    templates = MEDICINE_QUESTIONS;
  } else if (intent === 'report') {
    templates = REPORT_QUESTIONS;
  } else if (intent === 'doctor') {
    templates = [
      {
        id: 'concern',
        text: 'What is your main health concern today?',
        options: ['New symptoms', 'Follow-up', 'Second opinion', 'Prescription renewal'],
      },
      {
        id: 'specialty_pref',
        text: 'Do you prefer a specific type of doctor?',
        options: ['General Physician', 'Specialist', 'No preference'],
      },
    ];
  }

  return templates
    .filter(t => !t.skipIfKnown?.(context, existingAnswers))
    .filter(t => !(t.id in existingAnswers))
    .map(({ id, text, options }) => ({ id, text, options }));
}

export function getNextQuestion(
  questions: CopilotQuestion[],
  index: number,
): CopilotQuestion | null {
  return questions[index] ?? null;
}

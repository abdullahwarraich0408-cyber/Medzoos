/** Health-focused group templates for Medzoos / medCare */

export type GroupTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  weeklyTopic: string;
  focus: string;
};

export const HEALTH_GROUP_TEMPLATES: GroupTemplate[] = [
  {
    id: 'diabetes',
    name: 'Diabetes Support',
    description:
      'Share glucose tips, meal plans, and daily wins. Ask questions and learn from others managing diabetes.',
    icon: 'water',
    weeklyTopic: 'What helped you keep sugar stable this week?',
    focus: 'Chronic care',
  },
  {
    id: 'heart',
    name: 'Heart Health Circle',
    description:
      'Blood pressure, cholesterol, and lifestyle changes. Debate diet vs medication approaches respectfully.',
    icon: 'heart-pulse',
    weeklyTopic: 'Best habits for a healthier heart',
    focus: 'Cardiovascular',
  },
  {
    id: 'mental',
    name: 'Mental Wellness',
    description:
      'A safe space for stress, anxiety, and burnout. Share coping strategies — not medical prescriptions.',
    icon: 'brain',
    weeklyTopic: 'One thing that improved your mood lately',
    focus: 'Mental health',
  },
  {
    id: 'nutrition',
    name: 'Healthy Eating Pakistan',
    description:
      'Local food swaps, Ramadan fasting tips, and affordable nutrition. Recipe ideas welcome.',
    icon: 'food-apple',
    weeklyTopic: 'Your go-to healthy desi meal',
    focus: 'Nutrition',
  },
  {
    id: 'fitness',
    name: 'Move More Daily',
    description:
      'Steps, home workouts, and accountability. Celebrate progress without comparison.',
    icon: 'run',
    weeklyTopic: 'How many steps did you hit this week?',
    focus: 'Fitness',
  },
  {
    id: 'moms',
    name: 'Parents & Kids Health',
    description:
      'Vaccines, fever care, school illness, and parenting questions. Support for caregivers.',
    icon: 'baby-face',
    weeklyTopic: 'A health tip every parent should know',
    focus: 'Family',
  },
  {
    id: 'medicine',
    name: 'Medicine & Adherence',
    description:
      'Remembering doses, side effects, and talking to your pharmacist. Peer support only — not a substitute for your doctor.',
    icon: 'pill',
    weeklyTopic: 'How do you never miss a dose?',
    focus: 'Pharmacy',
  },
  {
    id: 'labs',
    name: 'Lab Results Explained',
    description:
      'Discuss test prep, understanding reports, and when to follow up with a doctor.',
    icon: 'test-tube',
    weeklyTopic: 'What lab test confused you the most?',
    focus: 'Lab tests',
  },
];

/** Discussion types inside a health group */
export const GROUP_DISCUSSION_CATEGORIES = [
  'Question',
  'Debate',
  'Experience',
  'Advice',
  'Success Story',
  'Weekly Topic',
] as const;

export type GroupDiscussionCategory = (typeof GROUP_DISCUSSION_CATEGORIES)[number];

export function categoryHint(category: string): string {
  switch (category) {
    case 'Debate':
      return 'Share your view respectfully — others may disagree.';
    case 'Question':
      return 'Ask clearly so members can help.';
    case 'Experience':
      return 'What happened and what did you learn?';
    case 'Advice':
      return 'Tips that worked for you (not medical orders).';
    case 'Success Story':
      return 'Celebrate progress — inspire others.';
    case 'Weekly Topic':
      return 'Respond to this week\'s group theme.';
    default:
      return 'Share something helpful for the group.';
  }
}

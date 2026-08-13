import type { GamificationProfile } from './types';

export const MOCK_GAMIFICATION: GamificationProfile = {
  level: 12,
  xp: 2840,
  xpToNextLevel: 3200,
  coins: 450,
  healthScore: 78,
  aiSummary:
    'You are doing well with your medicine routine. One lab test is due this week. A short walk today would help.',
  missions: [
    {
      id: 'm1',
      title: 'Take morning medicines',
      icon: 'pill',
      xpReward: 15,
      completed: true,
      category: 'medicine',
    },
    {
      id: 'm2',
      title: 'Drink 8 glasses of water',
      icon: 'cup-water',
      xpReward: 10,
      completed: false,
      category: 'nutrition',
    },
    {
      id: 'm3',
      title: 'Walk 5,000 steps',
      icon: 'walk',
      xpReward: 20,
      completed: false,
      category: 'exercise',
    },
    {
      id: 'm4',
      title: 'Read one verified health article',
      icon: 'book-open-page-variant',
      xpReward: 10,
      completed: false,
      category: 'learning',
    },
  ],
  streaks: [
    { id: 's1', label: 'Medicine', count: 14, icon: 'pill' },
    { id: 's2', label: 'Check-in', count: 7, icon: 'calendar-check' },
    { id: 's3', label: 'Water', count: 5, icon: 'cup-water' },
  ],
  activeChallenges: [
    {
      id: 'c1',
      title: 'Walk 10,000 Steps',
      progress: 6200,
      target: 10000,
      unit: 'steps',
      icon: 'walk',
      color: '#059669',
    },
    {
      id: 'c2',
      title: 'Medicine Adherence',
      progress: 14,
      target: 30,
      unit: 'days',
      icon: 'pill',
      color: '#6366F1',
    },
  ],
  achievements: [
    { id: 'a1', title: 'First Consultation', icon: 'stethoscope', unlocked: true },
    { id: 'a2', title: '30-Day Medicine Streak', icon: 'fire', unlocked: false },
    { id: 'a3', title: 'First Lab Test', icon: 'flask', unlocked: true },
  ],
};

export const COPILOT_SUGGESTIONS = [
  'I have fever',
  'I need a dermatologist',
  'My blood sugar is high',
  'I missed my medicine',
  'Explain my lab report',
  'Book a lab test',
];

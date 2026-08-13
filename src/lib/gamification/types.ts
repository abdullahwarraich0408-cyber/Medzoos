export type DailyMission = {
  id: string;
  title: string;
  icon: string;
  xpReward: number;
  completed: boolean;
  category: 'medicine' | 'exercise' | 'nutrition' | 'sleep' | 'learning' | 'vitals';
};

export type UserStreak = {
  id: string;
  label: string;
  count: number;
  icon: string;
};

export type ChallengeProgress = {
  id: string;
  title: string;
  progress: number;
  target: number;
  unit: string;
  icon: string;
  color: string;
};

export type Achievement = {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
};

export type GamificationProfile = {
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  healthScore: number;
  aiSummary: string;
  missions: DailyMission[];
  streaks: UserStreak[];
  activeChallenges: ChallengeProgress[];
  achievements: Achievement[];
};

export type CommunityPost = {
  id: string;
  authorName: string;
  authorRole: 'user' | 'doctor' | 'nutritionist' | 'verified';
  authorAvatar?: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  isVerified: boolean;
  timeAgo: string;
};

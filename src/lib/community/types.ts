export type AuthorRole =
  | 'user'
  | 'doctor'
  | 'nutritionist'
  | 'physiotherapist'
  | 'psychologist'
  | 'lab'
  | 'pharmacy'
  | 'verified';

export type FeedFilter = 'all' | 'verified' | 'videos' | 'photos' | 'friends' | 'tips' | 'stories';

export type PostType = 'text' | 'video' | 'photo';

export type CommunityComment = {
  id: string;
  authorName: string;
  isAnonymous: boolean;
  content: string;
  timeAgo: string;
  isVerified?: boolean;
};

export type CommunityPost = {
  id: string;
  authorName: string;
  authorRole: AuthorRole;
  postType?: PostType;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  category: string;
  likes: number;
  comments: number;
  commentList: CommunityComment[];
  isVerified: boolean;
  isAnonymous: boolean;
  timeAgo: string;
  likedByMe?: boolean;
  healthContribution?: number;
  groupId?: string;
  groupName?: string;
};

export type HealthGroup = {
  id: string;
  name: string;
  description: string;
  icon: string;
  memberCount: number;
  postCount?: number;
  isJoined: boolean;
  isModerator?: boolean;
  moderators: string[];
  verifiedDoctors: string[];
  weeklyTopic?: string;
};

export type GroupMember = {
  id: string;
  name: string;
  role: string;
};

export type ChallengeParticipant = {
  id: string;
  name: string;
  progress: number;
  rank: number;
  isFriend?: boolean;
};

export type HealthChallenge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  progress: number;
  target: number;
  unit: string;
  daysLeft: number;
  isJoined: boolean;
  participants: number;
  leaderboard: ChallengeParticipant[];
  xpReward: number;
  badgeName: string;
  /** True after user claims XP/badge for completing the goal */
  rewardClaimed?: boolean;
  completedAt?: string;
};

export type HealthBuddy = {
  id: string;
  userId?: string;
  name: string;
  relation: 'friend' | 'family' | 'partner' | 'workout';
  streakDays: number;
  lastEncouragement?: string;
  isOnline?: boolean;
};

/** Someone you can add as a health buddy */
export type BuddySuggestion = {
  id: string;
  name: string;
  subtitle: string;
  source: 'group' | 'challenge' | 'community';
  healthLevel: number;
};

export type WeeklyReport = {
  weekLabel: string;
  healthScoreChange: number;
  medicineAdherence: number;
  stepsTotal: number;
  waterGlasses: number;
  sleepAverage: string;
  streakSummary: string;
  topAchievement: string;
  aiRecommendation: string;
};

export type CommunityProfile = {
  displayName: string;
  healthLevel: number;
  healthScore: number;
  xp: number;
  coins: number;
  followers: number;
  following: number;
  postsCount: number;
  contributionScore: number;
  /** Badge names earned from completed challenges */
  badges?: string[];
};

export type ModerationResult = {
  approved: boolean;
  reason?: string;
};

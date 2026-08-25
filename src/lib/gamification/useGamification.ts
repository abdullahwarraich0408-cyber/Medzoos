import { useCallback, useState } from 'react';
import type { GamificationProfile } from './types';

const EMPTY_GAMIFICATION: GamificationProfile = {
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  coins: 0,
  healthScore: 0,
  aiSummary: '',
  missions: [],
  streaks: [],
  activeChallenges: [],
  achievements: [],
};

export function useGamification() {
  const [profile, setProfile] = useState<GamificationProfile>(EMPTY_GAMIFICATION);

  const toggleMission = useCallback((missionId: string) => {
    setProfile(prev => {
      const missions = prev.missions.map(m => {
        if (m.id !== missionId || m.completed) return m;
        return { ...m, completed: true };
      });
      const completed = missions.find(m => m.id === missionId);
      const xpGain = completed?.completed && !prev.missions.find(m => m.id === missionId)?.completed
        ? completed.xpReward
        : 0;
      return {
        ...prev,
        missions,
        xp: prev.xp + xpGain,
      };
    });
  }, []);

  return {
    profile,
    toggleMission,
    refetch: () => setProfile(EMPTY_GAMIFICATION),
  };
}

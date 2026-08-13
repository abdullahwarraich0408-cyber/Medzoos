import { useCallback, useState } from 'react';
import { MOCK_GAMIFICATION } from './mockData';
import type { GamificationProfile } from './types';

export function useGamification() {
  const [profile, setProfile] = useState<GamificationProfile>(MOCK_GAMIFICATION);

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
    refetch: () => setProfile(MOCK_GAMIFICATION),
  };
}

import { useCallback, useMemo } from 'react';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useGamification } from '../../../lib/gamification/useGamification';
import { useHomeData } from '../../../lib/hooks/useHomeData';
import { useHealthDashboard } from '../../health/hooks/useHealthDashboard';

/** Stable hook bundle for the home dashboard — always call unconditionally. */
export function useHomeDashboardData() {
  const { user, isAuthenticated } = useAuth();
  const { profile, refetch: refetchGamification } = useGamification();
  const health = useHealthDashboard({ enabled: isAuthenticated });
  const homeData = useHomeData();
  const { refetchAll: refetchHealth } = health;

  const firstName = useMemo(() => {
    const name = user?.name?.trim();
    if (!name) return 'there';
    return name.split(' ')[0];
  }, [user?.name]);

  const refetchAll = useCallback(async () => {
    refetchHealth();
    await homeData.refetch();
    refetchGamification();
  }, [refetchHealth, homeData.refetch, refetchGamification]);

  return {
    user,
    firstName,
    profile,
    health,
    homeData,
    refetchAll,
  };
}

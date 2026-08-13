import { useMemo } from 'react';
import {
  useUserProfile,
  useFamilyVault,
  useFamilyDashboard,
  useLabReports,
  useLabTestBookings,
} from '../../../lib/hooks/useApi';
import { mergeProfileData } from '../../../lib/profile/profileData';
import type { LabBooking } from '../../../lib/mappers/labTest';

const ACTIVE_BOOKING_STATUSES = new Set([
  'pending',
  'confirmed',
  'collector_assigned',
  'sample_collected',
  'testing',
]);

function isUpcomingBooking(booking: LabBooking) {
  if (!booking.collectionDate) return false;
  if (booking.status && !ACTIVE_BOOKING_STATUSES.has(booking.status)) {
    return false;
  }
  const date = new Date(booking.collectionDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

/** Stable hook bundle for account/profile screens — always call unconditionally. */
export function useAccountHomeData(isAuthenticated: boolean) {
  const userProfileQuery = useUserProfile({ enabled: isAuthenticated });
  const vaultQuery = useFamilyVault({ enabled: isAuthenticated });
  const dashboardQuery = useFamilyDashboard({
    enabled: isAuthenticated && vaultQuery.data != null,
  });
  const bookingsQuery = useLabTestBookings({ enabled: isAuthenticated });
  const reportsQuery = useLabReports({ enabled: isAuthenticated });

  const profileData = useMemo(
    () => mergeProfileData(userProfileQuery.data?.profile_data),
    [userProfileQuery.data?.profile_data],
  );

  const familyCount =
    dashboardQuery.data?.members?.length ?? vaultQuery.data?.members?.length ?? 0;
  const familyScore = dashboardQuery.data?.overall_score;

  const upcomingBookings = useMemo(
    () => (bookingsQuery.data || []).filter(isUpcomingBooking),
    [bookingsQuery.data],
  );

  const recentReports = useMemo(
    () => (reportsQuery.data || []).slice(0, 3),
    [reportsQuery.data],
  );

  const healthSummary = useMemo(() => {
    const upcoming = upcomingBookings[0];
    let upcomingVisit = 'Tomorrow';
    if (upcoming?.collectionDate) {
      const date = new Date(upcoming.collectionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (date.toDateString() === today.toDateString()) upcomingVisit = 'Today';
      else if (date.toDateString() === tomorrow.toDateString()) upcomingVisit = 'Tomorrow';
      else {
        upcomingVisit = date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
      }
    } else if (upcomingBookings.length === 0) {
      upcomingVisit = 'None';
    }

    return {
      medicinesDue: 2,
      reportsReady: recentReports.length || 1,
      upcomingVisit,
    };
  }, [recentReports.length, upcomingBookings]);

  return {
    profileUser: userProfileQuery.data,
    profileData,
    vault: vaultQuery.data,
    dashboard: dashboardQuery.data,
    familyCount,
    familyScore,
    healthSummary,
    isProfileLoading: userProfileQuery.isLoading,
  };
}

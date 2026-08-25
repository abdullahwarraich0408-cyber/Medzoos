import { useCallback, useMemo } from 'react';
import {
  useAllOrders,
  useLabReports,
  useLabTestBookings,
  useLabTests,
  useUserProfile,
} from '../../../lib/hooks/useApi';
import type { LabBooking } from '../../../lib/mappers/labTest';
import type { UnifiedOrder } from '../../../lib/mappers/order';
import { mergeProfileData } from '../../../lib/profile/profileData';
import type { ReportTrend } from '../data/healthData';

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

function formatMonthKey(dateString?: string) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function useHealthDashboard(options: { enabled?: boolean } = {}) {
  const enabled = options.enabled !== false;

  const bookingsQuery = useLabTestBookings({ enabled });
  const reportsQuery = useLabReports({ enabled });
  const ordersQuery = useAllOrders({ enabled });
  const userQuery = useUserProfile({ enabled });
  const testsQuery = useLabTests();

  const profileData = useMemo(
    () => mergeProfileData(userQuery.data?.profile_data),
    [userQuery.data?.profile_data],
  );

  const upcomingBookings = useMemo(
    () => (bookingsQuery.data || []).filter(isUpcomingBooking),
    [bookingsQuery.data],
  );

  const recentReports = useMemo(
    () => (reportsQuery.data || []).slice(0, 3),
    [reportsQuery.data],
  );

  const allReports = reportsQuery.data || [];

  const reportTrends = useMemo((): ReportTrend[] => {
    // Trends require numeric series from the API; do not fabricate values.
    return [];
  }, []);

  const timelineByMonth = useMemo(() => {
    const orders = ordersQuery.data || [];
    const groups = new Map<string, UnifiedOrder[]>();

    orders.forEach(order => {
      const key = formatMonthKey(order.sortDate || order.date);
      const list = groups.get(key) || [];
      list.push(order);
      groups.set(key, list);
    });

    return Array.from(groups.entries()).map(([month, events]) => ({
      month,
      events,
    }));
  }, [ordersQuery.data]);

  const user = userQuery.data;

  const familyWithSelf = useMemo(() => {
    const members = profileData.familyMembers || [];
    const self = user?.name
      ? {
          id: 'self',
          name: user.name,
          relation: 'Self',
          bloodGroup: profileData.bloodGroup,
          isSelf: true,
        }
      : null;
    return self ? [self, ...members] : members;
  }, [profileData.familyMembers, profileData.bloodGroup, user?.name]);

  const refetchAll = useCallback(() => {
    bookingsQuery.refetch();
    reportsQuery.refetch();
    ordersQuery.refetch();
    userQuery.refetch();
  }, [bookingsQuery, reportsQuery, ordersQuery, userQuery]);

  return {
    upcomingBookings,
    recentReports,
    allReports,
    reportTrends,
    timelineByMonth,
    profileData,
    user,
    familyWithSelf,
    allOrders: ordersQuery.data || [],
    labTests: testsQuery.data || [],
    isLoading:
      bookingsQuery.isLoading ||
      reportsQuery.isLoading ||
      ordersQuery.isLoading ||
      userQuery.isLoading,
    refetchAll,
  };
}

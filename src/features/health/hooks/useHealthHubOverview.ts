import { useMemo } from 'react';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useGamification } from '../../../lib/gamification/useGamification';
import { useFamilyDashboard, useFamilyVault } from '../../../lib/hooks/useApi';
import { useMedicinesHub } from '../../medicines/hooks/useMedicinesHub';
import {
  DEFAULT_ACTIVITY,
  type HealthActivityItem,
  type HealthAttentionItem,
} from '../data/healthHubData';
import { useHealthDashboard } from './useHealthDashboard';

function relativeTime(value?: string) {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function useHealthHubOverview() {
  const { isAuthenticated } = useAuth();
  const { profile } = useGamification();
  const health = useHealthDashboard({ enabled: isAuthenticated });
  const meds = useMedicinesHub('');
  const vaultQuery = useFamilyVault({ enabled: isAuthenticated });
  const dashboardQuery = useFamilyDashboard({
    enabled: isAuthenticated && vaultQuery.data != null,
  });

  const overview = useMemo(() => {
    const upcoming = health.upcomingBookings[0];
    let upcomingVisit = 'None';
    if (upcoming?.collectionDate) {
      const date = new Date(upcoming.collectionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (date.toDateString() === today.toDateString()) upcomingVisit = 'Today';
      else if (date.toDateString() === tomorrow.toDateString()) {
        upcomingVisit = 'Tomorrow';
      } else {
        upcomingVisit = date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
      }
    }

    const familyMembers = health.familyWithSelf;
    const familyCount =
      dashboardQuery.data?.members?.length ??
      vaultQuery.data?.members?.length ??
      familyMembers.length;

    const activeCount = meds.activeMedicines.length;
    const refillCount = meds.refillMedicines.length;
    const dueReminders = meds.todayReminders.filter(r => !r.taken);
    const reports = health.recentReports;
    const readyReports = reports.filter(r => Boolean(r.reportUrl));
    const reportsReady = readyReports.length || reports.length;

    const attention: HealthAttentionItem[] = [];

    if (dueReminders.length > 0) {
      attention.push({
        id: 'meds-due',
        title:
          dueReminders.length === 1
            ? '1 medicine due'
            : `${dueReminders.length} medicines due`,
        message: 'Take your scheduled doses for today.',
        icon: 'pill',
        screen: 'MedicinesList',
      });
    }

    if (refillCount > 0) {
      attention.push({
        id: 'refill',
        title:
          refillCount === 1
            ? '1 refill needed'
            : `${refillCount} refills needed`,
        message: 'Order before you run out.',
        icon: 'package-variant',
        screen: 'MedicinesList',
      });
    }

    if (readyReports.length > 0) {
      const first = readyReports[0];
      attention.push({
        id: 'report-ready',
        title: `${first.testName || 'Lab report'} ready`,
        message: 'Open your latest results.',
        icon: 'file-chart-outline',
        screen: 'LabReports',
      });
    } else if (!isAuthenticated || reports.length === 0) {
      // Demo fallback so the hub always teaches the flow
      attention.push({
        id: 'demo-report',
        title: 'CBC report ready',
        message: 'View sample results in Reports.',
        icon: 'file-chart-outline',
        screen: 'LabReports',
      });
    }

    if (upcomingVisit === 'Today') {
      attention.push({
        id: 'visit-today',
        title: 'Lab collection today',
        message: upcoming?.testName || 'Prepare for your sample collection.',
        icon: 'calendar-clock',
        screen: 'LabReports',
      });
    }

    if (attention.length === 0) {
      attention.push({
        id: 'all-clear',
        title: 'You are all caught up',
        message: 'No urgent health tasks right now.',
        icon: 'check-circle-outline',
        screen: 'MedicalRecords',
      });
    }

    const activity: HealthActivityItem[] = [];
    reports.slice(0, 2).forEach((report, index) => {
      activity.push({
        id: `report-${report.id || index}`,
        icon: 'flask-outline',
        iconColor: '',
        iconBg: '',
        title: report.reportUrl
          ? `${report.testName || 'Lab report'} ready`
          : `${report.testName || 'Lab test'} in progress`,
        time: relativeTime(report.collectionDate),
      });
    });
    meds.refillMedicines.slice(0, 1).forEach(med => {
      activity.push({
        id: `refill-${med.medicineId}`,
        icon: 'pill',
        iconColor: '',
        iconBg: '',
        title: `${med.medicineName} refill due`,
        time: med.refillDueDate
          ? relativeTime(med.refillDueDate)
          : 'Soon',
      });
    });
    if (activity.length === 0) {
      activity.push(...DEFAULT_ACTIVITY);
    }

    const badges = {
      reports:
        reportsReady > 0
          ? reportsReady === 1
            ? '1 new'
            : `${reportsReady} ready`
          : 'View labs',
      prescriptions:
        activeCount > 0
          ? `${activeCount} active`
          : refillCount > 0
            ? `${refillCount} refill`
            : 'Manage meds',
      family:
        familyCount > 0
          ? `${familyCount} member${familyCount === 1 ? '' : 's'}`
          : 'Add family',
    };

    return {
      healthScore: profile.healthScore ?? 85,
      activePrescriptions: activeCount,
      reportsReady,
      familyCount,
      upcomingVisit,
      familyMembers,
      attention: attention.slice(0, 4),
      activity: activity.slice(0, 4),
      activeMedicines: meds.activeMedicines.slice(0, 3),
      recentReports: reports.slice(0, 3),
      badges,
      isLoading: health.isLoading,
      refetchAll: health.refetchAll,
    };
  }, [
    health.upcomingBookings,
    health.recentReports,
    health.familyWithSelf,
    health.isLoading,
    health.refetchAll,
    profile.healthScore,
    dashboardQuery.data?.members?.length,
    vaultQuery.data?.members?.length,
    meds.activeMedicines,
    meds.refillMedicines,
    meds.todayReminders,
    isAuthenticated,
  ]);

  return overview;
}

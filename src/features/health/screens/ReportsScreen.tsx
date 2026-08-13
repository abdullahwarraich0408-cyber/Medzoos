import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import { navigateToServices } from '../../../lib/auth/navigation';
import type { HealthStackParamList } from '../../../navigation/types';
import { HealthSection } from '../components/shared/HealthSection';
import { HealthEmptyState } from '../components/shared/HealthEmptyState';
import { ReportListItem } from '../components/reports/ReportListItem';
import { ReportTrendCard } from '../components/reports/ReportTrendCard';
import { ReportsSummaryCard } from '../components/reports/ReportsSummaryCard';
import { useHealthDashboard } from '../hooks/useHealthDashboard';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

function formatDate(value?: string) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function ReportsContent() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<HealthStackParamList>>();
  const { allReports, reportTrends, isLoading } = useHealthDashboard();

  const latest = allReports[0];
  const lastUpdated = latest?.collectionDate
    ? formatDate(latest.collectionDate)
    : '—';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) },
      ]}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.subtitle}>
        View, download, and share diagnostic reports. Track trends to stay on top of your health.
      </Text>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.brandPrimary}
          style={styles.loader}
        />
      ) : (
        <>
          <ReportsSummaryCard
            totalReports={allReports.length}
            latestReportName={latest?.testName || 'No reports yet'}
            lastUpdated={lastUpdated}
          />

          {reportTrends.length > 0 ? (
            <HealthSection title="Track trends">
              {reportTrends.map(trend => (
                <ReportTrendCard key={trend.testName} trend={trend} />
              ))}
            </HealthSection>
          ) : null}

          <HealthSection title="Recent reports">
            {allReports.length === 0 ? (
              <HealthEmptyState
                icon="file-chart-outline"
                title="No reports yet"
                subtitle="Reports appear here after your lab tests are completed."
                action={
                  <TouchableOpacity
                    style={styles.browseBtn}
                    onPress={() =>
                      navigateToServices(navigation, 'LabTestsList')
                    }
                    activeOpacity={0.85}>
                    <Text style={styles.browseBtnText}>Book a Lab Test</Text>
                  </TouchableOpacity>
                }
              />
            ) : (
              allReports.map(report => (
                <ReportListItem key={report.id} report={report} />
              ))
            )}
          </HealthSection>
        </>
      )}
    </ScrollView>
  );
}

export function ReportsScreen() {
  return (
    <RequireAuthGate
      title="Sign in to view reports"
      subtitle="Access lab reports, download PDFs, and track health trends."
      icon="file-chart-outline">
      <ScreenLayout headerMode="stack" title="Reports" showSearch={false}>
        <ReportsContent />
      </ScreenLayout>
    </RequireAuthGate>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { padding: spacing.lg, gap: spacing.md },
  subtitle: {
    ...healthOsTypography.sectionHint,
    fontSize: 14,
    lineHeight: 21,
  },
  loader: { marginVertical: spacing.xxxl },
  browseBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
  },
  browseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});

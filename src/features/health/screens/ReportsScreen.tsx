import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Linking,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import { navigateToServices } from '../../../lib/auth/navigation';
import type { HealthStackParamList } from '../../../navigation/types';
import { useHealthDashboard } from '../hooks/useHealthDashboard';
import type { LabBooking } from '../../../lib/mappers/labTest';
import { labReportsBrand } from '../../account/accountScreenBrands';
import { spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';

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

function ReportRow({ report }: { report: LabBooking }) {
  const ready = Boolean(report.reportUrl);

  const open = () => {
    if (report.reportUrl) Linking.openURL(report.reportUrl);
  };

  const share = async () => {
    if (!report.reportUrl) return;
    await Share.share({
      message: `${report.testName || 'Lab Report'} — ${report.reportUrl}`,
      url: report.reportUrl,
      title: report.testName || 'Lab Report',
    });
  };

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, ready && styles.iconReady]}>
        <Icon
          name={ready ? 'file-check-outline' : 'flask-outline'}
          size={18}
          color={ready ? labReportsBrand.success : labReportsBrand.accent}
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {report.testName || 'Lab report'}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {[report.lab || 'Lab', formatDate(report.collectionDate)]
            .filter(Boolean)
            .join(' · ')}
        </Text>
        <View
          style={[styles.badge, ready ? styles.badgeReady : styles.badgePending]}>
          <Text
            style={[
              styles.badgeText,
              ready ? styles.badgeTextReady : styles.badgeTextPending,
            ]}>
            {ready ? 'Ready to view' : 'Processing'}
          </Text>
        </View>
      </View>
      {ready ? (
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
            onPress={open}
            hitSlop={6}>
            <Icon name="eye-outline" size={18} color={labReportsBrand.onAccent} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.action,
              styles.actionSoft,
              pressed && styles.actionPressed,
            ]}
            onPress={share}
            hitSlop={6}>
            <Icon
              name="share-variant-outline"
              size={17}
              color={labReportsBrand.accent}
            />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function ReportsContent() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<HealthStackParamList>>();
  const { allReports, isLoading } = useHealthDashboard();

  const readyCount = useMemo(
    () => allReports.filter(r => Boolean(r.reportUrl)).length,
    [allReports],
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom:
            Math.max(insets.bottom, TAB_BAR_CLEARANCE) + spacing.lg,
        },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Icon name="file-chart-outline" size={22} color={labReportsBrand.accent} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.pageTitle}>Lab reports</Text>
          <Text style={styles.subtitle}>
            Results and PDFs from your lab bookings.
          </Text>
        </View>
        {allReports.length > 0 ? (
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>
              {readyCount}/{allReports.length} ready
            </Text>
          </View>
        ) : null}
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={labReportsBrand.accent}
          style={styles.loader}
        />
      ) : allReports.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Icon name="flask-empty-outline" size={30} color={labReportsBrand.accent} />
          </View>
          <Text style={styles.emptyTitle}>No reports yet</Text>
          <Text style={styles.emptySubtitle}>
            Book a lab test and your results will land here when ready.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.browseBtn,
              pressed && styles.browsePressed,
            ]}
            onPress={() => navigateToServices(navigation, 'LabTestsList')}>
            <Text style={styles.browseBtnText}>Book a lab test</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.list}>
          {allReports.map(report => (
            <ReportRow key={String(report.id)} report={report} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

export function ReportsScreen() {
  return (
    <RequireAuthGate
      title="Sign in to view reports"
      subtitle="Access lab reports and download PDFs."
      icon="file-chart-outline">
      <ScreenLayout
        headerMode="stack"
        title="Lab reports"
        showSearch={false}
        backgroundColor={labReportsBrand.page}>
        <ReportsContent />
      </ScreenLayout>
    </RequireAuthGate>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: labReportsBrand.card,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: labReportsBrand.border,
    padding: spacing.md,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: labReportsBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1, minWidth: 0, gap: 2 },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: labReportsBrand.ink,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: labReportsBrand.muted,
  },
  countPill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: labReportsBrand.successSoft,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: labReportsBrand.success,
  },
  loader: { marginVertical: spacing.xxxl },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: labReportsBrand.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: labReportsBrand.border,
    padding: spacing.md,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: labReportsBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconReady: {
    backgroundColor: labReportsBrand.successSoft,
  },
  body: { flex: 1, gap: 4, minWidth: 0 },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: labReportsBrand.ink,
  },
  meta: {
    fontSize: 12,
    color: labReportsBrand.muted,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeReady: { backgroundColor: labReportsBrand.successSoft },
  badgePending: { backgroundColor: labReportsBrand.soft },
  badgeText: { fontSize: 10, fontWeight: '700' },
  badgeTextReady: { color: labReportsBrand.success },
  badgeTextPending: { color: labReportsBrand.accent },
  actions: { gap: spacing.xs },
  action: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: labReportsBrand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSoft: {
    backgroundColor: labReportsBrand.soft,
  },
  actionPressed: { opacity: 0.88 },
  empty: {
    backgroundColor: labReportsBrand.card,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: labReportsBrand.border,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: labReportsBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 16,
    fontWeight: '700',
    color: labReportsBrand.ink,
  },
  emptySubtitle: {
    marginTop: spacing.sm,
    fontSize: 13,
    lineHeight: 19,
    color: labReportsBrand.muted,
    textAlign: 'center',
  },
  browseBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: labReportsBrand.accent,
  },
  browsePressed: { opacity: 0.9 },
  browseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: labReportsBrand.onAccent,
  },
});

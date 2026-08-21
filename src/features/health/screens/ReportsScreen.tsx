import React from 'react';
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
import { HealthEmptyState } from '../components/shared/HealthEmptyState';
import { useHealthDashboard } from '../hooks/useHealthDashboard';
import type { LabBooking } from '../../../lib/mappers/labTest';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';

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
          name={ready ? 'file-check-outline' : 'file-clock-outline'}
          size={18}
          color={ready ? colors.successText : colors.primary700}
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
      </View>
      <View style={[styles.badge, ready ? styles.badgeReady : styles.badgePending]}>
        <Text
          style={[
            styles.badgeText,
            ready ? styles.badgeTextReady : styles.badgeTextPending,
          ]}>
          {ready ? 'Ready' : 'Pending'}
        </Text>
      </View>
      {ready ? (
        <Pressable
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          onPress={open}
          hitSlop={6}>
          <Icon name="eye-outline" size={18} color={colors.primary700} />
        </Pressable>
      ) : null}
      {ready ? (
        <Pressable
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          onPress={share}
          hitSlop={6}>
          <Icon name="share-variant-outline" size={17} color={colors.primary700} />
        </Pressable>
      ) : null}
    </View>
  );
}

function ReportsContent() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<HealthStackParamList>>();
  const { allReports, isLoading } = useHealthDashboard();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom:
            Math.max(insets.bottom, TAB_BAR_CLEARANCE) + calmLayout.contentBottom,
        },
      ]}
      showsVerticalScrollIndicator={false}>
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary700}
          style={styles.loader}
        />
      ) : allReports.length === 0 ? (
        <HealthEmptyState
          icon="file-chart-outline"
          title="No reports yet"
          subtitle="Lab results appear here when ready."
          action={
            <Pressable
              style={({ pressed }) => [
                styles.browseBtn,
                pressed && styles.browsePressed,
              ]}
              onPress={() => navigateToServices(navigation, 'LabTestsList')}>
              <Text style={styles.browseBtnText}>Book a lab test</Text>
            </Pressable>
          }
        />
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
      <ScreenLayout headerMode="stack" title="Reports" showSearch={false}>
        <ReportsContent />
      </ScreenLayout>
    </RequireAuthGate>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    padding: calmLayout.screenPadding,
    gap: 20,
  },
  loader: { marginVertical: spacing.xxxl },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconReady: {
    backgroundColor: colors.successBg,
  },
  body: { flex: 1, gap: 2, minWidth: 0 },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeReady: { backgroundColor: colors.successBg },
  badgePending: { backgroundColor: colors.primary100 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  badgeTextReady: { color: colors.successText },
  badgeTextPending: { color: colors.primary800 },
  action: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPressed: { backgroundColor: colors.primary100 },
  browseBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.xl,
    backgroundColor: colors.primary700,
  },
  browsePressed: { opacity: 0.9 },
  browseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});

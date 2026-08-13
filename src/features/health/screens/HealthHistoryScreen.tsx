import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import { HealthEmptyState } from '../components/shared/HealthEmptyState';
import { HealthTimelineMonth } from '../components/history/HealthTimelineMonth';
import { useHealthDashboard } from '../hooks/useHealthDashboard';
import {
  formatDobDisplay,
  formatMemberSince,
} from '../../../lib/profile/profileData';


function HealthHistoryContent() {
  const insets = useSafeAreaInsets();
  const { timelineByMonth, profileData, user, allOrders, isLoading } =
    useHealthDashboard();

  const fullTimeline = useMemo(() => {
    if (timelineByMonth.length > 0) return timelineByMonth;
    return [];
  }, [timelineByMonth]);

  const hasEvents = allOrders.length > 0;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) },
      ]}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.subtitle}>
        Complete healthcare timeline — appointments, lab tests, medicines, and
        more.
      </Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Blood Group</Text>
          <Text style={styles.summaryValue}>
            {profileData.bloodGroup || '—'}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Member Since</Text>
          <Text style={styles.summaryValue}>
            {formatMemberSince(user?.created_at)}
          </Text>
        </View>
      </View>

      {profileData.dob ? (
        <View style={styles.infoCard}>
          <Icon name="cake-variant" size={18} color={colors.brandPrimary} />
          <Text style={styles.infoText}>
            Date of birth: {formatDobDisplay(profileData.dob)}
          </Text>
        </View>
      ) : null}

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.brandPrimary}
          style={styles.loader}
        />
      ) : !hasEvents ? (
        <HealthEmptyState
          icon="timeline-clock-outline"
          title="No health history yet"
          subtitle="Book a lab test, doctor visit, or order medicines to build your timeline."
        />
      ) : (
        fullTimeline.map(group => (
          <HealthTimelineMonth
            key={group.month}
            month={group.month}
            events={group.events}
          />
        ))
      )}
    </ScrollView>
  );
}

export function HealthHistoryScreen() {
  return (
    <ScreenLayout headerMode="stack" title="Health History" showSearch={false}>
      <RequireAuthGate
        title="Sign in to view history"
        subtitle="See your complete healthcare timeline after signing in."
        icon="timeline-clock-outline">
        <HealthHistoryContent />
      </RequireAuthGate>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { padding: spacing.lg },
  subtitle: {
    fontSize: 14,
    color: colors.neutral500,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: { fontSize: 13, color: colors.neutral600 },
  loader: { marginVertical: spacing.xxxl },
});
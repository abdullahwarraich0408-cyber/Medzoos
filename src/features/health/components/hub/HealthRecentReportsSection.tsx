import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { LabBooking } from '../../../../lib/mappers/labTest';
import { colors, spacing, radius, shadows } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type HealthRecentReportsSectionProps = {
  reports: LabBooking[];
  onSeeAll: () => void;
  onReportPress?: (report: LabBooking) => void;
};

function formatDate(value?: string) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return value;
  }
}

export function HealthRecentReportsSection({
  reports,
  onSeeAll,
  onReportPress,
}: HealthRecentReportsSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Recent reports</Text>
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>

      {reports.length === 0 ? (
        <Pressable style={styles.emptyCard} onPress={onSeeAll}>
          <Icon name="file-chart-outline" size={22} color={colors.primary700} />
          <View style={styles.emptyCopy}>
            <Text style={styles.emptyTitle}>No reports yet</Text>
            <Text style={styles.emptyHint}>
              Book a lab test or open Reports to view results.
            </Text>
          </View>
          <Icon name="chevron-right" size={18} color={colors.textMuted} />
        </Pressable>
      ) : (
        <View style={styles.list}>
          {reports.map(report => {
            const ready = Boolean(report.reportUrl);
            return (
              <Pressable
                key={String(report.id)}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                onPress={() => onReportPress?.(report) ?? onSeeAll()}>
                <View style={[styles.iconWrap, ready && styles.iconReady]}>
                  <Icon
                    name={ready ? 'file-check-outline' : 'file-clock-outline'}
                    size={18}
                    color={ready ? colors.success : colors.primary700}
                  />
                </View>
                <View style={styles.body}>
                  <Text style={styles.name} numberOfLines={1}>
                    {report.testName || 'Lab report'}
                  </Text>
                  <Text style={styles.meta}>
                    {formatDate(report.collectionDate)}
                  </Text>
                </View>
                <View style={[styles.statusPill, ready ? styles.ready : styles.pending]}>
                  <Text style={[styles.statusText, ready ? styles.readyText : styles.pendingText]}>
                    {ready ? 'Ready' : 'Pending'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...healthOsTypography.sectionTitle,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary700,
  },
  list: { gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.cardSoft,
  },
  pressed: { opacity: 0.92 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconReady: {
    backgroundColor: '#DCFCE7',
  },
  body: { flex: 1, gap: 2 },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  ready: { backgroundColor: '#DCFCE7' },
  pending: { backgroundColor: colors.primary100 },
  statusText: { fontSize: 11, fontWeight: '700' },
  readyText: { color: '#15803D' },
  pendingText: { color: colors.primary800 },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  emptyCopy: { flex: 1, gap: 2 },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyHint: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
});

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { LabBooking } from '../../../../lib/mappers/labTest';
import { colors, spacing, radius } from '../../../../theme';
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
          <View style={styles.iconWrap}>
            <Icon name="file-chart-outline" size={18} color={colors.primary700} />
          </View>
          <View style={styles.emptyCopy}>
            <Text style={styles.emptyTitle}>No reports yet</Text>
            <Text style={styles.emptyHint}>
              Book a lab test or open Reports to view results.
            </Text>
          </View>
          <Icon name="chevron-right" size={18} color={colors.textMuted} />
        </Pressable>
      ) : (
        <View style={styles.card}>
          {reports.map((report, index) => {
            const ready = Boolean(report.reportUrl);
            return (
              <React.Fragment key={String(report.id)}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <Pressable
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                  onPress={() => onReportPress?.(report) ?? onSeeAll()}>
                  <View style={[styles.iconWrap, ready && styles.iconReady]}>
                    <Icon
                      name={ready ? 'file-check-outline' : 'file-clock-outline'}
                      size={18}
                      color={ready ? colors.successText : colors.primary700}
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
                  <View
                    style={[
                      styles.statusPill,
                      ready ? styles.ready : styles.pending,
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        ready ? styles.readyText : styles.pendingText,
                      ]}>
                      {ready ? 'Ready' : 'Pending'}
                    </Text>
                  </View>
                </Pressable>
              </React.Fragment>
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
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 68,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pressed: { backgroundColor: colors.primary100 },
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
  ready: { backgroundColor: colors.successBg },
  pending: { backgroundColor: colors.primary100 },
  statusText: { fontSize: 11, fontWeight: '700' },
  readyText: { color: colors.successText },
  pendingText: { color: colors.primary800 },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
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

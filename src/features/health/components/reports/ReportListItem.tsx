import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Linking,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { LabBooking } from '../../../../lib/mappers/labTest';
import { colors, spacing, radius, shadows, cardStyles } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type ReportListItemProps = {
  report: LabBooking;
};

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

export function ReportListItem({ report }: ReportListItemProps) {
  const isReady = Boolean(report.reportUrl);
  const handleDownload = () => {
    if (report.reportUrl) Linking.openURL(report.reportUrl);
  };

  const handleShare = async () => {
    if (!report.reportUrl) return;
    await Share.share({
      message: `${report.testName || 'Lab Report'} — ${report.reportUrl}`,
      url: report.reportUrl,
      title: report.testName || 'Lab Report',
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Icon name="file-chart-outline" size={24} color={colors.brandPrimary} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{report.testName || 'Lab Report'}</Text>
          <View style={[styles.badge, isReady ? styles.badgeReady : styles.badgePending]}>
            <Text style={[styles.badgeText, isReady ? styles.badgeTextReady : styles.badgeTextPending]}>
              {isReady ? 'Ready' : 'Processing'}
            </Text>
          </View>
        </View>
        <Text style={styles.meta}>
          {report.lab || 'Lab Partner'} · {formatDate(report.collectionDate)}
        </Text>
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, !isReady && styles.actionBtnDisabled]}
            onPress={handleDownload}
            disabled={!isReady}>
            <Icon name="eye-outline" size={16} color={colors.brandPrimary} />
            <Text style={styles.actionText}>View</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, !isReady && styles.actionBtnDisabled]}
            onPress={handleDownload}
            disabled={!isReady}>
            <Icon name="download" size={16} color={colors.brandPrimary} />
            <Text style={styles.actionText}>Download</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, !isReady && styles.actionBtnDisabled]}
            onPress={handleShare}
            disabled={!isReady}>
            <Icon name="share-variant" size={16} color={colors.neutral600} />
            <Text style={styles.actionText}>Share</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    ...cardStyles.premiumSoft,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: spacing.sm },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...healthOsTypography.messageTitle,
    fontSize: 15,
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeReady: { backgroundColor: '#DCFCE7' },
  badgePending: { backgroundColor: colors.neutral100 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  badgeTextReady: { color: '#15803D' },
  badgeTextPending: { color: colors.neutral500 },
  meta: {
    fontSize: 12,
    color: colors.neutral500,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSubtle,
  },
  actionBtnDisabled: { opacity: 0.45 },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral600,
  },
});

import { colors, spacing, radius } from '../../../../theme';
import { healthOs } from '../../../../theme/healthOs';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { LabBooking } from '../../../../lib/mappers/labTest';


type RecentReportRowProps = {
  report: LabBooking;
  onDownload?: () => void;
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

export function RecentReportRow({ report, onDownload }: RecentReportRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Icon name="file-pdf-box" size={22} color="#DC2626" />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {report.testName || 'Lab Report'}
        </Text>
        <Text style={styles.date}>{formatDate(report.collectionDate)}</Text>
      </View>
      {report.reportUrl && onDownload ? (
        <TouchableOpacity style={styles.btn} onPress={onDownload} activeOpacity={0.85}>
          <Icon name="download" size={16} color={colors.brandPrimary} />
          <Text style={styles.btnText}>PDF</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.pending}>
          <Text style={styles.pendingText}>Pending</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  date: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 2,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.brandLight,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  pending: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.neutral100,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral500,
  },
});
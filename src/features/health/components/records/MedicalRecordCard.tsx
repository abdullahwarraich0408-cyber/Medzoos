import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  RECORD_SOURCE_META,
  type UnifiedMedicalRecord,
} from '../../lib/medicalRecords';
import { getRecordCategoryIcon } from '../../data/healthData';
import { colors, spacing, radius, cardStyles, appIcons, appIconTile } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type MedicalRecordCardProps = {
  record: UnifiedMedicalRecord;
  onPress: () => void;
};

export function MedicalRecordCard({ record, onPress }: MedicalRecordCardProps) {
  const icon = getRecordCategoryIcon(record.category, record.typeLabel);
  const sourceMeta = RECORD_SOURCE_META[record.source];
  const hasFile = Boolean(record.fileUrl);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={appIcons.size.lg} color={appIcons.color} />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {record.title}
          </Text>
          {record.status ? (
            <View
              style={[
                styles.statusBadge,
                hasFile ? styles.statusReady : styles.statusPending,
              ]}>
              <Text
                style={[
                  styles.statusText,
                  hasFile ? styles.statusTextReady : styles.statusTextPending,
                ]}>
                {record.status}
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.meta} numberOfLines={1}>
          {record.provider} · {record.date}
        </Text>

        <View style={styles.tagRow}>
          <View style={[styles.sourceTag, { backgroundColor: sourceMeta.bg }]}>
            <Icon name={sourceMeta.icon} size={12} color={sourceMeta.color} />
            <Text style={[styles.sourceText, { color: sourceMeta.color }]}>
              {record.sourceLabel}
            </Text>
          </View>
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{record.typeLabel}</Text>
          </View>
        </View>
      </View>

      <View style={cardStyles.chevronWrap}>
        <Icon
          name={hasFile ? 'file-eye-outline' : 'chevron-right'}
          size={18}
          color={colors.neutral500}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pressed: { backgroundColor: colors.brandMist },
  iconWrap: {
    ...appIconTile('md'),
  },
  body: { flex: 1, gap: 4 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...healthOsTypography.messageTitle,
    fontSize: 14,
    flex: 1,
  },
  meta: {
    fontSize: 12,
    color: colors.neutral500,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 2,
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '700',
  },
  typeTag: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral600,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  statusReady: { backgroundColor: colors.statusSuccessBg },
  statusPending: { backgroundColor: colors.neutral100 },
  statusText: { fontSize: 10, fontWeight: '700' },
  statusTextReady: { color: colors.statusSuccessText },
  statusTextPending: { color: colors.neutral500 },
});

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { UnifiedMedicalRecord } from '../../lib/medicalRecords';
import { RECORD_SECTION_META, type RecordSectionId } from '../../data/healthData';
import { MedicalRecordRow } from './MedicalRecordRow';
import { colors, spacing, cardStyles, appIcons } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

const PREVIEW_LIMIT = 3;

type MedicalRecordSectionProps = {
  sectionId: RecordSectionId;
  records: UnifiedMedicalRecord[];
  onPressRecord: (record: UnifiedMedicalRecord) => void;
  onSeeAll: () => void;
};

export function MedicalRecordSection({
  sectionId,
  records,
  onPressRecord,
  onSeeAll,
}: MedicalRecordSectionProps) {
  if (records.length === 0) return null;

  const meta = RECORD_SECTION_META[sectionId];
  const preview = records.slice(0, PREVIEW_LIMIT);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Icon name={meta.icon} size={16} color={appIcons.color} />
          </View>
          <Text style={styles.headerTitle}>{meta.title}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.seeAll, pressed && styles.seeAllPressed]}
          onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See all</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        {preview.map((record, index) => (
          <React.Fragment key={record.id}>
            {index > 0 ? <View style={cardStyles.rowDivider} /> : null}
            <MedicalRecordRow record={record} onPress={() => onPressRecord(record)} />
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.12)',
  },
  headerTitle: {
    ...healthOsTypography.sectionTitle,
    fontSize: 16,
  },
  seeAll: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  seeAllPressed: { opacity: 0.7 },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  card: {
    ...cardStyles.grouped,
  },
});

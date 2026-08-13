import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { FamilyMemberView, FamilyRecordView } from '../../data/familyVaultModel';
import { getMemberRecordSummary } from '../../data/familyVaultModel';
import { colors, spacing, radius, cardStyles } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type FamilyRecordsTabProps = {
  recentRecords: FamilyRecordView[];
  members: FamilyMemberView[];
  onMemberPress: (memberId: string) => void;
};

function getRecordIcon(type: FamilyRecordView['type']) {
  switch (type) {
    case 'report':
      return 'flask-outline';
    case 'prescription':
      return 'file-document-outline';
    case 'appointment':
      return 'calendar-clock';
    default:
      return 'file-upload-outline';
  }
}

export function FamilyRecordsTab({
  recentRecords,
  members,
  onMemberPress,
}: FamilyRecordsTabProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent records</Text>
        {recentRecords.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>No records yet</Text>
            <Text style={styles.emptySub}>
              Reports, prescriptions, and visits will appear here.
            </Text>
          </View>
        ) : (
          recentRecords.map(record => (
            <View key={record.recordId} style={styles.recordRow}>
              <View style={styles.iconWrap}>
                <Icon
                  name={getRecordIcon(record.type)}
                  size={18}
                  color={colors.brandPrimary}
                />
              </View>
              <View style={styles.recordCopy}>
                <Text style={styles.recordTitle}>{record.title}</Text>
                <Text style={styles.recordMeta}>
                  {record.memberName} · {record.date}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Member records</Text>
        {members.map(member => (
          <Pressable
            key={member.memberId}
            style={({ pressed }) => [styles.memberRow, pressed && styles.pressed]}
            onPress={() => onMemberPress(member.memberId)}>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberSummary}>{getMemberRecordSummary(member)}</Text>
            <Icon name="chevron-right" size={18} color={colors.neutral500} />
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shared documents</Text>
        <Text style={styles.hint}>
          Upload prescriptions and reports from each member profile.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  section: { gap: spacing.sm },
  sectionTitle: {
    ...healthOsTypography.sectionTitle,
    fontSize: 15,
  },
  recordRow: {
    ...cardStyles.premiumSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordCopy: { flex: 1 },
  recordTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink900,
  },
  recordMeta: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 2,
  },
  memberRow: {
    ...cardStyles.premiumSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  pressed: { backgroundColor: colors.brandMist },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink900,
    flex: 1,
  },
  memberSummary: {
    fontSize: 12,
    color: colors.neutral500,
    marginRight: spacing.xs,
  },
  hint: {
    fontSize: 13,
    color: colors.neutral500,
    lineHeight: 18,
  },
  emptyBlock: {
    ...cardStyles.premiumSoft,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink900,
  },
  emptySub: {
    fontSize: 13,
    color: colors.neutral500,
    lineHeight: 18,
  },
});

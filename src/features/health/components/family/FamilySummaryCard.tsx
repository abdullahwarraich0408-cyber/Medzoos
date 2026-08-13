import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { FamilyVaultView } from '../../data/familyVaultModel';
import { colors, spacing, radius, cardStyles } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type FamilySummaryCardProps = {
  family: FamilyVaultView;
  onAddMember: () => void;
};

export function FamilySummaryCard({ family, onAddMember }: FamilySummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.name}>{family.familyName}</Text>
        <Text style={styles.meta}>
          {family.memberCount} member{family.memberCount === 1 ? '' : 's'}
        </Text>
        <Text style={styles.status}>{family.overallStatus}</Text>
        {family.familyScore != null ? (
          <Text style={styles.score}>Family score {family.familyScore}</Text>
        ) : null}
      </View>
      <Pressable style={styles.addBtn} onPress={onAddMember}>
        <Icon name="account-plus-outline" size={16} color={colors.white} />
        <Text style={styles.addBtnText}>Add member</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyles.premiumSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.lg,
  },
  copy: { flex: 1, gap: 2 },
  name: {
    ...healthOsTypography.messageTitle,
    fontSize: 17,
  },
  meta: {
    fontSize: 13,
    color: colors.neutral600,
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    marginTop: spacing.xs,
  },
  score: {
    fontSize: 11,
    color: colors.neutral500,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
});

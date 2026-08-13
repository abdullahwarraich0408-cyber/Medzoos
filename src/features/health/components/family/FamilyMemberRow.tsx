import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { FamilyMemberView } from '../../data/familyVaultModel';
import { getMemberInitials, getStatusColor } from '../../data/familyVaultModel';
import { colors, spacing, radius, cardStyles } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type FamilyMemberRowProps = {
  member: FamilyMemberView;
  onPress: () => void;
};

export function FamilyMemberRow({ member, onPress }: FamilyMemberRowProps) {
  const statusColor = getStatusColor(member.status);
  const needsAttention = member.status !== 'all_good';

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{getMemberInitials(member.name)}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.name}>{member.name}</Text>
        <Text style={styles.relation}>{member.relationship}</Text>
        <Text style={[styles.status, { color: statusColor }]}>
          {member.statusLabel}
        </Text>
      </View>
      {member.healthScore != null && !needsAttention ? (
        <Text style={styles.score}>{member.healthScore}</Text>
      ) : null}
      <Icon name="chevron-right" size={20} color={colors.neutral500} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    ...cardStyles.premiumSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  pressed: { backgroundColor: colors.brandMist },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.brandPrimary,
  },
  copy: { flex: 1, gap: 1 },
  name: {
    ...healthOsTypography.messageTitle,
    fontSize: 14,
  },
  relation: {
    fontSize: 12,
    color: colors.neutral500,
  },
  status: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  score: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral500,
    marginRight: spacing.xs,
  },
});

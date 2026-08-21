import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { FamilyMemberView } from '../../data/familyVaultModel';
import { getMemberInitials } from '../../data/familyVaultModel';
import { colors, spacing, radius } from '../../../../theme';

type FamilyMemberRowProps = {
  member: FamilyMemberView;
  onPress: () => void;
};

export function FamilyMemberRow({ member, onPress }: FamilyMemberRowProps) {
  const needsAttention = member.status !== 'all_good';

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{getMemberInitials(member.name)}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>
          {member.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {member.relationship}
          {needsAttention ? ` · ${member.statusLabel}` : ''}
        </Text>
      </View>
      {member.healthScore != null ? (
        <Text style={styles.score}>{member.healthScore}</Text>
      ) : null}
      <Icon name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pressed: { backgroundColor: colors.primary100 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary800,
  },
  copy: { flex: 1, gap: 2, minWidth: 0 },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  score: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary800,
  },
});

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { FamilyVaultView } from '../../data/familyVaultModel';
import { colors, spacing, radius } from '../../../../theme';

type FamilySummaryCardProps = {
  family: FamilyVaultView;
  onAddMember: () => void;
};

export function FamilySummaryCard({ family, onAddMember }: FamilySummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>
          {family.familyName}
        </Text>
        <Text style={styles.meta}>
          {family.memberCount} member{family.memberCount === 1 ? '' : 's'}
          {family.familyScore != null ? ` · Score ${family.familyScore}` : ''}
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.addBtn, pressed && styles.addPressed]}
        onPress={onAddMember}>
        <Icon name="plus" size={18} color={colors.primary700} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary100,
    borderRadius: radius.xxl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(23, 97, 142, 0.12)',
  },
  copy: { flex: 1, gap: 4, minWidth: 0 },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary900,
    letterSpacing: -0.2,
  },
  meta: {
    fontSize: 13,
    color: colors.primary600,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPressed: { opacity: 0.88 },
});

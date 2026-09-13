import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';
import { BrandGradientFill } from '../../../../components/branding/TealGradientFill';

type FamilyVaultSummaryCardProps = {
  familyName: string;
  familyScore?: number | null;
  memberCount: number;
  onAddMember: () => void;
};

export function FamilyVaultSummaryCard({
  familyName,
  familyScore,
  memberCount,
  onAddMember,
}: FamilyVaultSummaryCardProps) {
  return (
    <View style={styles.card}>
      <BrandGradientFill
        baseColor={colors.brandPrimary}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.content}>
        <View style={styles.left}>
          <Text style={styles.label}>Family Health Vault</Text>
          <Text style={styles.name}>{familyName}</Text>
          <View style={styles.metaRow}>
            {familyScore != null ? (
              <View style={styles.metaPill}>
                <Icon name="chart-arc" size={12} color={colors.white} />
                <Text style={styles.metaText}>Score {familyScore}</Text>
              </View>
            ) : null}
            <View style={styles.metaPill}>
              <Icon name="account-group-outline" size={12} color={colors.white} />
              <Text style={styles.metaText}>{memberCount} members</Text>
            </View>
          </View>
        </View>
        <Pressable style={styles.addBtn} onPress={onAddMember}>
          <Icon name="account-plus-outline" size={18} color={colors.white} />
          <Text style={styles.addBtnText}>Add Member</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    backgroundColor: colors.brandPrimary,
    ...shadows.cardElevated,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.lg,
    zIndex: 1,
    elevation: 2,
  },
  left: { flex: 1, gap: spacing.xs },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  name: {
    ...healthOsTypography.greeting,
    fontSize: 20,
    color: colors.white,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
});

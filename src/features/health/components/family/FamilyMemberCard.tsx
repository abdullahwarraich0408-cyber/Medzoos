import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { FamilyMember } from '../../../../lib/profile/profileData';
import { colors, spacing, radius, shadows, cardStyles } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type FamilyMemberCardProps = {
  member: FamilyMember & { isSelf?: boolean };
  healthScore?: number;
  statusLines?: string[];
  onPress?: () => void;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getStatusLabel(statusLines?: string[]) {
  if (statusLines && statusLines.length > 0) {
    return statusLines[0];
  }
  return 'No urgent items';
}

export function FamilyMemberCard({
  member,
  healthScore,
  statusLines,
  onPress,
}: FamilyMemberCardProps) {
  const status = getStatusLabel(statusLines);
  const needsAttention = statusLines && statusLines.length > 0;
  const score = healthScore ?? 85;

  const content = (
    <>
      <View style={styles.topRow}>
        <View style={[styles.avatar, member.isSelf && styles.avatarSelf]}>
          <Text style={styles.initials}>{getInitials(member.name)}</Text>
        </View>
        <View style={cardStyles.chevronWrap}>
          <Icon name="chevron-right" size={18} color={colors.neutral500} />
        </View>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {member.name}
      </Text>
      <Text style={styles.relation} numberOfLines={1}>
        {member.relation || 'Family member'}
      </Text>
      <View style={styles.scoreRow}>
        <Text style={styles.scoreLabel}>Health score</Text>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>
      <View
        style={[
          styles.statusPill,
          needsAttention ? styles.statusWarn : styles.statusOk,
        ]}>
        <Text
          style={[
            styles.statusText,
            needsAttention ? styles.statusTextWarn : styles.statusTextOk,
          ]}
          numberOfLines={1}>
          {status}
        </Text>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          member.isSelf && styles.cardSelf,
          pressed && cardStyles.pressed,
        ]}
        onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.card, member.isSelf && styles.cardSelf]}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    ...cardStyles.premiumSoft,
    padding: spacing.md,
  },
  cardSelf: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandMist,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelf: {
    borderWidth: 2,
    borderColor: colors.brandPrimary,
  },
  initials: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.brandPrimary,
  },
  name: {
    ...healthOsTypography.messageTitle,
    fontSize: 14,
  },
  relation: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral200,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral500,
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.brandPrimary,
  },
  statusPill: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  statusOk: { backgroundColor: '#DCFCE7' },
  statusWarn: { backgroundColor: '#FEF3C7' },
  statusText: { fontSize: 10, fontWeight: '700' },
  statusTextOk: { color: '#15803D' },
  statusTextWarn: { color: '#B45309' },
});

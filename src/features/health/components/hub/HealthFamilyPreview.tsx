import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { FamilyMember } from '../../../../lib/profile/profileData';
import { colors, spacing, radius, shadows } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type HealthFamilyPreviewProps = {
  members: (FamilyMember & { isSelf?: boolean })[];
  onViewAll: () => void;
  onMemberPress?: (memberId: string) => void;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function HealthFamilyPreview({
  members,
  onViewAll,
  onMemberPress,
}: HealthFamilyPreviewProps) {
  const preview = members.length > 0 ? members.slice(0, 3) : [
    { id: '1', name: 'Abdullah', relation: 'Self', healthScore: 85 },
    { id: '2', name: 'Mother', relation: 'Mother', healthScore: 82 },
    { id: '3', name: 'Father', relation: 'Father', healthScore: 78 },
  ];

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Family health</Text>
        <Pressable onPress={onViewAll} hitSlop={8}>
          <Text style={styles.viewAll}>View Family Vault</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {preview.map(member => (
          <Pressable
            key={member.id}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() => member.id && onMemberPress?.(member.id)}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>{getInitials(member.name)}</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {member.name}
            </Text>
            <Text style={styles.relation} numberOfLines={1}>
              {member.relation || 'Member'}
            </Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Score</Text>
              <Text style={styles.scoreValue}>
                {'healthScore' in member && member.healthScore != null
                  ? member.healthScore
                  : 85}
              </Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>Stable</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...healthOsTypography.sectionTitle,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  row: { gap: spacing.sm, paddingRight: spacing.sm },
  card: {
    width: 132,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.08)',
    ...shadows.card,
  },
  pressed: { opacity: 0.94 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  initials: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.brandPrimary,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink900,
    textAlign: 'center',
  },
  relation: {
    fontSize: 11,
    color: colors.neutral500,
    marginTop: 2,
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  scoreLabel: {
    fontSize: 10,
    color: colors.neutral500,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.brandPrimary,
  },
  statusPill: {
    marginTop: spacing.sm,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803D',
  },
});

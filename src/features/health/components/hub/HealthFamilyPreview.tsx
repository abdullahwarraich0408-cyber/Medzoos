import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import type { FamilyMember } from '../../../../lib/profile/profileData';
import { colors, spacing, radius } from '../../../../theme';
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
  const preview =
    members.length > 0
      ? members.slice(0, 4)
      : [
          { id: '1', name: 'Abdullah', relation: 'Self', healthScore: 85 },
          { id: '2', name: 'Mother', relation: 'Mother', healthScore: 82 },
          { id: '3', name: 'Father', relation: 'Father', healthScore: 78 },
        ];

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Family health</Text>
        <Pressable onPress={onViewAll} hitSlop={8}>
          <Text style={styles.viewAll}>View vault</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {preview.map(member => {
          const score =
            'healthScore' in member && member.healthScore != null
              ? member.healthScore
              : 85;
          return (
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
              <Text style={styles.score}>{score}</Text>
              <Text style={styles.scoreHint}>health score</Text>
            </Pressable>
          );
        })}
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
    color: colors.primary700,
  },
  row: { gap: spacing.sm, paddingRight: spacing.sm },
  card: {
    width: 120,
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pressed: { opacity: 0.92, backgroundColor: colors.primary100 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  initials: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary800,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  relation: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  score: {
    marginTop: spacing.sm,
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary800,
    letterSpacing: -0.3,
  },
  scoreHint: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 1,
  },
});

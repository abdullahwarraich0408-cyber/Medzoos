import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  formatDobDisplay,
  formatMemberSince,
} from '../../../lib/profile/profileData';
import type { UserProfile } from '../../../lib/api';
import type { ProfileData } from '../../../lib/profile/profileData';


type ProfileSummaryCardProps = {
  user?: UserProfile | null;
  profileData: ProfileData;
  familyHealthScore?: number | null;
  familyMemberCount?: number;
};

export function ProfileSummaryCard({
  user,
  profileData,
  familyHealthScore,
  familyMemberCount = 0,
}: ProfileSummaryCardProps) {
  const displayName = user?.name || 'User';
  const initials = displayName
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{displayName}</Text>
        {user?.email ? <Text style={styles.meta}>{user.email}</Text> : null}
        {user?.phone ? <Text style={styles.meta}>{user.phone}</Text> : null}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Blood Group</Text>
          <Text style={styles.statValue}>{profileData.bloodGroup || '—'}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Member Since</Text>
          <Text style={styles.statValue}>
            {formatMemberSince(user?.created_at)}
          </Text>
        </View>
      </View>

      {(familyHealthScore != null || familyMemberCount > 0) && (
        <View style={styles.familyRow}>
          {familyHealthScore != null ? (
            <View style={styles.familyStat}>
              <Text style={styles.familyLabel}>Family Score</Text>
              <Text style={styles.familyValue}>{familyHealthScore}</Text>
            </View>
          ) : null}
          {familyMemberCount > 0 ? (
            <View style={styles.familyStat}>
              <Text style={styles.familyLabel}>Family Members</Text>
              <Text style={styles.familyValue}>{familyMemberCount}</Text>
            </View>
          ) : null}
        </View>
      )}

      {profileData.dob ? (
        <View style={styles.dobRow}>
          <Icon name="cake-variant" size={16} color={colors.brandPrimary} />
          <Text style={styles.dobText}>
            DOB: {formatDobDisplay(profileData.dob)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  initials: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.white,
  },
  info: { marginBottom: spacing.md },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.inkHeadline,
  },
  meta: {
    fontSize: 14,
    color: colors.neutral500,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: {
    width: 1,
    backgroundColor: colors.neutral200,
    marginHorizontal: spacing.sm,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginTop: 4,
  },
  familyRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: `${colors.brandPrimary}10`,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  familyStat: { flex: 1, alignItems: 'center' },
  familyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brandPrimary,
    textTransform: 'uppercase',
  },
  familyValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.brandPrimary,
    marginTop: 4,
  },
  dobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  dobText: { fontSize: 13, color: colors.neutral600 },
});
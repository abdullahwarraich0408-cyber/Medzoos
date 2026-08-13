import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

type ProfileHeroCardProps = {
  firstName: string;
  familyScore?: number | null;
  familyCount?: number;
  onPress?: () => void;
};

export function ProfileHeroCard({
  firstName,
  familyScore,
  familyCount = 0,
  onPress,
}: ProfileHeroCardProps) {
  const initials = firstName.slice(0, 2).toUpperCase();
  const score = familyScore ?? 85;
  const members = familyCount > 0 ? familyCount : 3;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.gradientBase} />
      <View style={styles.gradientOverlay} />
      <View style={styles.decorCircleLarge} />
      <View style={styles.decorCircleSmall} />
      <View style={styles.decorIcon}>
        <Icon name="heart-pulse" size={72} color="rgba(255,255,255,0.1)" />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>{initials}</Text>
            </View>
          </View>
          <View style={styles.badge}>
            <Icon name="shield-check" size={12} color={colors.brandPrimary} />
            <Text style={styles.badgeText}>Verified member</Text>
          </View>
        </View>

        <Text style={styles.greeting}>Hi, {firstName}</Text>
        <Text style={styles.subtitle}>Manage your health profile</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Icon name="chart-arc" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.statLabel}>Family health score</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Icon name="account-group-outline" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.statLabel}>Family members</Text>
            <Text style={styles.statValue}>{members}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    minHeight: 176,
    ...shadows.cardElevated,
  },
  cardPressed: { opacity: 0.97, transform: [{ scale: 0.995 }] },
  gradientBase: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.brandPrimary,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: '38%',
    backgroundColor: colors.brandHighlight,
    opacity: 0.4,
  },
  decorCircleLarge: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -36,
    right: -24,
  },
  decorCircleSmall: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: 20,
    right: 52,
  },
  decorIcon: {
    position: 'absolute',
    right: 8,
    bottom: 6,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    ...shadows.cardSoft,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brandPrimary,
  },
  greeting: {
    ...healthOsTypography.greeting,
    fontSize: 22,
    color: colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginHorizontal: spacing.sm,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
  },
});

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';
import { BrandGradientFill } from '../../../components/branding/TealGradientFill';

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
      style={({ pressed }) => [styles.pressWrap, pressed && styles.cardPressed]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.card}>
        <BrandGradientFill
          baseColor={colors.brandPrimary}
          style={StyleSheet.absoluteFillObject}
        />
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
              <Icon
                name="account-group-outline"
                size={14}
                color="rgba(255,255,255,0.7)"
              />
              <Text style={styles.statLabel}>Family members</Text>
              <Text style={styles.statValue}>{members}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressWrap: {
    borderRadius: radius.xl,
    ...shadows.cardElevated,
  },
  card: {
    borderRadius: radius.xl,
    minHeight: 176,
    overflow: 'hidden',
    backgroundColor: colors.brandPrimary,
  },
  cardPressed: { opacity: 0.97, transform: [{ scale: 0.995 }] },
  decorCircleLarge: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -36,
    right: -24,
    zIndex: 1,
  },
  decorCircleSmall: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -20,
    left: 24,
    zIndex: 1,
  },
  decorIcon: {
    position: 'absolute',
    right: 12,
    bottom: 8,
    opacity: 0.9,
    zIndex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
    zIndex: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brandPrimary,
  },
  greeting: {
    ...healthOsTypography.greeting,
    fontSize: 26,
    color: '#FFFFFF',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.82)',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  stat: { flex: 1, gap: 2 },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 12,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

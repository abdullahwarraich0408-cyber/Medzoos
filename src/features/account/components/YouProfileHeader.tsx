import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

type YouProfileHeaderProps = {
  displayName: string;
  isVerified?: boolean;
  onEditProfile: () => void;
  onFamilyMembers: () => void;
};

export function YouProfileHeader({
  displayName,
  isVerified = false,
  onEditProfile,
  onFamilyMembers,
}: YouProfileHeaderProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.name}>[ {displayName} ]</Text>
      {isVerified ? (
        <View style={styles.badge}>
          <Icon name="shield-check" size={14} color={colors.brandPrimary} />
          <Text style={styles.badgeText}>Verified member</Text>
        </View>
      ) : null}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionPressed]}
          onPress={onEditProfile}>
          <Text style={styles.actionText}>Edit profile</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionPressed]}
          onPress={onFamilyMembers}>
          <Text style={styles.actionText}>Family members</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  name: {
    ...healthOsTypography.greeting,
    fontSize: 22,
    color: colors.ink900,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.brandLight,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.15)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.12)',
  },
  actionPressed: {
    backgroundColor: colors.brandMist,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
});

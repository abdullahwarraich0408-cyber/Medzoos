import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '../../../theme';
import { youBrand } from '../youBrand';
import { TabScreenHeroHeader } from '../../../components/navigation/TabScreenHeroHeader';

type YouProfileHeaderProps = {
  displayName: string;
  isVerified?: boolean;
  onEditProfile: () => void;
  onFamilyMembers: () => void;
  onBackPress?: () => void;
};

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map(p => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  );
}

/**
 * Profile hub header — back + shared title format (no notifications).
 */
export function YouProfileHeader({
  displayName,
  isVerified = false,
  onEditProfile,
  onFamilyMembers,
  onBackPress,
}: YouProfileHeaderProps) {
  const avatarLetters = useMemo(() => initials(displayName), [displayName]);

  return (
    <TabScreenHeroHeader
      screenTitle="You"
      pageBackground={youBrand.page}
      cardBackground={youBrand.accent}
      onBackPress={onBackPress}
      cardStyle={styles.cardInner}>
      <View style={styles.heroRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarLetters}</Text>
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.hello}>Your space</Text>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          {isVerified ? (
            <View style={styles.badge}>
              <Icon name="shield-check" size={13} color={youBrand.onAccent} />
              <Text style={styles.badgeText}>Verified member</Text>
            </View>
          ) : (
            <Text style={styles.unverified}>Complete your profile</Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.actionBtn,
            pressed && styles.actionPressed,
          ]}
          onPress={onEditProfile}>
          <Icon name="account-edit-outline" size={16} color={youBrand.accent} />
          <Text style={styles.actionText}>Edit profile</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.actionBtn,
            pressed && styles.actionPressed,
          ]}
          onPress={onFamilyMembers}>
          <Icon
            name="account-group-outline"
            size={16}
            color={youBrand.accent}
          />
          <Text style={styles.actionText}>Family</Text>
        </Pressable>
      </View>
    </TabScreenHeroHeader>
  );
}

const styles = StyleSheet.create({
  cardInner: {
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: youBrand.onAccent,
    letterSpacing: -0.5,
  },
  heroCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  hello: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.72)',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: youBrand.onAccent,
    letterSpacing: -0.4,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: youBrand.onAccent,
  },
  unverified: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    zIndex: 1,
  },
  actionBtn: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: youBrand.card,
  },
  actionPressed: { opacity: 0.9 },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: youBrand.accent,
  },
});

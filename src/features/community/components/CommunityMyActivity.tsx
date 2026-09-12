import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '../../../theme';
import { communityBrand } from '../communityBrand';

type ActivityRow = {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
};

type CommunityMyActivityProps = {
  rows: ActivityRow[];
  onViewRewards?: () => void;
};

export function CommunityMyActivity({
  rows,
  onViewRewards,
}: CommunityMyActivityProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.heading}>My activity</Text>
      </View>
      {rows.map(row => (
        <Pressable
          key={row.title}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={row.onPress}>
          <View style={styles.iconWrap}>
            <Icon name={row.icon} size={18} color={communityBrand.accentDeep} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>{row.title}</Text>
            <Text style={styles.subtitle}>{row.subtitle}</Text>
          </View>
          <Icon name="chevron-right" size={20} color={communityBrand.muted} />
        </Pressable>
      ))}
      {onViewRewards ? (
        <Pressable style={styles.link} onPress={onViewRewards}>
          <Text style={styles.linkText}>Open challenges to claim rewards</Text>
          <Icon name="arrow-right" size={16} color={communityBrand.accent} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  header: { gap: 4, marginBottom: 4 },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: communityBrand.ink,
    letterSpacing: -0.3,
  },
  row: {
    backgroundColor: communityBrand.card,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: communityBrand.ink,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: { elevation: 1 },
    }),
  },
  rowPressed: { opacity: 0.96 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: communityBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: communityBrand.ink,
  },
  subtitle: {
    fontSize: 12,
    color: communityBrand.muted,
    marginTop: 2,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
    color: communityBrand.accent,
  },
});

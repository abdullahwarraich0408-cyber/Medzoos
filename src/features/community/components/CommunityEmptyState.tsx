import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CommunityActionButton } from './CommunityActionButton';
import { spacing } from '../../../theme';
import { communityBrand } from '../communityBrand';

type CommunityEmptyStateProps = {
  icon: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function CommunityEmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: CommunityEmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.orb}>
        <View style={styles.iconWrap}>
          <Icon name={icon} size={26} color={communityBrand.accentDeep} />
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onAction ? (
        <View style={styles.cta}>
          <CommunityActionButton label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: communityBrand.card,
    borderRadius: 28,
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: communityBrand.ink,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.07,
        shadowRadius: 16,
      },
      android: { elevation: 2 },
    }),
  },
  orb: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: communityBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: communityBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: communityBrand.ink,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    color: communityBrand.muted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.xs,
  },
  cta: {
    alignSelf: 'stretch',
    marginTop: spacing.sm,
  },
});

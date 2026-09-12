import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { accountTeal } from '../accountScreenBrands';
import { spacing, radius } from '../../../theme';

type AccountEmptyStateProps = {
  icon: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function AccountEmptyState({
  icon,
  title,
  subtitle,
  action,
}: AccountEmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWell}>
        <Icon name={icon} size={28} color={accountTeal.accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: accountTeal.card,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: accountTeal.border,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  iconWell: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: accountTeal.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.md,
    fontSize: 16,
    fontWeight: '700',
    color: accountTeal.ink,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 13,
    lineHeight: 19,
    color: accountTeal.muted,
    textAlign: 'center',
  },
});

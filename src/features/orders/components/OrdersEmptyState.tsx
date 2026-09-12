import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ordersBrand } from '../ordersBrand';
import { spacing, radius } from '../../../theme';

type OrdersEmptyStateProps = {
  icon: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function OrdersEmptyState({
  icon,
  title,
  subtitle,
  action,
}: OrdersEmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWell}>
        <Icon name={icon} size={32} color={ordersBrand.accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: ordersBrand.card,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: ordersBrand.border,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  iconWell: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: ordersBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.lg,
    fontSize: 17,
    fontWeight: '700',
    color: ordersBrand.ink,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 21,
    color: ordersBrand.muted,
    textAlign: 'center',
  },
});

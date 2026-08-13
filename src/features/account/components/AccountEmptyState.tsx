import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';

type AccountEmptyStateProps = {
  icon: string;
  title: string;
  subtitle?: string;
};

export function AccountEmptyState({ icon, title, subtitle }: AccountEmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Icon name={icon} size={44} color={colors.neutral300} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral500,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});

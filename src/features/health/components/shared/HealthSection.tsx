import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type HealthSectionProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
};

export function HealthSection({
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
}: HealthSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {actionLabel && onAction ? (
          <TouchableOpacity style={styles.action} onPress={onAction} activeOpacity={0.7}>
            <Text style={styles.actionText}>{actionLabel}</Text>
            <Icon name="chevron-right" size={16} color={colors.brandPrimary} />
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  headerText: { flex: 1 },
  title: {
    ...healthOsTypography.sectionTitle,
  },
  subtitle: {
    ...healthOsTypography.sectionHint,
    marginTop: 2,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingTop: 2,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
});

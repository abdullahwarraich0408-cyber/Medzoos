import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { FamilyAlertView } from '../../data/familyVaultModel';
import { colors, spacing, radius } from '../../../../theme';

type FamilyAlertCardProps = {
  alerts: FamilyAlertView[];
  onViewAll?: () => void;
};

export function FamilyAlertCard({ alerts, onViewAll }: FamilyAlertCardProps) {
  if (alerts.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="alert-circle-outline" size={18} color="#9A6B12" />
        <Text style={styles.title}>Needs attention</Text>
      </View>
      {alerts.slice(0, 2).map(alert => (
        <Text key={alert.alertId} style={styles.line} numberOfLines={2}>
          {alert.description}
        </Text>
      ))}
      {onViewAll ? (
        <Pressable onPress={onViewAll} hitSlop={8}>
          <Text style={styles.viewAll}>View members</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.warningBg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(230, 162, 60, 0.35)',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9A6B12',
  },
  line: {
    fontSize: 13,
    color: '#7A5610',
    lineHeight: 18,
  },
  viewAll: {
    marginTop: spacing.xs,
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary700,
  },
});

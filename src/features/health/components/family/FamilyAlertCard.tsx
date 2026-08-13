import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { FamilyAlertView } from '../../data/familyVaultModel';
import { colors, spacing, radius } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type FamilyAlertCardProps = {
  alerts: FamilyAlertView[];
  onViewAll?: () => void;
};

export function FamilyAlertCard({ alerts, onViewAll }: FamilyAlertCardProps) {
  if (alerts.length === 0) {
    return (
      <View style={styles.okCard}>
        <Icon name="check-circle-outline" size={20} color="#059669" />
        <Text style={styles.okText}>All family members are okay today.</Text>
      </View>
    );
  }

  return (
    <View style={styles.alertCard}>
      <Text style={styles.title}>Family attention</Text>
      {alerts.slice(0, 3).map(alert => (
        <Text key={alert.alertId} style={styles.line}>
          {alert.description}
        </Text>
      ))}
      {alerts.length > 0 && onViewAll ? (
        <Pressable style={styles.viewAllBtn} onPress={onViewAll}>
          <Text style={styles.viewAllText}>View all</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  okCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#ECFDF5',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: spacing.md,
  },
  okText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#047857',
    lineHeight: 18,
  },
  alertCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    ...healthOsTypography.sectionTitle,
    fontSize: 14,
    color: '#92400E',
  },
  line: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
  },
  viewAllBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brandPrimary,
  },
});

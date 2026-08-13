import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type QuickAction = {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
};

type RecordQuickActionsProps = {
  actions: QuickAction[];
};

export function RecordQuickActions({ actions }: RecordQuickActionsProps) {
  return (
    <View style={styles.row}>
      {actions.map(action => (
        <Pressable
          key={action.id}
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={action.onPress}>
          <Icon name={action.icon} size={18} color={colors.brandPrimary} />
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

type RecordSummaryStripProps = {
  items: { label: string; value: number }[];
};

export function RecordSummaryStrip({ items }: RecordSummaryStripProps) {
  return (
    <View style={styles.strip}>
      {items.map(item => (
        <View key={item.label} style={styles.stat}>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.12)',
  },
  btnPressed: {
    backgroundColor: colors.brandMist,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  strip: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.1)',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  value: {
    ...healthOsTypography.messageTitle,
    fontSize: 16,
  },
  statLabel: {
    fontSize: 11,
    color: colors.neutral500,
    textAlign: 'center',
  },
});

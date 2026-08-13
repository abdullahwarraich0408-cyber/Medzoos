import React from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { ORDER_LIFECYCLE_TABS, type OrderLifecycleTab } from '../data/orderModel';
import { colors, spacing, radius, shadows } from '../../../theme';

type OrderHubTabsProps = {
  active: OrderLifecycleTab;
  onChange: (tab: OrderLifecycleTab) => void;
};

export function OrderHubTabs({ active, onChange }: OrderHubTabsProps) {
  return (
    <View style={styles.wrap}>
      {ORDER_LIFECYCLE_TABS.map(tab => {
        const isActive = active === tab.id;
        return (
          <Pressable
            key={tab.id}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.tabActive,
              pressed && !isActive && styles.tabPressed,
            ]}
            onPress={() => onChange(tab.id)}>
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.12)',
    ...shadows.cardSoft,
  },
  tabActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  tabPressed: { backgroundColor: colors.brandMist },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral600,
  },
  tabTextActive: { color: colors.white },
});

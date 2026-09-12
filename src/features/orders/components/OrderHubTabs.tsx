import React from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { ORDER_LIFECYCLE_TABS, type OrderLifecycleTab } from '../data/orderModel';
import { ordersBrand } from '../ordersBrand';
import { spacing, radius } from '../../../theme';

type OrderHubTabsProps = {
  active: OrderLifecycleTab;
  onChange: (tab: OrderLifecycleTab) => void;
};

export function OrderHubTabs({ active, onChange }: OrderHubTabsProps) {
  return (
    <View style={styles.track}>
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
  track: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: radius.xl,
    backgroundColor: ordersBrand.soft,
    borderWidth: 1,
    borderColor: ordersBrand.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
  },
  tabActive: {
    backgroundColor: ordersBrand.accent,
  },
  tabPressed: { backgroundColor: ordersBrand.glaze },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: ordersBrand.muted,
  },
  tabTextActive: { color: ordersBrand.onAccent },
});

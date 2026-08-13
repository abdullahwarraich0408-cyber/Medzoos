import React from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { VAULT_TABS, type VaultTabId } from '../../data/familyVaultModel';
import { colors, spacing, radius, shadows } from '../../../../theme';

type FamilyVaultTabsProps = {
  active: VaultTabId;
  onChange: (tab: VaultTabId) => void;
};

export function FamilyVaultTabs({ active, onChange }: FamilyVaultTabsProps) {
  return (
    <View style={styles.wrap}>
      {VAULT_TABS.map(tab => {
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

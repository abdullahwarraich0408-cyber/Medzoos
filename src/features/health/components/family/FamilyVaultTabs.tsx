import React from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { VAULT_TABS, type VaultTabId } from '../../data/familyVaultModel';
import { colors, spacing, radius } from '../../../../theme';

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
            style={[styles.tab, isActive && styles.tabActive]}
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
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 4,
    gap: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
  },
  tabActive: {
    backgroundColor: colors.primary100,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary800,
    fontWeight: '700',
  },
});

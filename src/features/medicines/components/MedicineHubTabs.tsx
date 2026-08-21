import React from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { MEDICINE_HUB_TABS, type MedicineHubTabId } from '../data/medicineModel';
import { colors, spacing, radius } from '../../../theme';

type MedicineHubTabsProps = {
  active: MedicineHubTabId;
  onChange: (id: MedicineHubTabId) => void;
};

export function MedicineHubTabs({ active, onChange }: MedicineHubTabsProps) {
  return (
    <View style={styles.wrap}>
      {MEDICINE_HUB_TABS.map(tab => {
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
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary800,
    fontWeight: '700',
  },
});

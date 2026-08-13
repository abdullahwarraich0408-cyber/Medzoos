import React from 'react';
import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';
import { MEDICINE_HUB_TABS, type MedicineHubTabId } from '../data/medicineModel';
import { colors, spacing, radius, shadows } from '../../../theme';

type MedicineHubTabsProps = {
  active: MedicineHubTabId;
  onChange: (id: MedicineHubTabId) => void;
};

export function MedicineHubTabs({ active, onChange }: MedicineHubTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {MEDICINE_HUB_TABS.map(tab => {
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingBottom: spacing.xs },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
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

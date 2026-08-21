import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { MEDICAL_RECORD_TABS, type MedicalRecordTabId } from '../../data/healthData';
import { colors, spacing, radius } from '../../../../theme';

type MedicalRecordTabsProps = {
  active: MedicalRecordTabId;
  onChange: (id: MedicalRecordTabId) => void;
};

export function MedicalRecordTabs({ active, onChange }: MedicalRecordTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {MEDICAL_RECORD_TABS.map(tab => {
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tabActive: {
    backgroundColor: colors.primary100,
    borderColor: colors.primary300,
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

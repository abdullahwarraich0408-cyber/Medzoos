import { colors, spacing, radius } from '../../../../theme';
import { healthOs } from '../../../../theme/healthOs';
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';


type PopularTestChipsProps = {
  tests: Array<{ id: string; label: string }>;
  activeId?: string | null;
  onSelect: (query: string, id: string) => void;
};

export function PopularTestChips({
  tests,
  activeId,
  onSelect,
}: PopularTestChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {tests.map(test => {
        const active = activeId === test.id;
        return (
          <TouchableOpacity
            key={test.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(test.label, test.id)}
            activeOpacity={0.85}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {test.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: 2 },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral600,
  },
  chipTextActive: { color: colors.white },
});
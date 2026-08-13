import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RECORD_CATEGORIES, type RecordCategoryId } from '../../data/healthData';
import { colors, spacing, radius, shadows } from '../../../../theme';

type RecordCategoryChipsProps = {
  active: RecordCategoryId;
  onChange: (id: RecordCategoryId) => void;
};

export function RecordCategoryChips({
  active,
  onChange,
}: RecordCategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {RECORD_CATEGORIES.map(cat => {
        const isActive = active === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onChange(cat.id)}
            activeOpacity={0.85}>
            <Icon
              name={cat.icon}
              size={14}
              color={isActive ? colors.white : colors.neutral600}
            />
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingBottom: spacing.md },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.1)',
    backgroundColor: colors.white,
    ...shadows.cardSoft,
  },
  chipActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral600,
  },
  chipTextActive: { color: colors.white },
});

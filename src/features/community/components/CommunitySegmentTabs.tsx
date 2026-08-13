import React from 'react';
import { Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows } from '../../../theme';

export type CommunitySegment = {
  id: string;
  label: string;
  icon: string;
};

type CommunitySegmentTabsProps = {
  segments: CommunitySegment[];
  active: string;
  onChange: (id: string) => void;
};

export function CommunitySegmentTabs({
  segments,
  active,
  onChange,
}: CommunitySegmentTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.wrap}>
      {segments.map(seg => {
        const isActive = seg.id === active;
        return (
          <Pressable
            key={seg.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(seg.id)}>
            <Icon
              name={seg.icon}
              size={16}
              color={isActive ? colors.white : colors.primary700}
            />
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {seg.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary700,
    borderColor: colors.primary700,
    ...shadows.cardSoft,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary700,
  },
  tabTextActive: {
    color: colors.white,
  },
});

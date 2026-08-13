import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import type { ConsultType } from '../data/mockDoctors';

const TABS: Array<{
  id: ConsultType;
  label: string;
  icon: string;
}> = [
  { id: 'in_person', label: 'In-Person', icon: 'hospital-building' },
  { id: 'online', label: 'Online', icon: 'video' },
];

type ConsultTypeTabsProps = {
  value: ConsultType;
  onChange: (value: ConsultType) => void;
  onlineCount?: number;
};

export function ConsultTypeTabs({
  value,
  onChange,
  onlineCount = 0,
}: ConsultTypeTabsProps) {
  return (
    <View style={styles.wrap}>
      {TABS.map(tab => {
        const isActive = value === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(tab.id)}
            activeOpacity={0.8}>
            <Icon
              name={tab.icon}
              size={18}
              color={isActive ? colors.brandPrimary : colors.neutral500}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {tab.id === 'online' && onlineCount > 0 && (
              <View style={styles.onlineBadge}>
                <Text style={styles.onlineBadgeText}>{onlineCount} online</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.transparent,
  },
  tabActive: {
    borderBottomColor: colors.brandPrimary,
    backgroundColor: `${colors.brandLight}66`,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral500,
  },
  tabLabelActive: {
    color: colors.brandPrimary,
  },
  onlineBadge: {
    backgroundColor: '#f59e0b26',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  onlineBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.statusWarning,
  },
});
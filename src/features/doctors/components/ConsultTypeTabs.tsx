import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { doctorsBrand } from '../doctorsBrand';
import { spacing, radius } from '../../../theme';
import type { ConsultType } from '../data/mockDoctors';

const TABS: Array<{
  id: ConsultType;
  label: string;
  icon: string;
}> = [
  { id: 'in_person', label: 'In-Person', icon: 'hospital-building' },
  { id: 'online', label: 'Online', icon: 'video-outline' },
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
    <View style={styles.track}>
      {TABS.map(tab => {
        const isActive = value === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(tab.id)}
            activeOpacity={0.85}>
            <Icon
              name={tab.icon}
              size={16}
              color={isActive ? doctorsBrand.onAccent : doctorsBrand.muted}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {tab.id === 'online' && onlineCount > 0 ? (
              <View style={[styles.onlineBadge, isActive && styles.onlineBadgeActive]}>
                <Text
                  style={[
                    styles.onlineBadgeText,
                    isActive && styles.onlineBadgeTextActive,
                  ]}>
                  {onlineCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
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
    backgroundColor: doctorsBrand.soft,
    borderWidth: 1,
    borderColor: doctorsBrand.border,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
  },
  tabActive: {
    backgroundColor: doctorsBrand.accent,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: doctorsBrand.muted,
  },
  tabLabelActive: {
    color: doctorsBrand.onAccent,
  },
  onlineBadge: {
    minWidth: 20,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: doctorsBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  onlineBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: doctorsBrand.accent,
  },
  onlineBadgeTextActive: {
    color: doctorsBrand.onAccent,
  },
});

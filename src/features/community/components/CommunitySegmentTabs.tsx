import React from 'react';
import { Text, Pressable, StyleSheet, ScrollView, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '../../../theme';
import { communityBrand } from '../communityBrand';

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
            <View
              style={[styles.iconDot, isActive && styles.iconDotActive]}>
              <Icon
                name={seg.icon}
                size={15}
                color={
                  isActive ? communityBrand.onAccent : communityBrand.accentDeep
                }
              />
            </View>
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
    gap: 8,
    paddingLeft: 8,
    paddingRight: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: communityBrand.card,
  },
  tabActive: {
    backgroundColor: communityBrand.ink,
  },
  iconDot: {
    width: 30,
    height: 30,
    borderRadius: 12,
    backgroundColor: communityBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDotActive: {
    backgroundColor: communityBrand.accent,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: communityBrand.ink,
  },
  tabTextActive: {
    color: communityBrand.onAccent,
  },
});

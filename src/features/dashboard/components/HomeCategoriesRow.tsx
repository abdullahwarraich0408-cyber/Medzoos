import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DOCTOR_CATEGORIES } from '../../home/data/homeData';
import { colors, spacing, radius, shadows } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';
import { useContentItems } from '../hooks/useContentItems';

export type HomeCategory = {
  id: string;
  name: string;
  icon: string;
  specialty: string;
};

type HomeCategoriesRowProps = {
  onPressCategory: (category: HomeCategory) => void;
};

export function HomeCategoriesRow({ onPressCategory }: HomeCategoriesRowProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data } = useContentItems('specialties');
  const categories: HomeCategory[] =
    data && data.length > 0
      ? data.map(item => ({
          id: item.id,
          name: item.title,
          icon: item.icon || 'stethoscope',
          specialty: item.meta || item.title,
        }))
      : DOCTOR_CATEGORIES.map(item => ({
          id: item.id,
          name: item.name,
          icon: item.icon,
          specialty: item.specialty,
        }));

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.heading}>Specialities</Text>
        <Text style={styles.seeAll}>See All</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroller}
        contentContainerStyle={styles.row}>
        {categories.map(category => {
          const selected = selectedId === category.id;
          return (
            <Pressable
              key={category.id}
              style={({ pressed }) => [
                styles.item,
                selected && styles.itemSelected,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                setSelectedId(category.id);
                onPressCategory(category);
              }}>
              <View
                style={[
                  styles.iconCircle,
                  selected && styles.iconCircleSelected,
                ]}>
                <Icon
                  name={category.icon}
                  size={18}
                  color={selected ? colors.iconWhite : colors.iconPrimary}
                />
              </View>
              <Text
                style={[styles.label, selected && styles.labelSelected]}
                numberOfLines={1}>
                {category.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
    marginHorizontal: -calmLayout.screenPadding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: calmLayout.screenPadding,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary700,
  },
  scroller: {
    overflow: 'visible',
  },
  row: {
    gap: spacing.md,
    paddingHorizontal: calmLayout.screenPadding,
    paddingVertical: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.cardSoft,
  },
  itemSelected: {
    backgroundColor: colors.primary700,
    borderColor: colors.primary700,
  },
  pressed: {
    opacity: 0.9,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary100,
  },
  iconCircleSelected: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary600,
  },
  labelSelected: {
    color: colors.white,
  },
});

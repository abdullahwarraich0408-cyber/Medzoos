import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows } from '../../../theme';
import { useContentItems } from '../hooks/useContentItems';

const FALLBACK = [
  {
    id: 'doctor',
    title: 'Consult Doctor',
    subtitle: 'Video or in clinic',
    icon: 'stethoscope',
    action: 'doctors',
  },
  {
    id: 'meds',
    title: 'Order Medicines',
    subtitle: 'Fast doorstep delivery',
    icon: 'pill',
    action: 'medicines',
  },
  {
    id: 'lab',
    title: 'Lab Tests',
    subtitle: 'Home sample collection',
    icon: 'flask-outline',
    action: 'labs',
  },
  {
    id: 'pharmacy',
    title: 'Pharmacies',
    subtitle: 'Browse local stores',
    icon: 'storefront-outline',
    action: 'pharmacies',
  },
  {
    id: 'hospitals',
    title: 'Hospitals',
    subtitle: 'Find top facilities',
    icon: 'hospital-building',
    action: 'hospitals',
  },
  {
    id: 'packages',
    title: 'Health Packages',
    subtitle: 'Full body checkups',
    icon: 'shield-plus-outline',
    action: 'packages',
  },
];

type HomeCareActionsProps = {
  onAction: (action: string) => void;
};

export function HomeCareActions({ onAction }: HomeCareActionsProps) {
  const { data } = useContentItems('care_actions');
  const actions =
    data && data.length > 0
      ? data.map(item => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle || '',
          icon: item.icon || 'stethoscope',
          action: item.action || 'doctors',
        }))
      : FALLBACK;

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Healthcare Services</Text>
      <View style={styles.grid}>
        {actions.map(action => (
          <Pressable
            key={action.id}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
            onPress={() => onAction(action.action)}>
            <View style={styles.icon}>
              <Icon name={action.icon} size={20} color={colors.primary700} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.title} numberOfLines={1}>
                {action.title}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {action.subtitle}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tile: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 11,
    paddingHorizontal: 10,
    gap: 10,
    ...shadows.cardSoft,
  },
  pressed: { opacity: 0.92 },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
  },
});

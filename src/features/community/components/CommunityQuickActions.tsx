import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows } from '../../../theme';

type QuickAction = {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
};

type CommunityQuickActionsProps = {
  actions: QuickAction[];
};

export function CommunityQuickActions({ actions }: CommunityQuickActionsProps) {
  return (
    <View style={styles.row}>
      {actions.map(action => (
        <Pressable
          key={action.id}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          onPress={action.onPress}>
          <View style={styles.iconWrap}>
            <Icon name={action.icon} size={18} color={colors.iconPrimary} />
          </View>
          <Text style={styles.label} numberOfLines={2}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.cardSoft,
  },
  pressed: { opacity: 0.92 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 14,
  },
});

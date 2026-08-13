import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ACCOUNT_QUICK_ACTIONS } from '../data/accountData';
import { colors, spacing, radius, cardStyles, shadows, appIcons, appIconTile } from '../../../theme';

type ProfileQuickActionsProps = {
  onPressAction: (action: (typeof ACCOUNT_QUICK_ACTIONS)[number]) => void;
};

export function ProfileQuickActions({ onPressAction }: ProfileQuickActionsProps) {
  return (
    <View style={styles.row}>
      {ACCOUNT_QUICK_ACTIONS.map(action => (
        <Pressable
          key={action.id}
          style={({ pressed }) => [styles.action, pressed && cardStyles.pressed]}
          onPress={() => onPressAction(action)}>
          <View style={styles.iconWrap}>
            <Icon name={action.icon} size={appIcons.size.md} color={appIcons.color} />
          </View>
          <Text style={styles.label} numberOfLines={2}>
            {action.title}
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
  action: {
    flex: 1,
    alignItems: 'center',
    ...cardStyles.premiumSoft,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  },
  iconWrap: {
    ...appIconTile('md'),
    ...shadows.cardSoft,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink900,
    textAlign: 'center',
    lineHeight: 14,
  },
});

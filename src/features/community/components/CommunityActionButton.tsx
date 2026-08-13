import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows } from '../../../theme';

type CommunityActionButtonProps = {
  label: string;
  onPress: () => void;
  icon?: string;
};

export function CommunityActionButton({
  label,
  onPress,
  icon = 'plus',
}: CommunityActionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      onPress={onPress}>
      <Icon name={icon} size={18} color={colors.white} />
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#0E304B',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    ...shadows.cardSoft,
  },
  btnPressed: { opacity: 0.92 },
  text: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});

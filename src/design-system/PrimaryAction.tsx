import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, radius, spacing, shadows } from '../theme';
import { healthOsTypography } from '../theme/healthOs';

type PrimaryActionProps = {
  icon: string;
  title: string;
  onPress: () => void;
  variant?: 'brand' | 'neutral';
};

/** One clear primary action — use 1–2 per screen max */
export function PrimaryAction({
  icon,
  title,
  onPress,
  variant = 'brand',
}: PrimaryActionProps) {
  const isBrand = variant === 'brand';
  return (
    <Pressable
      style={[styles.btn, isBrand ? styles.btnBrand : styles.btnNeutral]}
      onPress={onPress}>
      <Icon name={icon} size={22} color={isBrand ? colors.white : colors.brandPrimary} />
      <Text style={[styles.text, isBrand ? styles.textBrand : styles.textNeutral]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
  },
  btnBrand: {
    backgroundColor: colors.primary700,
  },
  btnNeutral: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral200,
    ...shadows.cardSoft,
  },
  text: {
    ...healthOsTypography.messageTitle,
    fontSize: 16,
  },
  textBrand: { color: colors.white },
  textNeutral: { color: colors.brandPrimary },
});

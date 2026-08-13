import React, { ReactNode } from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing } from '../theme';
import { healthOs } from '../theme/healthOs';

type OsCardProps = {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'accent';
  accentColor?: string;
  style?: ViewStyle;
};

export function OsCard({
  children,
  onPress,
  variant = 'default',
  accentColor,
  style,
}: OsCardProps) {
  const content = (
    <View
      style={[
        styles.card,
        variant === 'elevated' && styles.elevated,
        variant === 'accent' && {
          backgroundColor: accentColor || healthOs.copilotSurface,
          borderColor: 'transparent',
        },
        style,
      ]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceBase,
    borderRadius: radius.xxl,
    borderWidth: 0,
    padding: spacing.lg,
    ...shadows.card,
  },
  elevated: {
    ...shadows.cardElevated,
  },
  pressed: {
    opacity: 0.92,
  },
});

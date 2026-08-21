import React, { type ReactNode } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

/** iPhone-like frosted / smoky glass tokens */
export const smoky = {
  fill: 'rgba(255, 255, 255, 0.72)',
  fillStrong: 'rgba(248, 250, 252, 0.82)',
  fillSoft: 'rgba(255, 255, 255, 0.55)',
  stroke: 'rgba(255, 255, 255, 0.88)',
  strokeMuted: 'rgba(226, 232, 240, 0.7)',
  tint: 'rgba(241, 245, 249, 0.45)',
  shadow: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },
} as const;

type SmokyGlassProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Stronger fill for floating tab bars */
  intensity?: 'soft' | 'regular' | 'strong';
  rounded?: number;
};

/**
 * Cross-platform frosted / smoky surface — mimics iOS navigation chrome
 * without a native blur rebuild (translucent layered glass).
 */
export function SmokyGlass({
  children,
  style,
  intensity = 'regular',
  rounded = 0,
}: SmokyGlassProps) {
  const fill =
    intensity === 'strong'
      ? smoky.fillStrong
      : intensity === 'soft'
        ? smoky.fillSoft
        : smoky.fill;

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: fill,
          borderRadius: rounded,
          borderColor: smoky.stroke,
        },
        rounded > 0 && smoky.shadow,
        style,
      ]}>
      {/* Soft inner wash — reads as frosted glass depth */}
      <View
        pointerEvents="none"
        style={[
          styles.tint,
          {
            borderRadius: rounded,
            backgroundColor: smoky.tint,
          },
        ]}
      />
      {/* Top highlight edge like iOS materials */}
      <View
        pointerEvents="none"
        style={[
          styles.highlight,
          {
            borderTopLeftRadius: rounded,
            borderTopRightRadius: rounded,
          },
        ]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        // Extra softness on iOS
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      default: {},
    }),
  },
  glassWash: {
    ...StyleSheet.absoluteFill,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  content: {
    zIndex: 1,
    width: '100%',
  },
});

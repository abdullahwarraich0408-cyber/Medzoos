import React, { ReactNode } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius } from '../theme';

type ButtonFillProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Vertical wash from #0E304B → #185B8B */
  direction?: 'vertical' | 'horizontal';
};

/**
 * Button-only fill. Do not use for specialty/category icon backgrounds.
 */
export function ButtonFill({
  children,
  style,
  direction = 'vertical',
}: ButtonFillProps) {
  const isVertical = direction === 'vertical';
  return (
    <View style={[styles.base, style, { overflow: 'hidden' }]}>
      <View
        pointerEvents="none"
        style={[
          styles.wash,
          isVertical ? styles.washVertical : styles.washHorizontal,
        ]}>
        <View style={[styles.stop, { backgroundColor: colors.buttonStart }]} />
        <View style={[styles.stop, { backgroundColor: colors.buttonEnd }]} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.buttonEnd,
    borderRadius: radius.pill,
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
  },
  washVertical: {
    flexDirection: 'column',
  },
  washHorizontal: {
    flexDirection: 'row',
  },
  stop: {
    flex: 1,
  },
});

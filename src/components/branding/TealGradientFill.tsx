import React, { useId, useState } from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { appBrand } from '../../theme/appBrand';

type BrandGradientFillProps = {
  style?: StyleProp<ViewStyle>;
  /** Prefer putting text/actions as siblings above this fill — children are optional. */
  children?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  baseColor?: string;
};

/**
 * Smooth L→R brand teal gradient (SVG background only).
 * Keep interactive / text content as a sibling on top of this view when possible.
 */
export function BrandGradientFill({
  style,
  children,
  contentStyle,
  baseColor = appBrand.main,
}: BrandGradientFillProps) {
  const gradId = `bg-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0 && (width !== size.width || height !== size.height)) {
      setSize({ width, height });
    }
  };

  const mid = baseColor || appBrand.gradientMid;
  const { width: w, height: h } = size;

  return (
    <View
      style={[styles.container, { backgroundColor: mid }, style]}
      onLayout={onLayout}
      pointerEvents={children ? 'box-none' : 'none'}>
      {w > 0 && h > 0 ? (
        <Svg width={w} height={h} style={styles.svg} pointerEvents="none">
          <Defs>
            <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={appBrand.gradientStart} />
              <Stop offset="0.4" stopColor={mid} />
              <Stop offset="1" stopColor={appBrand.gradientEnd} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${gradId})`} />
        </Svg>
      ) : null}

      {children != null ? (
        <View style={[styles.content, contentStyle]} pointerEvents="box-none">
          {children}
        </View>
      ) : null}
    </View>
  );
}

/** @deprecated Use BrandGradientFill */
export const TealGradientFill = BrandGradientFill;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  svg: {
    ...StyleSheet.absoluteFillObject,
  },
  /** Absolute so SVG never participates in layout or covers flex children on Android. */
  content: {
    ...StyleSheet.absoluteFillObject,
  },
});

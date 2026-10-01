import React, { useId, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  UIManager,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { authUi } from '../authUi';

type AuthGradientHeaderProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/** Same stops as DoctorApp GreenGradientHeader */
const GRAD_LEFT = '#00A3A8';
const GRAD_MID = '#006D72';
const GRAD_RIGHT = '#003E42';

const BANDS = [
  '#00A3A8',
  '#009CA1',
  '#00959A',
  '#008E93',
  '#00878C',
  '#008085',
  '#00797E',
  '#007277',
  '#006D72',
  '#00656A',
  '#005D62',
  '#00555A',
  '#004D52',
  '#00454A',
  '#003E42',
] as const;

function hasNativeSvgGradient(): boolean {
  try {
    const getConfig = UIManager.getViewManagerConfig?.bind(UIManager);
    if (typeof getConfig === 'function') {
      return Boolean(
        getConfig('RNSVGLinearGradient') ||
          getConfig('RNSVGSvgViewAndroid') ||
          getConfig('RNSVGSvgView'),
      );
    }
    // Legacy Paper API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const has = (UIManager as any).hasViewManagerConfig;
    if (typeof has === 'function') {
      return Boolean(has('RNSVGLinearGradient') || has('RNSVGSvgView'));
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * DoctorApp-identical L→R teal gradient when native SVG is linked.
 * Falls back to View color bands so Sign In never crashes mid-render.
 */
export function AuthGradientHeader({ style, children }: AuthGradientHeaderProps) {
  const useSvg = useMemo(() => hasNativeSvgGradient(), []);
  const gradId = `authHdr-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (
      width > 0 &&
      height > 0 &&
      (width !== layout.width || height !== layout.height)
    ) {
      setLayout({ width, height });
    }
  };

  const { width: w, height: h } = layout;

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      {useSvg && w > 0 && h > 0 ? (
        <Svg width={w} height={h} style={styles.svg} pointerEvents="none">
          <Defs>
            <LinearGradient
              id={gradId}
              x1="0"
              y1="0"
              x2={w}
              y2="0"
              gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={GRAD_LEFT} />
              <Stop offset="0.5" stopColor={GRAD_MID} />
              <Stop offset="1" stopColor={GRAD_RIGHT} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={w} height={h} fill={`url(#${gradId})`} />
        </Svg>
      ) : (
        <View pointerEvents="none" style={styles.wash}>
          {BANDS.map((color, i) => (
            <View key={i} style={[styles.band, { backgroundColor: color }]} />
          ))}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: authUi.gradientStart,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  band: {
    flex: 1,
    height: '100%',
  },
});

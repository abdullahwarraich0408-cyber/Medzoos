import React, { type ReactNode } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardBottomInset } from './useKeyboardBottomInset';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /**
   * Subtract from keyboard height when the layout already accounts for bottom
   * safe area (common for chat composers that pad with insets.bottom).
   * Prefer leaving this false on Android edge-to-edge — safe-area trim often
   * under-pads and covers the input.
   */
  subtractSafeArea?: boolean;
  /** Extra offset subtracted from keyboard inset (headers, tab bars, etc.). */
  offset?: number;
  /** Extra lift above the keyboard (breathing room for the composer). */
  extraPadding?: number;
  enabled?: boolean;
};

/**
 * Flex container that lifts bottom-pinned UI (composers, sticky footers)
 * above the keyboard on both platforms.
 */
export function KeyboardAvoidingContainer({
  children,
  style,
  subtractSafeArea = false,
  offset = 0,
  extraPadding = 0,
  enabled = true,
}: Props) {
  const insets = useSafeAreaInsets();
  const keyboardInset = useKeyboardBottomInset(enabled);
  // iOS: safe-area is often already in the composer. Android edge-to-edge:
  // keyboard geometry already reaches the physical bottom — don't trim.
  const safeTrim =
    subtractSafeArea && Platform.OS === 'ios' && keyboardInset > 0
      ? insets.bottom
      : 0;
  const paddingBottom =
    keyboardInset > 0
      ? Math.max(0, keyboardInset - safeTrim - offset + extraPadding)
      : 0;

  return <View style={[style, { paddingBottom }]}>{children}</View>;
}

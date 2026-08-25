import React, { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardBottomInset } from './useKeyboardBottomInset';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /**
   * Subtract from keyboard height when the layout already accounts for bottom
   * safe area (common for chat composers that pad with insets.bottom).
   */
  subtractSafeArea?: boolean;
  /** Extra offset subtracted from keyboard inset (headers, tab bars, etc.). */
  offset?: number;
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
  enabled = true,
}: Props) {
  const insets = useSafeAreaInsets();
  const keyboardInset = useKeyboardBottomInset(enabled);
  const safeTrim = subtractSafeArea ? insets.bottom : 0;
  const paddingBottom = Math.max(0, keyboardInset - safeTrim - offset);

  return <View style={[style, { paddingBottom }]}>{children}</View>;
}

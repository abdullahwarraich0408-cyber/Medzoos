import { useEffect, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  Platform,
  type KeyboardEvent,
} from 'react-native';

/**
 * Tracks keyboard height for edge-to-edge Android (where adjustResize is a no-op
 * once WindowCompat.setDecorFitsSystemWindows(window, false) is set) and iOS.
 *
 * Uses keyboard top (screenY) vs window height so the composer is not covered.
 */
export function useKeyboardBottomInset(enabled = true): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setInset(0);
      return;
    }

    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const resolveInset = (e: KeyboardEvent) => {
      const winH = Dimensions.get('window').height;
      const fromScreenY = winH - e.endCoordinates.screenY;
      // Prefer geometry over reported height — more reliable on edge-to-edge Android.
      const next = Math.max(e.endCoordinates.height, fromScreenY, 0);
      setInset(Math.round(next));
    };

    const onHide = () => setInset(0);

    const showSub = Keyboard.addListener(showEvent, resolveInset);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [enabled]);

  return inset;
}

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  type KeyboardEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useKeyboardBottomInset } from './useKeyboardBottomInset';

const DEFAULT_EXTRA_SCROLL = 28;

type Props = ScrollViewProps & {
  /** Extra space kept between focused input and keyboard top. */
  extraScrollHeight?: number;
  /** When true, do not add keyboard height to content padding (parent handles it). */
  disableKeyboardInset?: boolean;
};

function basePaddingBottom(style: StyleProp<ViewStyle> | undefined): number {
  const flat = StyleSheet.flatten(style) as ViewStyle | undefined;
  if (!flat) return 0;
  if (typeof flat.paddingBottom === 'number') return flat.paddingBottom;
  if (typeof flat.paddingVertical === 'number') return flat.paddingVertical;
  if (typeof flat.padding === 'number') return flat.padding;
  return 0;
}

/**
 * Drop-in ScrollView that keeps the focused TextInput visible above the keyboard
 * on iOS and Android (including edge-to-edge Android).
 */
export const KeyboardAwareScrollView = forwardRef<ScrollView, Props>(
  function KeyboardAwareScrollView(
    {
      children,
      contentContainerStyle,
      extraScrollHeight = DEFAULT_EXTRA_SCROLL,
      disableKeyboardInset = false,
      keyboardShouldPersistTaps = 'handled',
      keyboardDismissMode = 'on-drag',
      onScroll,
      scrollEventThrottle = 16,
      ...rest
    },
    ref,
  ) {
    const scrollRef = useRef<ScrollView>(null);
    const scrollYRef = useRef(0);
    const keyboardInset = useKeyboardBottomInset(!disableKeyboardInset);

    useImperativeHandle(ref, () => scrollRef.current as ScrollView);

    const ensureFocusedVisible = useCallback(
      (keyboardHeight: number) => {
        if (keyboardHeight <= 0) return;
        const input = TextInput.State.currentlyFocusedInput?.();
        if (!input || !scrollRef.current) return;

        const run = () => {
          input.measureInWindow((_x, y, _w, h) => {
            const windowHeight = Dimensions.get('window').height;
            const keyboardTop = windowHeight - keyboardHeight;
            const inputBottom = y + h;
            const overflow = inputBottom - (keyboardTop - extraScrollHeight);
            if (overflow > 0) {
              scrollRef.current?.scrollTo({
                y: Math.max(0, scrollYRef.current + overflow),
                animated: true,
              });
            }
          });
        };

        // Wait a frame so keyboard inset padding has applied.
        requestAnimationFrame(() => {
          setTimeout(run, Platform.OS === 'ios' ? 16 : 64);
        });
      },
      [extraScrollHeight],
    );

    useEffect(() => {
      const showEvent =
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
      const onShow = (e: KeyboardEvent) => {
        ensureFocusedVisible(e.endCoordinates.height);
      };
      const sub = Keyboard.addListener(showEvent, onShow);
      return () => sub.remove();
    }, [ensureFocusedVisible]);

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollYRef.current = e.nativeEvent.contentOffset.y;
      onScroll?.(e);
    };

    const resolvedPaddingBottom =
      basePaddingBottom(contentContainerStyle) +
      (disableKeyboardInset ? 0 : keyboardInset);

    return (
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        keyboardDismissMode={keyboardDismissMode}
        onScroll={handleScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={[
          contentContainerStyle,
          { paddingBottom: resolvedPaddingBottom },
        ]}
        {...rest}>
        {children}
      </ScrollView>
    );
  },
);

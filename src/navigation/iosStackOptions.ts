import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

/** Shared iPhone-like stack motion for every native stack. */
export const iosStackScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'slide_from_right',
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
  animationDuration: Platform.OS === 'ios' ? 350 : 280,
  contentStyle: { backgroundColor: 'transparent' },
};

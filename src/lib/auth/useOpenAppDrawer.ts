import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  APP_DRAWER_ID,
  openAppDrawer,
  type AnyNavigation,
} from './navigation';

/**
 * Stable hamburger handler for Home / Health / Community (and any nested screen).
 * Uses drawer navigator id so the left drawer opens from deep tab stacks.
 */
export function useOpenAppDrawer() {
  const navigation = useNavigation();

  return useCallback(() => {
    const nav = navigation as AnyNavigation;
    const drawer = nav.getParent?.(APP_DRAWER_ID as never) as
      | { openDrawer?: () => void; dispatch?: (a: unknown) => void }
      | undefined;

    if (typeof drawer?.openDrawer === 'function') {
      drawer.openDrawer();
      return;
    }

    openAppDrawer(nav);
  }, [navigation]);
}

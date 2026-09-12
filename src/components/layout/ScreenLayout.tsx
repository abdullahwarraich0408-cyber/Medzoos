import React, { ReactNode } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { TopNavigation } from '../navigation/TopNavigation';
import { AppBackground } from './AppBackground';
import { useCartContext } from '../../lib/cart/CartContext';
import { useNotifications } from '../../lib/notifications';
import {
  canPopCurrentStack,
  isDrawerRoute,
  navigateToMainTabs,
  navigateToTabScreen,
  openAppDrawer,
} from '../../lib/auth/navigation';
import type { DrawerParamList, MainTabParamList } from '../../navigation/types';

type ScreenLayoutNav = any;

type ScreenLayoutProps = {
  children: ReactNode;
  cartCount?: number;
  onCartPress?: () => void;
  /** Defaults to Appointments-style stack header (back/menu · title · actions). */
  headerMode?: 'main' | 'stack';
  title?: string;
  onBackPress?: () => void;
  /** Optional screen wash override (e.g. Home brand trial). */
  backgroundColor?: string;
  /**
   * When hideHeader is true, skip the status-bar spacer so a custom
   * full-bleed header can paint under the status bar itself.
   */
  embedSafeAreaInChildren?: boolean;
  showSearch?: boolean;
  showCart?: boolean;
  showBack?: boolean;
  showNotifications?: boolean;
  /** Hide the global top navigation bar (Home uses its own greeting). */
  hideHeader?: boolean;
  headerRight?: ReactNode;
  headerCenter?: ReactNode;
};

export function ScreenLayout({
  children,
  cartCount: cartCountOverride,
  onCartPress,
  headerMode = 'stack',
  title,
  onBackPress,
  backgroundColor,
  embedSafeAreaInChildren = false,
  showSearch = false,
  showCart = false,
  showBack = true,
  showNotifications = false,
  hideHeader = false,
  headerRight,
  headerCenter,
}: ScreenLayoutProps) {
  const navigation = useNavigation<ScreenLayoutNav>();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  );
  const { cartCount: medicineCartCount } = useCartContext();
  const { unreadCount } = useNotifications();

  const badgeCount = cartCountOverride ?? medicineCartCount;
  // Stack headers always use the circular back control (not hamburger).
  const canGoBack = showBack;
  const showStackMenu = false;

  const handleCartPress =
    onCartPress ??
    (() => {
      let nav: ScreenLayoutNav | undefined = navigation;
      while (nav) {
        const state = nav.getState?.();
        const routeNames = (state as { routeNames?: string[] } | undefined)
          ?.routeNames;
        if (routeNames?.includes('Cart')) {
          nav.navigate('Cart' as never);
          return;
        }
        nav = nav.getParent?.() as ScreenLayoutNav | undefined;
      }
      navigation.navigate('Health', { screen: 'Cart' });
    });

  const handleBackPress =
    onBackPress ??
    (() => {
      if (canPopCurrentStack(navigation)) {
        navigation.goBack();
        return;
      }
      if (isDrawerRoute(navigation)) {
        navigateToMainTabs(navigation, 'Home', 'Dashboard');
        return;
      }
      // Bottom-tab roots (Health, Community, You, Copilot) → Home
      navigateToMainTabs(navigation, 'Home', 'Dashboard');
    });

  const handleNotificationsPress = () => {
    navigateToTabScreen(navigation, 'You', 'Notifications');
  };

  return (
    <AppBackground style={backgroundColor ? { backgroundColor } : undefined}>
      {hideHeader ? (
        <>
          <StatusBar
            barStyle={embedSafeAreaInChildren ? 'light-content' : 'dark-content'}
            backgroundColor="transparent"
            translucent
          />
          {!embedSafeAreaInChildren ? (
            <View style={{ height: topInset }} />
          ) : null}
        </>
      ) : (
        <TopNavigation
          mode={headerMode}
          title={title}
          onBackPress={handleBackPress}
          onMenuPress={() => openAppDrawer(navigation)}
          onCartPress={handleCartPress}
          onNotificationsPress={handleNotificationsPress}
          cartCount={badgeCount}
          unreadCount={unreadCount}
          showSearch={showSearch}
          showCart={showCart}
          showBack={canGoBack}
          showNotifications={showNotifications}
          showMenu={headerMode === 'main' || showStackMenu}
          headerRight={headerRight}
          headerCenter={headerCenter}
        />
      )}
      <View style={styles.content}>{children}</View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
});

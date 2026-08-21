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
  const stackCanPop = canPopCurrentStack(navigation);
  const canGoBack = showBack && stackCanPop;
  // Tab roots (stack index 0) show the menu, not a dead back arrow.
  const isTabRoot = headerMode === 'stack' && !stackCanPop;
  const showStackMenu = isTabRoot;

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
      }
    });

  const handleNotificationsPress = () => {
    navigateToTabScreen(navigation, 'You', 'Notifications');
  };

  return (
    <AppBackground>
      {hideHeader ? (
        <>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="transparent"
            translucent
          />
          <View style={{ height: topInset }} />
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
          showNotifications={
            (showNotifications && headerMode === 'main') || isTabRoot
          }
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
  },
});

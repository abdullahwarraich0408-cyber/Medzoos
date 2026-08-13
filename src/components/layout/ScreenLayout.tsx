import React, { ReactNode } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopNavigation } from '../navigation/TopNavigation';
import { AppBackground } from './AppBackground';
import { useCartContext } from '../../lib/cart/CartContext';
import { useNotifications } from '../../lib/notifications';
import {
  isDrawerRoute,
  navigateToMainTabs,
  navigateToTabScreen,
  openAppDrawer,
} from '../../lib/auth/navigation';
import type { DrawerParamList, MainTabParamList } from '../../navigation/types';
import { colors } from '../../theme';

type ScreenLayoutNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  DrawerNavigationProp<DrawerParamList>
>;

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
  const { cartCount: medicineCartCount } = useCartContext();
  const { unreadCount } = useNotifications();

  const badgeCount = cartCountOverride ?? medicineCartCount;
  const canGoBack = showBack && navigation.canGoBack();
  // Tab roots can't go back — show menu like Appointments shows back.
  const showStackMenu = headerMode === 'stack' && !canGoBack;

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
      if (navigation.canGoBack()) {
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
        <View style={{ paddingTop: insets.top }}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        </View>
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
          showNotifications={showNotifications && headerMode === 'main'}
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

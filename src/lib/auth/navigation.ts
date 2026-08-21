import { CommonActions, DrawerActions } from '@react-navigation/native';

export type NavDispatch = any;
export type AnyNavigation = any;

export const APP_DRAWER_ID = 'AppDrawer';

const DRAWER_ROUTE_NAMES = new Set([
  'MainTabs',
  'Hospitals',
  'Pharmacies',
  'Offers',
  'Prescriptions',
  'Help',
  'Contact',
]);

function isDrawerNavigator(nav: NavDispatch | AnyNavigation) {
  const state = nav.getState?.() as
    | { type?: string; routeNames?: string[] }
    | undefined;
  if (state?.type === 'drawer') {
    return true;
  }

  const routeNames = state?.routeNames;
  if (!routeNames?.length) return false;

  return (
    routeNames.includes('MainTabs') &&
    routeNames.some(name => DRAWER_ROUTE_NAMES.has(name) && name !== 'MainTabs')
  );
}

export function getDrawerNavigation(navigation: NavDispatch | AnyNavigation) {
  const byId = navigation.getParent?.(APP_DRAWER_ID);
  if (byId && isDrawerNavigator(byId)) {
    return byId;
  }

  let nav: (NavDispatch | AnyNavigation) | undefined = navigation;
  while (nav) {
    if (isDrawerNavigator(nav)) {
      return nav;
    }
    nav = nav.getParent?.() as NavDispatch | AnyNavigation | undefined;
  }
  return null;
}

export function openAppDrawer(navigation: NavDispatch | AnyNavigation) {
  const drawer = getDrawerNavigation(navigation);

  if (drawer) {
    if (typeof drawer.openDrawer === 'function') {
      drawer.openDrawer();
      return;
    }
    drawer.dispatch(DrawerActions.openDrawer() as any);
    return;
  }

  navigation.dispatch?.(DrawerActions.openDrawer() as any);
}

/** Dispatch navigation actions from the drawer navigator so nested targets resolve reliably. */
export function dispatchFromDrawer(
  navigation: NavDispatch | AnyNavigation,
  action: ReturnType<typeof CommonActions.navigate>,
) {
  const drawer = getDrawerNavigation(navigation);
  (drawer ?? navigation).dispatch(action);
}

/**
 * True only when a stack above this screen can pop — ignores tab/drawer parents.
 * `navigation.canGoBack()` walks the whole tree and wrongly shows Back on tab roots.
 */
export function canPopCurrentStack(navigation: NavDispatch | AnyNavigation) {
  let nav: (NavDispatch | AnyNavigation) | undefined = navigation;
  while (nav) {
    const state = nav.getState?.() as
      | { type?: string; index?: number }
      | undefined;
    if (state?.type === 'tab' || state?.type === 'drawer') {
      break;
    }
    if (state?.type === 'stack' && (state.index ?? 0) > 0) {
      return true;
    }
    nav = nav.getParent?.() as NavDispatch | AnyNavigation | undefined;
  }
  return false;
}

/** True when the drawer is showing a standalone route (not MainTabs). */
export function isDrawerRoute(navigation: NavDispatch | AnyNavigation) {
  const drawer = getDrawerNavigation(navigation);
  if (!drawer) return false;
  const state = drawer.getState?.();
  if (!state) return false;
  const current = state.routes[state.index ?? 0]?.name;
  return current != null && current !== 'MainTabs';
}

export function navigateToMainTabs(
  navigation: NavDispatch,
  tab: MainTabName,
  nestedScreen?: string,
  nestedParams?: object,
) {
  dispatchFromDrawer(
    navigation,
    CommonActions.navigate({
      name: 'MainTabs',
      params: nestedScreen
        ? { screen: tab, params: { screen: nestedScreen, params: nestedParams } }
        : { screen: tab },
      merge: false,
    }),
  );
}

export function navigateToPhoneSignIn(navigation: NavDispatch) {
  navigateToSignIn(navigation);
}

export function navigateToSignIn(navigation: NavDispatch) {
  dispatchFromDrawer(
    navigation,
    CommonActions.navigate({
      name: 'MainTabs',
      params: {
        screen: 'You',
        params: { screen: 'SignIn' },
      },
      merge: false,
    }),
  );
}

export function navigateToRegister(navigation: NavDispatch) {
  dispatchFromDrawer(
    navigation,
    CommonActions.navigate({
      name: 'MainTabs',
      params: {
        screen: 'You',
        params: { screen: 'Register' },
      },
      merge: false,
    }),
  );
}

export type MainTabName = 'Home' | 'Copilot' | 'Health' | 'Community' | 'You';

export function navigateToMainTab(
  navigation: NavDispatch,
  tab: MainTabName | 'Consult' | 'Orders' | 'Account',
) {
  const resolved = resolveLegacyTab(tab);
  dispatchFromDrawer(
    navigation,
    CommonActions.navigate({
      name: 'MainTabs',
      params: { screen: resolved.tab, params: resolved.params },
      merge: false,
    }),
  );
}

export function navigateToTabScreen(
  navigation: NavDispatch,
  tab: 'Health' | 'Consult' | 'Home' | 'You',
  screen: string,
  params?: object,
) {
  if (tab === 'Consult') {
    dispatchFromDrawer(
      navigation,
      CommonActions.navigate({
        name: 'MainTabs',
        params: {
          screen: 'Home',
          params: { screen: 'Services', params: { screen, params } },
        },
        merge: false,
      }),
    );
    return;
  }

  dispatchFromDrawer(
    navigation,
    CommonActions.navigate({
      name: 'MainTabs',
      params: {
        screen: tab === 'You' ? 'You' : tab,
        params: { screen, params },
      },
      merge: false,
    }),
  );
}

export function navigateToOrders(navigation: NavDispatch) {
  dispatchFromDrawer(
    navigation,
    CommonActions.navigate({
      name: 'MainTabs',
      params: {
        screen: 'You',
        params: { screen: 'OrdersList' },
      },
      merge: false,
    }),
  );
}

export function navigateToServices(
  navigation: NavDispatch,
  screen: string,
  params?: object,
) {
  dispatchFromDrawer(
    navigation,
    CommonActions.navigate({
      name: 'MainTabs',
      params: {
        screen: 'Home',
        params: { screen: 'Services', params: { screen, params } },
      },
      merge: false,
    }),
  );
}

export function navigateToDrawerScreen(navigation: NavDispatch, screen: string) {
  const nestedParams =
    screen === 'Pharmacies'
      ? { screen: 'PharmaciesList' }
      : screen === 'Hospitals'
        ? { screen: 'HospitalsList' }
        : undefined;

  dispatchFromDrawer(
    navigation,
    CommonActions.navigate({
      name: screen,
      params: nestedParams,
      merge: false,
    }),
  );
}

export function navigateToPharmaciesList(navigation: NavDispatch) {
  dispatchFromDrawer(
    navigation,
    CommonActions.navigate({
      name: 'Pharmacies',
      params: { screen: 'PharmaciesList' },
      merge: false,
    }),
  );
}

export function navigateToPharmacyDetail(
  navigation: NavDispatch,
  params: { vendorId: string; slug?: string; name?: string },
) {
  dispatchFromDrawer(
    navigation,
    CommonActions.navigate({
      name: 'Pharmacies',
      params: { screen: 'PharmacyDetail', params },
      merge: false,
    }),
  );
}

export function navigateToHospitalsList(navigation: NavDispatch) {
  dispatchFromDrawer(
    navigation,
    CommonActions.navigate({
      name: 'Hospitals',
      params: { screen: 'HospitalsList' },
      merge: false,
    }),
  );
}

export function navigateToHospitalDetail(
  navigation: NavDispatch,
  params: { hospitalId: string; consultType?: 'online' | 'in_person' },
) {
  dispatchFromDrawer(
    navigation,
    CommonActions.navigate({
      name: 'Hospitals',
      params: { screen: 'HospitalDetail', params },
      merge: false,
    }),
  );
}

function resolveLegacyTab(
  tab: MainTabName | 'Consult' | 'Orders' | 'Account',
): { tab: MainTabName; params?: object } {
  switch (tab) {
    case 'Consult':
      return {
        tab: 'Home',
        params: { screen: 'Services', params: { screen: 'ConsultHome' } },
      };
    case 'Orders':
      return { tab: 'You', params: { screen: 'OrdersList' } };
    case 'Account':
      return { tab: 'You', params: { screen: 'YouHome' } };
    default:
      return { tab };
  }
}

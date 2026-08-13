import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import type { Route } from '@react-navigation/native';
import type { MainTabParamList } from './types';

/** Root screen per stack tab — tab bar visible only on these routes. */
export const TAB_ROOT_SCREENS: Partial<
  Record<keyof MainTabParamList, string>
> = {
  Home: 'Dashboard',
  Copilot: 'CopilotHome',
  Health: 'HealthHome',
  Community: 'CommunityHome',
  You: 'YouHome',
};

export function getFocusedTabRouteName(
  route: Route<string> | undefined,
): string | undefined {
  if (!route) return undefined;
  return getFocusedRouteNameFromRoute(route) ?? undefined;
}

export function shouldShowBottomTabBar(
  route: Route<string> | undefined,
): boolean {
  if (!route) return true;

  const tabName = route.name as keyof MainTabParamList;
  const rootScreen = TAB_ROOT_SCREENS[tabName];
  if (!rootScreen) return true;

  const focusedRoute = getFocusedRouteNameFromRoute(route);
  return !focusedRoute || focusedRoute === rootScreen;
}

export function getTabRootScreen(
  tabName: keyof MainTabParamList,
): string | undefined {
  return TAB_ROOT_SCREENS[tabName];
}

import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BottomTabBar } from '../components/navigation/BottomTabBar';
import { DrawerContent } from '../components/navigation/DrawerContent';
import { PharmaciesStack } from './PharmaciesStack';
import { HospitalsStack } from './HospitalsStack';
import {
  OffersScreen,
  PrescriptionsScreen,
  HelpScreen,
  ContactScreen,
} from '../screens';
import { HomeStack } from './HomeStack';
import { CopilotStack } from './CopilotStack';
import { HealthStack } from './HealthStack';
import { CommunityStack } from './CommunityStack';
import { YouStack } from './YouStack';
import { AuthStack } from './AuthStack';
import { shouldShowBottomTabBar } from './tabBarVisibility';
import { colors } from '../theme';
import { AppBackground } from '../components/layout/AppBackground';
import { APP_DRAWER_ID } from '../lib/auth/navigation';
import { useAuth } from '../lib/auth/AuthContext';
import { needsProfileCompletion } from '../lib/auth/needsProfileCompletion';
import { queryClient } from '../providers/QueryProvider';
import { prefetchAppCriticalData } from '../lib/bootstrap/prefetchAppCriticalData';
import {
  hasCompletedOnboarding,
  type OnboardingAuthTarget,
} from '../features/onboarding';
import type { GuestStackParamList, DrawerParamList, MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => {
        const currentRoute = props.state.routes[props.state.index];
        const visible = shouldShowBottomTabBar(currentRoute);
        return <BottomTabBar {...props} visible={visible} />;
      }}
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: 'transparent' },
      }}>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Copilot" component={CopilotStack} />
      <Tab.Screen name="Health" component={HealthStack} />
      <Tab.Screen name="Community" component={CommunityStack} />
      <Tab.Screen name="You" component={YouStack} />
    </Tab.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      id={APP_DRAWER_ID}
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: '82%',
          maxWidth: 320,
          backgroundColor: '#FFFFFF',
        },
        overlayColor: 'rgba(12, 69, 84, 0.32)',
        swipeEdgeWidth: 60,
        drawerStatusBarAnimation: 'fade',
      }}>
      <Drawer.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen name="Hospitals" component={HospitalsStack} />
      <Drawer.Screen name="Pharmacies" component={PharmaciesStack} />
      <Drawer.Screen name="Offers" component={OffersScreen} />
      <Drawer.Screen name="Prescriptions" component={PrescriptionsScreen} />
      <Drawer.Screen name="Help" component={HelpScreen} />
      <Drawer.Screen name="Contact" component={ContactScreen} />
    </Drawer.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const needsProfile = needsProfileCompletion(user);
  const showApp = !isLoading && isAuthenticated && !needsProfile;
  const [onboardingReady, setOnboardingReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [authEntry, setAuthEntry] = useState<'SignIn' | 'Register'>('SignIn');
  const [appDataReady, setAppDataReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hasCompletedOnboarding().then(done => {
      if (cancelled) return;
      setShowOnboarding(!done);
      setOnboardingReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Warm / refresh critical Home data before unlocking the main app shell
  // (covers post-login). If splash already prefetched, open immediately.
  useEffect(() => {
    if (!showApp) {
      setAppDataReady(false);
      return;
    }
    let cancelled = false;
    const cachedSlides = queryClient
      .getQueriesData({ queryKey: ['home-slides'] })
      .some(([, data]) => Array.isArray(data) && data.length > 0);

    if (cachedSlides) {
      setAppDataReady(true);
      void prefetchAppCriticalData(queryClient, { timeoutMs: 1500 });
      return;
    }

    setAppDataReady(false);
    prefetchAppCriticalData(queryClient, { timeoutMs: 1500 }).finally(() => {
      if (!cancelled) setAppDataReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [showApp]);

  const finishOnboarding = useCallback((target: OnboardingAuthTarget) => {
    setAuthEntry(target === 'register' ? 'Register' : 'SignIn');
    setShowOnboarding(false);
  }, []);

  if (!onboardingReady) {
    return <View style={styles.boot} />;
  }

  const authStart: keyof GuestStackParamList =
    isAuthenticated && needsProfile
      ? 'CompleteProfile'
      : showOnboarding
        ? 'Onboarding'
        : authEntry;

  return (
    <GestureHandlerRootView style={styles.root}>
      <AppBackground style={styles.root}>
        <NavigationContainer
          key={showApp ? 'app' : showOnboarding ? 'onboarding' : 'auth'}
          theme={{
            dark: false,
            colors: {
              primary: colors.primary700,
              background: colors.background,
              card: colors.surface,
              text: colors.textPrimary,
              border: colors.border,
              notification: colors.error,
            },
            fonts: {
              regular: { fontFamily: 'System', fontWeight: '400' },
              medium: { fontFamily: 'System', fontWeight: '500' },
              bold: { fontFamily: 'System', fontWeight: '700' },
              heavy: { fontFamily: 'System', fontWeight: '800' },
            },
          }}>
          {showApp ? (
            appDataReady ? (
              <DrawerNavigator />
            ) : (
              <View style={styles.boot} />
            )
          ) : (
            <AuthStack
              initialRouteName={authStart}
              onOnboardingComplete={finishOnboarding}
            />
          )}
        </NavigationContainer>
      </AppBackground>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  boot: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

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
import { shouldShowBottomTabBar } from './tabBarVisibility';
import { colors } from '../theme';
import { AppBackground } from '../components/layout/AppBackground';
import type { DrawerParamList, MainTabParamList } from './types';

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
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: '82%',
          maxWidth: 320,
          backgroundColor: colors.surfaceBase,
        },
        overlayColor: 'rgba(12, 26, 46, 0.45)',
        swipeEdgeWidth: 60,
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
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppBackground style={styles.root}>
        <NavigationContainer
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
          <DrawerNavigator />
        </NavigationContainer>
      </AppBackground>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

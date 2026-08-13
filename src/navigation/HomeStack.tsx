import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HealthDashboardPage } from '../features/dashboard/HealthDashboardPage';
import { ServicesHubScreen } from '../features/services/ServicesHubScreen';
import { ServicesStack } from './ServicesStack';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={HealthDashboardPage} />
      <Stack.Screen name="ServicesHub" component={ServicesHubScreen} />
      <Stack.Screen name="Services" component={ServicesStack} />
    </Stack.Navigator>
  );
}

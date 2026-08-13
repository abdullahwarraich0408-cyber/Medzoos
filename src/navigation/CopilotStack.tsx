import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CopilotHomeScreen } from '../features/copilot/CopilotHomeScreen';
import type { CopilotStackParamList } from './types';

const Stack = createNativeStackNavigator<CopilotStackParamList>();

export function CopilotStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CopilotHome" component={CopilotHomeScreen} />
    </Stack.Navigator>
  );
}

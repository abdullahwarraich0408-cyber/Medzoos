import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { iosStackScreenOptions } from './iosStackOptions';
import { CopilotHomeScreen } from '../features/copilot/CopilotHomeScreen';
import type { CopilotStackParamList } from './types';

const Stack = createNativeStackNavigator<CopilotStackParamList>();

export function CopilotStack() {
  return (
    <Stack.Navigator screenOptions={iosStackScreenOptions}>
      <Stack.Screen name="CopilotHome" component={CopilotHomeScreen} />
    </Stack.Navigator>
  );
}

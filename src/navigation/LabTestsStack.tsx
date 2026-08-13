import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LabTestsPage } from '../features/lab-tests/LabTestsPage';
import { LabTestBookingScreen } from '../features/lab-tests/screens/LabTestBookingScreen';
import { LabCartScreen } from '../features/lab-tests/screens/LabCartScreen';
import { LabReportsScreen } from '../features/lab-tests/screens/LabReportsScreen';
import type { LabTestsStackParamList } from './types';

const Stack = createNativeStackNavigator<LabTestsStackParamList>();

export function LabTestsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LabTestsList" component={LabTestsPage} />
      <Stack.Screen name="LabTestBooking" component={LabTestBookingScreen} />
      <Stack.Screen name="LabCart" component={LabCartScreen} />
      <Stack.Screen name="LabReports" component={LabReportsScreen} />
    </Stack.Navigator>
  );
}

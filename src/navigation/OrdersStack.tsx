import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OrdersListScreen } from '../features/orders/screens/OrdersListScreen';
import { OrderDetailScreen } from '../features/orders/screens/OrderDetailScreen';
import { AppointmentsScreen } from '../features/appointments/screens/AppointmentsScreen';
import { AppointmentDetailScreen } from '../features/appointments/screens/AppointmentDetailScreen';
import { AppointmentVideoScreen } from '../features/appointments/screens/AppointmentVideoScreen';
import { AppointmentChatScreen } from '../features/doctors/screens/AppointmentChatScreen';
import type { OrdersStackParamList } from './types';

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrdersList" component={OrdersListScreen} />
      <Stack.Screen name="Appointments" component={AppointmentsScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
      <Stack.Screen name="AppointmentVideo" component={AppointmentVideoScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="AppointmentChat" component={AppointmentChatScreen} />
    </Stack.Navigator>
  );
}

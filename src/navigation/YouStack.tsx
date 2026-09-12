import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { iosStackScreenOptions } from './iosStackOptions';
import { AccountHomeScreen } from '../features/account/screens/AccountHomeScreen';
import { ProfileScreen } from '../features/account/screens/ProfileScreen';
import { AddressesScreen } from '../features/account/screens/AddressesScreen';
import { PaymentsScreen } from '../features/account/screens/PaymentsScreen';
import { NotificationsScreen } from '../features/account/screens/NotificationsScreen';
import { SettingsScreen } from '../features/account/screens/SettingsScreen';
import { PrivacySecurityScreen } from '../features/account/screens/PrivacySecurityScreen';
import { SupportScreen } from '../features/account/screens/SupportScreen';
import { SignInScreen } from '../features/auth/screens/SignInScreen';
import { PhoneSignInScreen } from '../features/auth/screens/PhoneSignInScreen';
import { OtpVerifyScreen } from '../features/auth/screens/OtpVerifyScreen';
import { CompleteProfileScreen } from '../features/auth/screens/CompleteProfileScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { ForgotPasswordScreen } from '../features/auth/screens/ForgotPasswordScreen';
import { OrdersListScreen } from '../features/orders/screens/OrdersListScreen';
import { OrderDetailScreen } from '../features/orders/screens/OrderDetailScreen';
import { AppointmentsScreen } from '../features/appointments/screens/AppointmentsScreen';
import { AppointmentDetailScreen } from '../features/appointments/screens/AppointmentDetailScreen';
import { AppointmentVideoScreen } from '../features/appointments/screens/AppointmentVideoScreen';
import { AppointmentChatScreen } from '../features/doctors/screens/AppointmentChatScreen';
import type { YouStackParamList } from './types';

const Stack = createNativeStackNavigator<YouStackParamList>();

export function YouStack() {
  return (
    <Stack.Navigator screenOptions={iosStackScreenOptions}>
      <Stack.Screen name="YouHome" component={AccountHomeScreen} />
      <Stack.Screen name="OrdersList" component={OrdersListScreen} />
      <Stack.Screen name="Appointments" component={AppointmentsScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
      <Stack.Screen name="AppointmentVideo" component={AppointmentVideoScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="AppointmentChat" component={AppointmentChatScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Addresses" component={AddressesScreen} />
      <Stack.Screen name="Payments" component={PaymentsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="PhoneSignIn" component={PhoneSignInScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

/** @deprecated Use YouStack */
export const AccountStack = YouStack;

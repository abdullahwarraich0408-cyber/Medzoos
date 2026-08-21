import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { iosStackScreenOptions } from './iosStackOptions';
import { SignInScreen } from '../features/auth/screens/SignInScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { ForgotPasswordScreen } from '../features/auth/screens/ForgotPasswordScreen';
import { PhoneSignInScreen } from '../features/auth/screens/PhoneSignInScreen';
import { OtpVerifyScreen } from '../features/auth/screens/OtpVerifyScreen';
import { CompleteProfileScreen } from '../features/auth/screens/CompleteProfileScreen';
import { OnboardingScreen } from '../features/onboarding';
import type { OnboardingAuthTarget } from '../features/onboarding';
import type { GuestStackParamList } from './types';

const Stack = createNativeStackNavigator<GuestStackParamList>();

type AuthStackProps = {
  initialRouteName?: keyof GuestStackParamList;
  onOnboardingComplete?: (target: OnboardingAuthTarget) => void;
};

export function AuthStack({
  initialRouteName = 'SignIn',
  onOnboardingComplete,
}: AuthStackProps) {
  return (
    <Stack.Navigator
      screenOptions={iosStackScreenOptions}
      initialRouteName={initialRouteName}>
      <Stack.Screen
        name="Onboarding"
        options={{ gestureEnabled: false, animation: 'fade' }}>
        {({ navigation }) => (
          <OnboardingScreen
            onComplete={target => {
              onOnboardingComplete?.(target);
              navigation.replace(target === 'register' ? 'Register' : 'SignIn');
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="PhoneSignIn" component={PhoneSignInScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
    </Stack.Navigator>
  );
}

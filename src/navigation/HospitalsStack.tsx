import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ConsultHospitalsScreen } from '../features/consult/ConsultHospitalsScreen';
import { HospitalDetailScreen } from '../features/hospitals/screens/HospitalDetailScreen';
import { DoctorProfileScreen } from '../features/doctors/screens/DoctorProfileScreen';
import { DoctorBookingScreen } from '../features/doctors/screens/DoctorBookingScreen';
import type { HospitalsStackParamList } from './types';

const Stack = createNativeStackNavigator<HospitalsStackParamList>();

export function HospitalsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HospitalsList" component={ConsultHospitalsScreen} />
      <Stack.Screen name="HospitalDetail" component={HospitalDetailScreen} />
      <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
      <Stack.Screen name="DoctorBooking" component={DoctorBookingScreen} />
    </Stack.Navigator>
  );
}

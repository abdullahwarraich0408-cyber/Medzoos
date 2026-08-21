import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { iosStackScreenOptions } from './iosStackOptions';
import { ConsultHomePage } from '../features/consult/ConsultHomePage';
import { ConsultHospitalsScreen } from '../features/consult/ConsultHospitalsScreen';
import { HospitalDetailScreen } from '../features/hospitals/screens/HospitalDetailScreen';
import { ConsultSpecialtiesScreen } from '../features/consult/ConsultSpecialtiesScreen';
import { DoctorsPage } from '../features/doctors/DoctorsPage';
import { DoctorProfileScreen } from '../features/doctors/screens/DoctorProfileScreen';
import { DoctorBookingScreen } from '../features/doctors/screens/DoctorBookingScreen';
import { HealthPackagesScreen } from '../features/health/screens/HealthPackagesScreen';
import { LabTestsScreen } from '../features/health/screens/LabTestsScreen';
import { LabsListScreen } from '../features/lab-tests/screens/LabsListScreen';
import { LabDetailScreen } from '../features/lab-tests/screens/LabDetailScreen';
import { LabTestBookingScreen } from '../features/lab-tests/screens/LabTestBookingScreen';
import { LabCartScreen } from '../features/lab-tests/screens/LabCartScreen';
import { ReportsScreen } from '../features/health/screens/ReportsScreen';
import type { DoctorsStackParamList } from './types';

const Stack = createNativeStackNavigator<DoctorsStackParamList>();

export function DoctorsStack() {
  return (
    <Stack.Navigator screenOptions={iosStackScreenOptions}>
      <Stack.Screen name="ConsultHome" component={ConsultHomePage} />
      <Stack.Screen name="DoctorsList" component={DoctorsPage} />
      <Stack.Screen name="HospitalsList" component={ConsultHospitalsScreen} />
      <Stack.Screen name="HospitalDetail" component={HospitalDetailScreen} />
      <Stack.Screen name="Specialties" component={ConsultSpecialtiesScreen} />
      <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
      <Stack.Screen name="DoctorBooking" component={DoctorBookingScreen} />
      <Stack.Screen name="HealthPackages" component={HealthPackagesScreen} />
      <Stack.Screen name="LabTestsList" component={LabTestsScreen} />
      <Stack.Screen name="LabsList" component={LabsListScreen} />
      <Stack.Screen name="LabDetail" component={LabDetailScreen} />
      <Stack.Screen name="LabTestBooking" component={LabTestBookingScreen} />
      <Stack.Screen name="LabCart" component={LabCartScreen} />
      <Stack.Screen name="LabReports" component={ReportsScreen} />
    </Stack.Navigator>
  );
}

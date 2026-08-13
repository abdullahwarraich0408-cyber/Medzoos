import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HealthHomePage } from '../features/health/HealthHomePage';
import { MedicalRecordsScreen } from '../features/health/screens/MedicalRecordsScreen';
import { DoctorRecordsDetailScreen } from '../features/health/screens/DoctorRecordsDetailScreen';
import { LabRecordsDetailScreen } from '../features/health/screens/LabRecordsDetailScreen';
import { FamilyProfilesScreen } from '../features/health/screens/FamilyProfilesScreen';
import { FamilyMemberDetailScreen } from '../features/health/screens/FamilyMemberDetailScreen';
import { HealthHistoryScreen } from '../features/health/screens/HealthHistoryScreen';
import { MedicinesPage } from '../features/medicines/MedicinesPage';
import { MedicineDetailScreen } from '../features/medicines/screens/MedicineDetailScreen';
import { PrescriptionDetailScreen } from '../features/medicines/screens/PrescriptionDetailScreen';
import { ProductDetailScreen } from '../features/medicines/screens/ProductDetailScreen';
import { CartScreen } from '../features/medicines/screens/CartScreen';
import { CheckoutScreen } from '../features/medicines/screens/CheckoutScreen';
import { ReportsScreen } from '../features/health/screens/ReportsScreen';
import type { HealthStackParamList } from './types';

const Stack = createNativeStackNavigator<HealthStackParamList>();

export function HealthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HealthHome" component={HealthHomePage} />
      <Stack.Screen name="MedicinesList" component={MedicinesPage} />
      <Stack.Screen name="MedicineDetail" component={MedicineDetailScreen} />
      <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetailScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="LabReports" component={ReportsScreen} />
      <Stack.Screen name="MedicalRecords" component={MedicalRecordsScreen} />
      <Stack.Screen name="DoctorRecordsDetail" component={DoctorRecordsDetailScreen} />
      <Stack.Screen name="LabRecordsDetail" component={LabRecordsDetailScreen} />
      <Stack.Screen name="FamilyProfiles" component={FamilyProfilesScreen} />
      <Stack.Screen name="FamilyMemberDetail" component={FamilyMemberDetailScreen} />
      <Stack.Screen name="HealthHistory" component={HealthHistoryScreen} />
    </Stack.Navigator>
  );
}

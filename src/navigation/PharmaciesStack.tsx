import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PharmaciesListScreen } from '../features/pharmacies/screens/PharmaciesListScreen';
import { PharmacyDetailScreen } from '../features/pharmacies/screens/PharmacyDetailScreen';
import { ProductDetailScreen } from '../features/medicines/screens/ProductDetailScreen';
import { CartScreen } from '../features/medicines/screens/CartScreen';
import { CheckoutScreen } from '../features/medicines/screens/CheckoutScreen';
import type { PharmaciesStackParamList } from './types';

const Stack = createNativeStackNavigator<PharmaciesStackParamList>();

export function PharmaciesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PharmaciesList" component={PharmaciesListScreen} />
      <Stack.Screen name="PharmacyDetail" component={PharmacyDetailScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}

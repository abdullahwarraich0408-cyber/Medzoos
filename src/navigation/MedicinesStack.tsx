import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MedicinesPage } from '../features/medicines/MedicinesPage';
import { ProductDetailScreen } from '../features/medicines/screens/ProductDetailScreen';
import { CartScreen } from '../features/medicines/screens/CartScreen';
import { CheckoutScreen } from '../features/medicines/screens/CheckoutScreen';
import type { MedicinesStackParamList } from './types';

const Stack = createNativeStackNavigator<MedicinesStackParamList>();

export function MedicinesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MedicinesList" component={MedicinesPage} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}

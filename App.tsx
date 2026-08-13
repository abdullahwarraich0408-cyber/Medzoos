/**
 * Medzoos Mobile App
 * @format
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/lib/auth/AuthContext';
import { QueryProvider } from './src/providers/QueryProvider';
import { CartProvider } from './src/lib/cart/CartContext';
import { LocationProvider } from './src/lib/location/LocationContext';
import { NotificationProvider } from './src/lib/notifications';
import { AppAlertProvider } from './src/components/modal/AppAlertProvider';

function App() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <NotificationProvider>
            <LocationProvider>
              <CartProvider>
                <AppAlertProvider>
                  <AppNavigator />
                </AppAlertProvider>
              </CartProvider>
            </LocationProvider>
          </NotificationProvider>
        </AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}

export default App;

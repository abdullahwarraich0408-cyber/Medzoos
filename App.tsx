/**
 * Medzoos Mobile App
 * @format
 */

import React, { useCallback, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/lib/auth/AuthContext';
import { QueryProvider } from './src/providers/QueryProvider';
import { CartProvider } from './src/lib/cart/CartContext';
import { LocationProvider } from './src/lib/location/LocationContext';
import { NotificationProvider } from './src/lib/notifications';
import { AppAlertProvider } from './src/components/modal/AppAlertProvider';
import { SplashScreen } from './src/components/branding/SplashScreen';
import { colors } from './src/theme';

function AppShell() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent
      />
      {showSplash ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        <NotificationProvider>
          <LocationProvider>
            <CartProvider>
              <AppAlertProvider>
                <AppNavigator />
              </AppAlertProvider>
            </CartProvider>
          </LocationProvider>
        </NotificationProvider>
      )}
    </View>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
});

export default App;

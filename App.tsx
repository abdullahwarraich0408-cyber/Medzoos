/**
 * Medzoos Mobile App
 * @format
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider, useAuth } from './src/lib/auth/AuthContext';
import { QueryProvider, queryClient } from './src/providers/QueryProvider';
import { CartProvider } from './src/lib/cart/CartContext';
import { LocationProvider } from './src/lib/location/LocationContext';
import { NotificationProvider } from './src/lib/notifications';
import { AppAlertProvider } from './src/components/modal/AppAlertProvider';
import {
  SplashScreen,
  SPLASH_DATA_MAX_MS,
} from './src/components/branding/SplashScreen';
import { prefetchAppCriticalData } from './src/lib/bootstrap/prefetchAppCriticalData';
import { needsProfileCompletion } from './src/lib/auth/needsProfileCompletion';

function AppShell() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [bootReady, setBootReady] = useState(false);
  const prefetchStarted = useRef(false);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const canEnterApp =
      isAuthenticated && !needsProfileCompletion(user);

    if (!canEnterApp) {
      setBootReady(true);
      return;
    }

    if (prefetchStarted.current) return;
    prefetchStarted.current = true;

    let cancelled = false;
    (async () => {
      await prefetchAppCriticalData(queryClient, {
        timeoutMs: SPLASH_DATA_MAX_MS,
      });
      if (!cancelled) {
        setBootReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoading, isAuthenticated, user]);

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent
      />
      {showSplash ? (
        <SplashScreen
          onFinish={handleSplashFinish}
          ready={!isLoading && bootReady}
        />
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

import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import type { YouStackParamList } from '../../../navigation/types';
import { youBrand } from '../youBrand';

type Nav = NativeStackNavigationProp<YouStackParamList, 'Profile'>;

/**
 * Legacy Profile summary — redirects to Edit Profile (Settings).
 * Kept so any deep links to "Profile" still land on the form.
 */
export function ProfileScreen() {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    navigation.replace('Settings');
  }, [navigation]);

  return (
    <ScreenLayout
      headerMode="stack"
      title="Edit Profile"
      showSearch={false}
      backgroundColor={youBrand.page}>
      <View style={styles.center}>
        <ActivityIndicator size="large" color={youBrand.accent} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

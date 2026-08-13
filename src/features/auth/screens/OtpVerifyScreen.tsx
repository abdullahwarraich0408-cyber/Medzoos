import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useAuth } from '../../../lib/auth/AuthContext';
import type { AccountStackParamList } from '../../../navigation/types';
import { spacing } from '../../../theme';
import { AuthInput } from '../components/AuthInput';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { AuthLink, AuthPrimaryButton } from '../components/AuthButtons';
import { formatFirebaseAuthError } from '../../../lib/auth/firebaseErrors';

export function OtpVerifyScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList>>();
  const route = useRoute<RouteProp<AccountStackParamList, 'OtpVerify'>>();
  const { completePhoneLogin, consumePendingAction } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const { phone, confirmation } = route.params;

  const handleSuccess = () => {
    const pending = consumePendingAction();
    if (pending?.returnTo && navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('YouHome');
    }
  };

  const handleVerify = async () => {
    if (code.trim().length < 4) {
      Alert.alert('Invalid code', 'Enter the OTP sent to your phone.');
      return;
    }

    setLoading(true);
    try {
      await completePhoneLogin(confirmation, code.trim());
      Alert.alert('Welcome!', 'You are signed in.', [
        { text: 'Continue', onPress: handleSuccess },
      ]);
    } catch (err) {
      Alert.alert('Verification failed', formatFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title="Enter OTP"
      subtitle={
        confirmation.dev
          ? `Local login for ${phone} — enter 123456`
          : `Code sent to ${phone}`
      }>
      <AuthInput
        label="One-time password"
        icon="shield-key-outline"
        value={code}
        onChangeText={setCode}
        placeholder={confirmation.dev ? '123456' : '6-digit code'}
        keyboardType="number-pad"
        maxLength={6}
      />

      <AuthPrimaryButton label="Verify & Continue" loading={loading} onPress={handleVerify} />

      <View style={styles.footer}>
        <AuthLink onPress={() => navigation.goBack()}>Change phone number</AuthLink>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
});

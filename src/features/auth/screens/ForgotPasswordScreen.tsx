import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { authApi } from '../../../lib/api';
import { AuthInput } from '../components/AuthInput';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { AuthLink, AuthPrimaryButton } from '../components/AuthButtons';
import { authUi } from '../authUi';

export function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (/failed to fetch|network/i.test(message)) {
        Alert.alert(
          'Connection issue',
          "We couldn't connect right now. Check your internet connection and try again.",
        );
      } else {
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthScreenLayout
        title="Password Reset Sent."
        subtitle="Please check your email in a few minutes — we've sent you a password recovery link."
        badge="PATIENT APP"
        headerGraphic={
          <View style={styles.resetGraphic}>
            <Icon name="shield-lock-outline" size={48} color={authUi.accent} />
          </View>
        }>
        <AuthPrimaryButton
          label="Open Email App"
          icon="email-fast-outline"
          onPress={() => Linking.openURL('mailto:')}
        />
        <View style={styles.switchWrap}>
          <AuthLink onPress={() => navigation.goBack()}>Back to Sign In</AuthLink>
        </View>
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout
      title="Reset Password"
      subtitle="Enter your email address to receive recovery instructions."
      badge="PATIENT APP">
      <AuthInput
        label="Email Address"
        icon="email-outline"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email address..."
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        error={error}
      />

      <AuthPrimaryButton
        label="Send Recovery Link"
        loading={loading}
        loadingLabel="Sending..."
        onPress={handleSubmit}
      />

      <View style={styles.switchWrap}>
        <AuthLink onPress={() => navigation.goBack()}>Back to Sign In</AuthLink>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  resetGraphic: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: authUi.graphicBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: authUi.graphicBorder,
    marginBottom: 8,
  },
  switchWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
});

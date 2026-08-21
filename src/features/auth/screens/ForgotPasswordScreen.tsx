import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authApi } from '../../../lib/api';
import { AuthInput } from '../components/AuthInput';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { AuthLink, AuthPrimaryButton } from '../components/AuthButtons';
import { spacing } from '../../../theme';

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

  return (
    <AuthScreenLayout
      title={sent ? 'Check your inbox' : 'Reset your password'}
      subtitle={
        sent
          ? "If an account matches that email, we'll send reset instructions shortly."
          : 'Enter the email linked to your Medzoos account and we will help you get back in.'
      }
      kicker="Account recovery"
      compact>
      {sent ? (
        <AuthPrimaryButton
          label="Back to Sign In"
          showArrow={false}
          onPress={() => navigation.goBack()}
        />
      ) : (
        <>
          <AuthInput
            label="Email address"
            icon="email-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            error={error}
          />

          <AuthPrimaryButton
            label="Send reset link"
            loading={loading}
            loadingLabel="Sending..."
            showArrow={false}
            onPress={handleSubmit}
          />

          <View style={styles.backRow}>
            <AuthLink onPress={() => navigation.goBack()}>Back to Sign In</AuthLink>
          </View>
        </>
      )}
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  backRow: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
});

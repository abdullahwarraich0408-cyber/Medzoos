import React, { useState } from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authApi } from '../../../lib/api';
import { colors, spacing } from '../../../theme';
import { AuthInput } from '../components/AuthInput';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { AuthLink, AuthPrimaryButton } from '../components/AuthButtons';

export function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      Alert.alert(
        'Request failed',
        err instanceof Error ? err.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a reset link.">
      {sent ? (
        <>
          <Text style={styles.successText}>
            If an account exists for {email}, you will receive password reset
            instructions shortly. Check your inbox.
          </Text>
          <AuthLink onPress={() => navigation.goBack()}>
            Back to Sign In
          </AuthLink>
        </>
      ) : (
        <>
          <AuthInput
            label="Email Address"
            icon="email-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <AuthPrimaryButton
            label="Send Reset Link"
            loading={loading}
            onPress={handleSubmit}
          />

          <Text style={styles.hint}>
            Remember your password?
          </Text>
          <AuthLink onPress={() => navigation.goBack()}>Sign in</AuthLink>
        </>
      )}
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  successText: {
    fontSize: 14,
    color: colors.neutral600,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  hint: {
    fontSize: 14,
    color: colors.neutral600,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../lib/auth/AuthContext';
import type { AccountStackParamList } from '../../../navigation/types';
import { colors, spacing } from '../../../theme';
import { AuthInput } from '../components/AuthInput';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { AuthLink, AuthPrimaryButton } from '../components/AuthButtons';

export function SignInScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList>>();
  const { loginWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSuccess = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('YouHome');
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      Alert.alert('Welcome back!', 'You are now signed in.', [
        { text: 'OK', onPress: handleSuccess },
      ]);
    } catch (err) {
      Alert.alert(
        'Sign in failed',
        err instanceof Error ? err.message : 'Please check your credentials.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title="Sign In"
      subtitle="Enter your details to access your account.">
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

      <AuthInput
        label="Password"
        icon="lock-outline"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
        autoComplete="password"
      />

      <View style={styles.row}>
        <View />
        <AuthLink onPress={() => navigation.navigate('ForgotPassword')}>
          Forgot password?
        </AuthLink>
      </View>

      <AuthPrimaryButton
        label="Sign In"
        loading={loading}
        onPress={handleSubmit}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('PhoneSignIn')}
          activeOpacity={0.7}
          style={styles.phoneLink}>
          <Text style={styles.phoneLinkText}>Sign in with phone instead</Text>
        </TouchableOpacity>
        <View style={styles.registerRow}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <AuthLink onPress={() => navigation.navigate('Register')}>
            Create one now
          </AuthLink>
        </View>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
  },
  footer: {
    marginTop: spacing.xl,
    gap: spacing.md,
    alignItems: 'center',
  },
  phoneLink: {
    paddingVertical: spacing.sm,
  },
  phoneLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  registerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.neutral600,
  },
});

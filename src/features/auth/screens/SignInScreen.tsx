import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../lib/auth/AuthContext';
import type { AccountStackParamList } from '../../../navigation/types';
import { colors, spacing } from '../../../theme';
import { AuthInput } from '../components/AuthInput';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { AuthDivider, AuthLink, AuthPrimaryButton } from '../components/AuthButtons';
import { SocialLogin } from '../components/SocialLogin';
import { continueAfterAuth } from '../../../lib/auth/needsProfileCompletion';

export function SignInScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList>>();
  const { loginWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErrors, setEmailErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const afterAuth = (sessionUser?: { name?: string | null; email?: string | null } | null) => {
    continueAfterAuth(navigation, sessionUser);
  };

  const submitEmail = async () => {
    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) nextErrors.email = 'Please enter your email address.';
    if (!password) nextErrors.password = 'Please enter your password.';
    setEmailErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const sessionUser = await loginWithEmail(email.trim(), password);
      afterAuth(sessionUser);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'The email or password you entered is incorrect.';
      Alert.alert("We couldn't sign you in", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title="Welcome back"
      subtitle="Sign in to continue your care."
      kicker="Patient access"
      showBack={false}>
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
        error={emailErrors.email}
      />
      <AuthInput
        label="Password"
        icon="lock-outline"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        isPassword
        autoComplete="password"
        textContentType="password"
        error={emailErrors.password}
      />
      <View style={styles.row}>
        <AuthLink onPress={() => navigation.navigate('ForgotPassword')}>
          Forgot password?
        </AuthLink>
      </View>
      <AuthPrimaryButton
        label="Sign in"
        loading={loading}
        loadingLabel="Signing in..."
        showArrow={false}
        onPress={submitEmail}
      />
      <AuthDivider />
      <SocialLogin onSuccess={afterAuth} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don&apos;t have an account? </Text>
        <AuthLink onPress={() => navigation.navigate('Register')}>Sign up</AuthLink>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  footer: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.neutral600,
  },
});

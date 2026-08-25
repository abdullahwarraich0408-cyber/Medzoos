import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../lib/auth/AuthContext';
import type { AccountStackParamList } from '../../../navigation/types';
import { AuthInput } from '../components/AuthInput';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import {
  AuthDivider,
  AuthLink,
  AuthPrimaryButton,
  AuthSecondaryButton,
} from '../components/AuthButtons';
import { SocialLogin } from '../components/SocialLogin';
import { continueAfterAuth } from '../../../lib/auth/needsProfileCompletion';
import { authUi } from '../authUi';

export function SignInScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList>>();
  const { loginWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [loading, setLoading] = useState(false);

  const afterAuth = (
    sessionUser?: { name?: string | null; email?: string | null } | null,
  ) => {
    continueAfterAuth(navigation, sessionUser);
  };

  const submit = async () => {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = 'Please enter your email address.';
    if (!password) next.password = 'Please enter your password.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const sessionUser = await loginWithEmail(email.trim(), password);
      afterAuth(sessionUser);
    } catch (err) {
      Alert.alert(
        "We couldn't sign you in",
        err instanceof Error
          ? err.message
          : 'The email or password you entered is incorrect.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title="Sign In to Medzoos"
      subtitle="Access your patient care workspace securely."
      badge="PATIENT APP"
      showBack={false}>
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
        error={errors.email}
      />
      <AuthInput
        label="Password"
        icon="lock-outline"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••••••"
        isPassword
        autoComplete="password"
        textContentType="password"
        error={errors.password}
      />

      <View style={styles.optionsRow}>
        <Pressable
          style={styles.checkboxRow}
          onPress={() => setRememberMe(v => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: rememberMe }}>
          <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
            {rememberMe ? (
              <Icon name="check" size={12} color={authUi.white} />
            ) : null}
          </View>
          <Text style={styles.checkboxLabel}>Remember for 30 days</Text>
        </Pressable>
        <AuthLink onPress={() => navigation.navigate('ForgotPassword')}>
          Forgot Password
        </AuthLink>
      </View>

      <AuthPrimaryButton
        label="Sign In"
        loading={loading}
        loadingLabel="Signing In..."
        onPress={submit}
      />
      <AuthSecondaryButton
        label="Create New Account"
        onPress={() => navigation.navigate('Register')}
      />
      <AuthDivider />
      <SocialLogin onSuccess={afterAuth} />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: authUi.inputBorder,
    backgroundColor: authUi.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: authUi.medicalBlue,
    borderColor: authUi.accent,
  },
  checkboxLabel: {
    fontSize: 12,
    color: authUi.muted,
    fontWeight: '600',
  },
});

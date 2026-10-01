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
} from '../components/AuthButtons';
import { SocialLogin } from '../components/SocialLogin';
import { continueAfterAuth } from '../../../lib/auth/needsProfileCompletion';
import { authLayout } from '../authLayout';
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
  const { s } = authLayout;

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
      title="Welcome Back"
      subtitle="Sign in to continue your care journey"
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

      <Pressable
        style={[styles.checkboxRow, { gap: s(8) }]}
        onPress={() => setRememberMe(v => !v)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: rememberMe }}>
        <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
          {rememberMe ? (
            <Icon name="check" size={s(11)} color={authUi.white} />
          ) : null}
        </View>
        <Text style={[styles.checkboxLabel, { fontSize: s(12), letterSpacing: 0.1 }]}>
          Remember for 30 days
        </Text>
      </Pressable>

      <AuthPrimaryButton
        label="Sign In"
        loading={loading}
        loadingLabel="Signing In..."
        onPress={submit}
        showArrow
      />

      <AuthLink muted onPress={() => navigation.navigate('ForgotPassword')}>
        Forgot your password?
      </AuthLink>

      <AuthDivider label="Or sign in with" />
      <SocialLogin onSuccess={afterAuth} />

      <View style={[styles.footerRow, { gap: s(6), marginTop: s(4) }]}>
        <Text style={[styles.footerMuted, { fontSize: s(13), letterSpacing: 0.1 }]}>
          New to Medzoos?
        </Text>
        <AuthLink onPress={() => navigation.navigate('Register')}>
          Create account
        </AuthLink>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: authUi.inputBorder,
    backgroundColor: authUi.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: authUi.accent,
    borderColor: authUi.accent,
  },
  checkboxLabel: {
    color: authUi.muted,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 2,
  },
  footerMuted: {
    color: authUi.muted,
    fontWeight: '400',
  },
});

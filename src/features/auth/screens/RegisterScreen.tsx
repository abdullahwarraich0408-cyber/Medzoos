import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../../lib/auth/AuthContext';
import type { AccountStackParamList } from '../../../navigation/types';
import { AuthInput } from '../components/AuthInput';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { AuthLink, AuthPrimaryButton } from '../components/AuthButtons';
import { normalizePhoneNumber } from '../../../lib/auth/phoneUtils';
import { continueAfterAuth } from '../../../lib/auth/needsProfileCompletion';
import { authUi } from '../authUi';

function passwordStrength(password: string) {
  if (!password) return null;
  if (password.length < 6) {
    return { label: 'Weak! Add more characters', color: authUi.warning };
  }
  if (password.length < 10) {
    return { label: 'Medium strength', color: authUi.accent };
  }
  return { label: 'Password strength: Great!', color: authUi.teal };
}

export function RegisterScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList>>();
  const { registerWithEmail } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const handleSuccess = (
    sessionUser?: { name?: string | null; email?: string | null } | null,
  ) => {
    continueAfterAuth(navigation, sessionUser);
  };

  const handleSubmit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      nextErrors.name = 'Please enter your full name.';
    }
    if (phone.trim()) {
      const formatted = normalizePhoneNumber(phone);
      if (!formatted.startsWith('+') || formatted.length < 11) {
        nextErrors.phone =
          'Enter a valid Pakistan mobile number, such as 03XX XXXXXXX.';
      }
    }
    if (!email.trim()) nextErrors.email = 'Please enter your email address.';
    if (!password) nextErrors.password = 'Please create a password.';
    else if (password.length < 8) {
      nextErrors.password = 'Your password must be at least 8 characters.';
    }
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    if (!agreeTerms) {
      nextErrors.terms =
        'Please agree to the Terms & Conditions and Privacy Policy.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const result = await registerWithEmail({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() ? normalizePhoneNumber(phone) : undefined,
      });
      if (result?.requireOtp) {
        navigation.navigate('OtpVerify', {
          email: email.trim(),
          mode: 'email',
        });
      } else {
        handleSuccess(result?.user);
      }
    } catch (err) {
      Alert.alert(
        'Registration failed',
        err instanceof Error ? err.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title="Sign Up to Medzoos"
      subtitle="Create a new patient care account."
      badge="PATIENT APP">
      <AuthInput
        label="Full Name"
        icon="account-outline"
        value={name}
        onChangeText={setName}
        placeholder="Enter your full name..."
        autoComplete="name"
        textContentType="name"
        error={errors.name}
      />

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
        label="Mobile Number (optional)"
        icon="phone-outline"
        value={phone}
        onChangeText={setPhone}
        placeholder="03XX XXXXXXX"
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        error={errors.phone}
      />

      <AuthInput
        label="Password"
        icon="lock-outline"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••••••"
        isPassword
        autoComplete="password-new"
        textContentType="newPassword"
        error={errors.password}
      />
      {strength ? (
        <View style={styles.strengthRow}>
          <Icon name="shield-check" size={14} color={strength.color} />
          <Text style={[styles.strengthText, { color: strength.color }]}>
            {strength.label}
          </Text>
        </View>
      ) : null}

      <AuthInput
        label="Confirm Password"
        icon="lock-check-outline"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Enter your password..."
        isPassword
        autoComplete="password-new"
        textContentType="newPassword"
        error={errors.confirmPassword}
      />

      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => setAgreeTerms(v => !v)}
        activeOpacity={0.8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: agreeTerms }}>
        <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
          {agreeTerms ? (
            <Icon name="check" size={12} color={authUi.white} />
          ) : null}
        </View>
        <Text style={styles.termsText}>
          By creating an account, you agree to the Medzoos{' '}
          <Text
            style={styles.inlineLink}
            onPress={() => Linking.openURL('https://medzoos.com/terms')}>
            Terms & Conditions
          </Text>{' '}
          and{' '}
          <Text
            style={styles.inlineLink}
            onPress={() => Linking.openURL('https://medzoos.com/privacy')}>
            Privacy Policy
          </Text>
          .
        </Text>
      </TouchableOpacity>
      {errors.terms ? <Text style={styles.error}>{errors.terms}</Text> : null}

      <AuthPrimaryButton
        label="Create Account"
        loading={loading}
        loadingLabel="Creating Account..."
        onPress={handleSubmit}
      />

      <View style={styles.switchWrap}>
        <AuthLink onPress={() => navigation.navigate('SignIn')}>
          I already have an account
        </AuthLink>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -2,
    marginBottom: 4,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '700',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
    marginBottom: 4,
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
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: authUi.medicalBlue,
    borderColor: authUi.accent,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: authUi.muted,
    lineHeight: 18,
  },
  inlineLink: {
    color: authUi.accent,
    fontWeight: '700',
  },
  error: {
    fontSize: 12,
    fontWeight: '600',
    color: authUi.errorText,
    marginBottom: 4,
  },
  switchWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
});

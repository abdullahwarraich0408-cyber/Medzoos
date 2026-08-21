import React, { useState } from 'react';
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
import { colors, spacing } from '../../../theme';
import { AuthInput } from '../components/AuthInput';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { AuthLink, AuthPrimaryButton } from '../components/AuthButtons';
import { PasswordRequirements } from '../components/PasswordRequirements';
import { normalizePhoneNumber } from '../../../lib/auth/phoneUtils';
import { continueAfterAuth } from '../../../lib/auth/needsProfileCompletion';

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

  const handleSuccess = (sessionUser?: { name?: string | null; email?: string | null } | null) => {
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
        nextErrors.phone = 'Enter a valid Pakistan mobile number, such as 03XX XXXXXXX.';
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
      nextErrors.terms = 'Please agree to the Terms & Conditions and Privacy Policy.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const sessionUser = await registerWithEmail({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() ? normalizePhoneNumber(phone) : undefined,
      });
      handleSuccess(sessionUser);
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
      title="Create your account"
      subtitle="Join Medzoos for medicines, doctors and lab tests in one place."
      kicker="New patient"
      compact>
      <AuthInput
        label="Full name"
        icon="account-outline"
        value={name}
        onChangeText={setName}
        placeholder="Enter your full name"
        autoComplete="name"
        textContentType="name"
        error={errors.name}
      />

      <AuthInput
        label="Mobile number (optional)"
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
        label="Email address"
        icon="email-outline"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        error={errors.email}
      />

      <AuthInput
        label="Create password"
        icon="lock-outline"
        value={password}
        onChangeText={setPassword}
        placeholder="Create a strong password"
        isPassword
        autoComplete="password-new"
        textContentType="newPassword"
        error={errors.password}
      />
      <PasswordRequirements password={password} />

      <AuthInput
        label="Confirm password"
        icon="lock-outline"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Enter your password again"
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
          {agreeTerms ? <Icon name="check" size={14} color={colors.white} /> : null}
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
        loadingLabel="Creating account..."
        onPress={handleSubmit}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <AuthLink onPress={() => navigation.navigate('SignIn')}>Sign in</AuthLink>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    backgroundColor: colors.brandMist,
  },
  checkboxChecked: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral600,
    lineHeight: 18,
  },
  inlineLink: {
    color: colors.brandPrimary,
    fontWeight: '600',
  },
  error: {
    fontSize: 13,
    color: '#D92D20',
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: 15,
    color: colors.neutral600,
  },
});

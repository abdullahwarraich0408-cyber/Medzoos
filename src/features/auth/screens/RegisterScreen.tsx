import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../../lib/auth/AuthContext';
import type { AccountStackParamList } from '../../../navigation/types';
import { colors, spacing, radius } from '../../../theme';
import { AuthInput } from '../components/AuthInput';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { AuthLink, AuthPrimaryButton } from '../components/AuthButtons';

export function RegisterScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList>>();
  const { registerWithEmail } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSuccess = () => {
    navigation.navigate('YouHome');
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }

    if (!agreeTerms) {
      Alert.alert('Terms required', 'Please accept the terms and conditions.');
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      Alert.alert('Account created!', 'Welcome to Medzoos.', [
        { text: 'OK', onPress: handleSuccess },
      ]);
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
      title="Register"
      subtitle="Fill in your details to get started.">
      <AuthInput
        label="Full Name"
        icon="account-outline"
        value={name}
        onChangeText={setName}
        placeholder="John Doe"
        autoComplete="name"
      />

      <AuthInput
        label="Phone Number"
        icon="phone-outline"
        value={phone}
        onChangeText={setPhone}
        placeholder="03XX XXXXXXX"
        keyboardType="phone-pad"
        autoComplete="tel"
      />

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
        placeholder="Create a password"
        secureTextEntry
        autoComplete="new-password"
      />

      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => setAgreeTerms(v => !v)}
        activeOpacity={0.8}>
        <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
          {agreeTerms && (
            <Icon name="check" size={14} color={colors.white} />
          )}
        </View>
        <Text style={styles.termsText}>
          I agree to the Terms and Privacy Policy
        </Text>
      </TouchableOpacity>

      <AuthPrimaryButton
        label="Create Account"
        loading={loading}
        onPress={handleSubmit}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <AuthLink onPress={() => navigation.navigate('SignIn')}>
          Sign in
        </AuthLink>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.neutral300,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
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
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: colors.neutral600,
  },
});

import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../../lib/auth/AuthContext';
import type { AccountStackParamList } from '../../../navigation/types';

import { AuthInput } from '../components/AuthInput';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { AuthPrimaryButton } from '../components/AuthButtons';
import { normalizePhoneNumber } from '../../../lib/auth/phoneUtils';
import {
  DEV_TEST_OTP,
  DEV_TEST_PHONE,
  formatFirebaseAuthError,
  isTestAuthEnabled,
} from '../../../lib/auth/firebaseErrors';

const showTestAuth = isTestAuthEnabled();

export function PhoneSignInScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList>>();
  const { startPhoneLogin } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    const normalized = phone.trim();
    if (!normalized || normalized.length < 10) {
      Alert.alert('Invalid phone', 'Enter a valid phone number with country code.');
      return;
    }

    const formatted = normalizePhoneNumber(normalized);
    if (!formatted.startsWith('+') || formatted.length < 11) {
      Alert.alert(
        'Invalid phone',
        'Enter a valid number (e.g. 03361400373 or +923361400373).',
      );
      return;
    }

    setLoading(true);
    try {
      const confirmation = await startPhoneLogin(formatted);
      navigation.navigate('OtpVerify', { phone: formatted, confirmation });
    } catch (err) {
      Alert.alert('Unable to send OTP', formatFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const fillTestNumber = () => {
    setPhone(DEV_TEST_PHONE);
  };

  return (
    <AuthScreenLayout
      title="Sign in with Phone"
      subtitle="Primary sign-in method. No password required.">
      {showTestAuth ? (
        <View style={styles.testBox}>
          <Text style={styles.testTitle}>Local phone sign-in (no SMS)</Text>
          <Text style={styles.testBody}>
            Enter any valid Pakistan number, then use OTP {DEV_TEST_OTP}.
            {'\n'}
            Suggested: {DEV_TEST_PHONE}
          </Text>
          <Pressable onPress={fillTestNumber}>
            <Text style={styles.testLink}>Fill test number</Text>
          </Pressable>
        </View>
      ) : null}

      <AuthInput
        label="Phone Number"
        icon="phone-outline"
        value={phone}
        onChangeText={setPhone}
        placeholder="0336 1400373 or +92 336 1400373"
        keyboardType="phone-pad"
        autoComplete="tel"
      />

      <AuthPrimaryButton
        label="Send OTP"
        loading={loading}
        onPress={handleContinue}
      />

      <TouchableOpacity
        style={styles.altBtn}
        onPress={() => navigation.navigate('SignIn')}
        activeOpacity={0.7}>
        <Icon name="email-outline" size={18} color={colors.brandPrimary} />
        <Text style={styles.altText}>Sign in with email instead</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Browse as guest — login only when booking or checkout.
        </Text>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  testBox: {
    backgroundColor: colors.neutral100,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  testTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink900,
  },
  testBody: {
    fontSize: 12,
    color: colors.neutral600,
    lineHeight: 18,
  },
  testLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brandPrimary,
    marginTop: spacing.xs,
  },
  altBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  altText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  footer: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  footerText: {
    fontSize: 13,
    color: colors.neutral500,
    textAlign: 'center',
    lineHeight: 20,
  },
});
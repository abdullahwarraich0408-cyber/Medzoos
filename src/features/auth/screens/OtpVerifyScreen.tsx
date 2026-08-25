import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useAuth } from '../../../lib/auth/AuthContext';
import type { AccountStackParamList } from '../../../navigation/types';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { AuthPrimaryButton } from '../components/AuthButtons';
import { OtpInput } from '../components/OtpInput';
import { formatFirebaseAuthError } from '../../../lib/auth/firebaseErrors';
import { continueAfterAuth } from '../../../lib/auth/needsProfileCompletion';
import { authUi } from '../authUi';

const RESEND_SECONDS = 60;

function maskPhone(phone: string) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 4) return 'your registered number';
  const last4 = digits.slice(-4);
  if (digits.startsWith('92')) return `+92 3XX XXX ${last4}`;
  return `*** *** ${last4}`;
}

function otpMessage(err: unknown) {
  const message = formatFirebaseAuthError(err);
  if (/invalid otp|incorrect|wrong code/i.test(message)) {
    return 'The OTP is incorrect. Please try again.';
  }
  if (/expired/i.test(message)) {
    return 'This OTP has expired. Request a new code.';
  }
  return message;
}

export function OtpVerifyScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList>>();
  const route = useRoute<RouteProp<AccountStackParamList, 'OtpVerify'>>();
  const { completePhoneLogin, startPhoneLogin, consumePendingAction } =
    useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [confirmation, setConfirmation] = useState(route.params.confirmation);

  const { phone } = route.params;

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = setTimeout(() => setSeconds(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const finish = (
    sessionUser: { name?: string | null; email?: string | null } | null,
  ) => {
    consumePendingAction();
    continueAfterAuth(navigation, sessionUser);
  };

  const handleVerify = async () => {
    if (code.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const sessionUser = await completePhoneLogin(confirmation, code.trim());
      finish(sessionUser);
    } catch (err) {
      setError(otpMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (seconds > 0 || sending) return;
    setSending(true);
    setError('');
    try {
      const next = await startPhoneLogin(phone);
      setConfirmation(next);
      setCode('');
      setSeconds(RESEND_SECONDS);
    } catch (err) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthScreenLayout
      title="Enter verification code"
      subtitle={`We sent a 6-digit code to ${maskPhone(phone)}.`}
      badge="VERIFY PHONE">
      <OtpInput value={code} onChange={setCode} error={error} />

      <AuthPrimaryButton
        label="Verify"
        loading={loading}
        loadingLabel="Verifying..."
        disabled={code.trim().length < 6}
        onPress={handleVerify}
      />

      <View style={styles.footer}>
        {seconds > 0 ? (
          <Text style={styles.hint}>Resend code in {seconds}s</Text>
        ) : (
          <TouchableOpacity
            onPress={handleResend}
            disabled={sending}
            accessibilityRole="button"
            accessibilityLabel="Resend OTP">
            <Text style={styles.link}>
              {sending ? 'Sending a new code...' : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Change phone number">
          <Text style={styles.linkMuted}>Change phone number</Text>
        </TouchableOpacity>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 10,
  },
  hint: {
    fontSize: 14,
    color: authUi.muted,
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
    color: authUi.accent,
  },
  linkMuted: {
    fontSize: 14,
    fontWeight: '600',
    color: authUi.muted,
  },
});

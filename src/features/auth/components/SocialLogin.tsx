import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../../lib/auth/AuthContext';
import { formatFirebaseAuthError } from '../../../lib/auth/firebaseErrors';
import { authLayout } from '../authLayout';
import { authUi } from '../authUi';

type SocialLoginProps = {
  onSuccess: (
    user?: { name?: string | null; email?: string | null } | null,
  ) => void;
};

export function SocialLogin({ onSuccess }: SocialLoginProps) {
  const { loginWithGoogle, loginWithApple } = useAuth();
  const [loading, setLoading] = useState<'google' | 'apple' | ''>('');
  const [error, setError] = useState('');
  const { s, isCompact } = authLayout;
  const btnH = s(isCompact ? 44 : 46);

  const run = async (
    provider: 'google' | 'apple',
    action: () => Promise<{ name?: string | null; email?: string | null } | null>,
  ) => {
    setError('');
    setLoading(provider);
    try {
      const user = await action();
      onSuccess(user);
    } catch (err) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setLoading('');
    }
  };

  return (
    <View style={styles.wrap}>
      {error ? <Text style={[styles.error, { fontSize: s(12) }]}>{error}</Text> : null}
      <View style={[styles.row, { gap: s(10) }]}>
        <TouchableOpacity
          style={[styles.btn, { height: btnH, borderRadius: 12 }]}
          onPress={() => run('google', loginWithGoogle)}
          disabled={Boolean(loading)}
          accessibilityRole="button"
          accessibilityLabel="Sign in with Google">
          <Icon name="google" size={s(16)} color="#EA4335" />
          <Text style={[styles.btnText, { fontSize: s(13) }]}>
            {loading === 'google' ? 'Connecting...' : 'Google'}
          </Text>
        </TouchableOpacity>
        {Platform.OS === 'ios' ? (
          <TouchableOpacity
            style={[styles.btn, { height: btnH, borderRadius: 12 }]}
            onPress={() => run('apple', loginWithApple)}
            disabled={Boolean(loading)}
            accessibilityRole="button"
            accessibilityLabel="Continue with Apple">
            <Icon name="apple" size={s(16)} color={authUi.ink} />
            <Text style={[styles.btnText, { fontSize: s(13) }]}>
              {loading === 'apple' ? 'Connecting...' : 'Apple'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
  },
  btn: {
    flex: 1,
    borderWidth: 1,
    borderColor: authUi.inputBorder,
    backgroundColor: authUi.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    fontWeight: '600',
    color: authUi.ink,
  },
  error: {
    fontWeight: '600',
    color: authUi.errorText,
    lineHeight: 18,
  },
});

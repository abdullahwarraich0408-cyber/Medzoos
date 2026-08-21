import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../../lib/auth/AuthContext';
import { formatFirebaseAuthError } from '../../../lib/auth/firebaseErrors';
import { colors } from '../../../theme';

type SocialLoginProps = {
  onSuccess: (user?: { name?: string | null; email?: string | null } | null) => void;
};

export function SocialLogin({ onSuccess }: SocialLoginProps) {
  const { loginWithGoogle, loginWithApple } = useAuth();
  const [loading, setLoading] = useState<'google' | 'apple' | ''>('');
  const [error, setError] = useState('');

  const run = async (provider: 'google' | 'apple', action: () => Promise<{ name?: string | null; email?: string | null } | null>) => {
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
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={styles.btn}
        onPress={() => run('google', loginWithGoogle)}
        disabled={Boolean(loading)}
        accessibilityRole="button"
        accessibilityLabel="Continue with Google">
        <Icon name="google" size={18} color={colors.inkHeadline} />
        <Text style={styles.btnText}>
          {loading === 'google' ? 'Connecting...' : 'Sign in with Google'}
        </Text>
      </TouchableOpacity>
      {Platform.OS === 'ios' ? (
        <TouchableOpacity
          style={[styles.btn, styles.apple]}
          onPress={() => run('apple', loginWithApple)}
          disabled={Boolean(loading)}
          accessibilityRole="button"
          accessibilityLabel="Continue with Apple">
          <Icon name="apple" size={18} color={colors.white} />
          <Text style={[styles.btnText, styles.appleText]}>
            {loading === 'apple' ? 'Connecting...' : 'Continue with Apple'}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  btn: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  apple: {
    backgroundColor: '#082B3F',
    borderColor: '#082B3F',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  appleText: {
    color: colors.white,
  },
  error: {
    fontSize: 13,
    color: '#D92D20',
    lineHeight: 18,
  },
});

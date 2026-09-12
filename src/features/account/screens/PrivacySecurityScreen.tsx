import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  View,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { KeyboardAwareScrollView } from '../../../components/keyboard';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import { useChangePassword } from '../../../lib/hooks/useApi';
import { privacyBrand } from '../accountScreenBrands';
import type { YouStackParamList } from '../../../navigation/types';
import { spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';

const LIMITS = {
  passwordMin: 8,
  passwordMax: 64,
} as const;

const SECURITY_TIPS = [
  {
    icon: 'lock-check-outline',
    title: 'Strong password',
    body: 'Use at least 8 characters and avoid reusing passwords.',
  },
  {
    icon: 'cellphone-lock',
    title: 'Device access',
    body: 'Keep your phone locked so health data stays private.',
  },
  {
    icon: 'shield-account-outline',
    title: 'Account email',
    body: 'Only Medzoos support will ask you to verify by email.',
  },
] as const;

function FieldLabel({
  title,
  hint,
  count,
  max,
  error,
}: {
  title: string;
  hint?: string;
  count?: number;
  max?: number;
  error?: string | null;
}) {
  return (
    <View style={styles.fieldHead}>
      <View style={styles.fieldHeadRow}>
        <Text style={styles.label}>{title}</Text>
        {typeof count === 'number' && typeof max === 'number' ? (
          <Text style={[styles.counter, count > max && styles.counterError]}>
            {count}/{max}
          </Text>
        ) : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function PrivacySecurityContent() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<YouStackParamList>>();
  const changePassword = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const passwordIntent =
    currentPassword.length > 0 ||
    newPassword.length > 0 ||
    confirmPassword.length > 0;

  const currentPasswordError = useMemo(() => {
    if (!passwordIntent || !touched.currentPassword) return null;
    if (!currentPassword) return 'Enter your current password.';
    if (currentPassword.length > LIMITS.passwordMax) {
      return `Max ${LIMITS.passwordMax} characters.`;
    }
    return null;
  }, [passwordIntent, touched.currentPassword, currentPassword]);

  const newPasswordError = useMemo(() => {
    if (!passwordIntent || !touched.newPassword) return null;
    if (!newPassword) return 'Enter a new password.';
    if (newPassword.length < LIMITS.passwordMin) {
      return `At least ${LIMITS.passwordMin} characters.`;
    }
    if (newPassword.length > LIMITS.passwordMax) {
      return `Max ${LIMITS.passwordMax} characters.`;
    }
    if (currentPassword && newPassword === currentPassword) {
      return 'New password must differ from current.';
    }
    return null;
  }, [passwordIntent, touched.newPassword, newPassword, currentPassword]);

  const confirmPasswordError = useMemo(() => {
    if (!passwordIntent || !touched.confirmPassword) return null;
    if (!confirmPassword) return 'Confirm your new password.';
    if (confirmPassword !== newPassword) return 'Passwords do not match.';
    return null;
  }, [passwordIntent, touched.confirmPassword, confirmPassword, newPassword]);

  const passwordValid =
    passwordIntent &&
    !currentPasswordError &&
    !newPasswordError &&
    !confirmPasswordError &&
    currentPassword.length > 0 &&
    newPassword.length >= LIMITS.passwordMin &&
    confirmPassword === newPassword;

  const savePassword = async () => {
    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });
    if (!passwordValid) {
      Alert.alert(
        'Check passwords',
        currentPasswordError ||
          newPasswordError ||
          confirmPasswordError ||
          'Complete all password fields.',
      );
      return;
    }
    try {
      await changePassword.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTouched({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
      Alert.alert('Updated', 'Password changed successfully.');
    } catch {
      Alert.alert(
        'Error',
        'Could not update password. Check your current password.',
      );
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: Math.max(
            insets.bottom,
            TAB_BAR_CLEARANCE + spacing.lg,
          ),
        },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Icon name="shield-lock-outline" size={24} color={privacyBrand.onAccent} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.pageTitle}>Privacy & security</Text>
          <Text style={styles.subtitle}>
            Protect your account and health information.
          </Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusCard}>
          <Icon name="check-decagram" size={18} color={privacyBrand.success} />
          <Text style={styles.statusLabel}>Encrypted</Text>
        </View>
        <View style={styles.statusCard}>
          <Icon name="account-key-outline" size={18} color={privacyBrand.accent} />
          <Text style={styles.statusLabel}>Password login</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Change password</Text>

        <View style={styles.field}>
          <FieldLabel
            title="Current password"
            count={currentPassword.length}
            max={LIMITS.passwordMax}
            error={currentPasswordError}
          />
          <TextInput
            style={[styles.input, currentPasswordError && styles.inputError]}
            value={currentPassword}
            onChangeText={t => setCurrentPassword(t.slice(0, LIMITS.passwordMax))}
            onBlur={() => setTouched(t => ({ ...t, currentPassword: true }))}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={privacyBrand.muted}
            maxLength={LIMITS.passwordMax}
          />
        </View>

        <View style={styles.field}>
          <FieldLabel
            title="New password"
            hint={`At least ${LIMITS.passwordMin} characters`}
            count={newPassword.length}
            max={LIMITS.passwordMax}
            error={newPasswordError}
          />
          <TextInput
            style={[styles.input, newPasswordError && styles.inputError]}
            value={newPassword}
            onChangeText={t => setNewPassword(t.slice(0, LIMITS.passwordMax))}
            onBlur={() => setTouched(t => ({ ...t, newPassword: true }))}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={privacyBrand.muted}
            maxLength={LIMITS.passwordMax}
          />
        </View>

        <View style={styles.field}>
          <FieldLabel
            title="Confirm new password"
            count={confirmPassword.length}
            max={LIMITS.passwordMax}
            error={confirmPasswordError}
          />
          <TextInput
            style={[styles.input, confirmPasswordError && styles.inputError]}
            value={confirmPassword}
            onChangeText={t =>
              setConfirmPassword(t.slice(0, LIMITS.passwordMax))
            }
            onBlur={() => setTouched(t => ({ ...t, confirmPassword: true }))}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={privacyBrand.muted}
            maxLength={LIMITS.passwordMax}
          />
        </View>

        <Pressable
          style={[
            styles.primaryBtn,
            (!passwordValid || changePassword.isPending) && styles.btnDisabled,
          ]}
          onPress={savePassword}
          disabled={changePassword.isPending || !passwordIntent}>
          {changePassword.isPending ? (
            <ActivityIndicator color={privacyBrand.onAccent} />
          ) : (
            <Text style={styles.primaryBtnText}>Update password</Text>
          )}
        </Pressable>
      </View>

      <Text style={styles.sectionTitleOutside}>Stay safe</Text>
      <View style={styles.tips}>
        {SECURITY_TIPS.map(tip => (
          <View key={tip.title} style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Icon name={tip.icon} size={18} color={privacyBrand.accent} />
            </View>
            <View style={styles.tipBody}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipText}>{tip.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable
        style={styles.linkCard}
        onPress={() => navigation.navigate('Settings')}>
        <Icon name="account-edit-outline" size={20} color={privacyBrand.accent} />
        <View style={styles.linkBody}>
          <Text style={styles.linkTitle}>Edit profile details</Text>
          <Text style={styles.linkSub}>Name, phone, DOB, blood group</Text>
        </View>
        <Icon name="chevron-right" size={20} color={privacyBrand.mist} />
      </Pressable>
    </KeyboardAwareScrollView>
  );
}

export function PrivacySecurityScreen() {
  return (
    <ScreenLayout
      headerMode="stack"
      title="Privacy & Security"
      showSearch={false}
      backgroundColor={privacyBrand.page}>
      <RequireAuthGate
        title="Sign in for privacy settings"
        subtitle="Manage password and account protection after signing in."
        icon="shield-lock-outline">
        <PrivacySecurityContent />
      </RequireAuthGate>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: privacyBrand.accentDeep,
    borderRadius: radius.xxl,
    padding: spacing.md,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1, minWidth: 0, gap: 4 },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: privacyBrand.onAccent,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.8)',
  },
  statusRow: { flexDirection: 'row', gap: spacing.sm },
  statusCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: privacyBrand.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: privacyBrand.border,
    padding: spacing.md,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: privacyBrand.ink,
  },
  card: {
    backgroundColor: privacyBrand.card,
    borderRadius: 22,
    padding: spacing.lg,
    gap: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: privacyBrand.ink,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: privacyBrand.ink,
  },
  sectionTitleOutside: {
    fontSize: 15,
    fontWeight: '700',
    color: privacyBrand.ink,
  },
  field: { gap: spacing.sm },
  fieldHead: { gap: 2 },
  fieldHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: privacyBrand.ink,
  },
  hint: {
    fontSize: 12,
    fontWeight: '500',
    color: privacyBrand.muted,
  },
  error: {
    fontSize: 12,
    fontWeight: '600',
    color: privacyBrand.danger,
  },
  counter: {
    fontSize: 12,
    fontWeight: '600',
    color: privacyBrand.muted,
  },
  counterError: { color: privacyBrand.danger },
  input: {
    backgroundColor: privacyBrand.page,
    borderWidth: 1.5,
    borderColor: privacyBrand.border,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    height: 50,
    fontSize: 15,
    color: privacyBrand.ink,
  },
  inputError: {
    borderColor: privacyBrand.danger,
  },
  primaryBtn: {
    backgroundColor: privacyBrand.accent,
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: privacyBrand.onAccent,
  },
  btnDisabled: { opacity: 0.45 },
  tips: { gap: spacing.sm },
  tipCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: privacyBrand.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: privacyBrand.border,
    padding: spacing.md,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: privacyBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipBody: { flex: 1, gap: 2 },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: privacyBrand.ink,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 17,
    color: privacyBrand.muted,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: privacyBrand.soft,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  linkBody: { flex: 1, gap: 2 },
  linkTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: privacyBrand.ink,
  },
  linkSub: {
    fontSize: 12,
    color: privacyBrand.muted,
  },
});

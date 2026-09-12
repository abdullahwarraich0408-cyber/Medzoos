import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { KeyboardAwareScrollView } from '../../../components/keyboard';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import {
  useUserProfile,
  useProfileData,
  useUpdateProfile,
  useUpdateProfileData,
} from '../../../lib/hooks/useApi';
import { BLOOD_GROUPS } from '../../../lib/profile/profileData';
import { spacing, TAB_BAR_CLEARANCE } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';
import { youBrand } from '../youBrand';

const LIMITS = {
  nameMin: 2,
  nameMax: 80,
  phoneMin: 10,
  phoneMax: 20,
  dobLen: 10,
} as const;

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

function isValidDob(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const [y, m, d] = value.split('-').map(Number);
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() + 1 !== m ||
    date.getUTCDate() !== d
  ) {
    return false;
  }
  const now = new Date();
  if (date > now) return false;
  const age =
    (now.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return age >= 1 && age <= 120;
}

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, '');
}

function SettingsContent() {
  const insets = useSafeAreaInsets();
  const { data: user, isLoading } = useUserProfile();
  const { data: profileData } = useProfileData();
  const updateProfile = useUpdateProfile();
  const updateProfileData = useUpdateProfileData();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    dob: false,
  });
  const formHydrated = useRef(false);

  const serverName = user?.name || '';
  const serverPhone = user?.phone || '';
  const serverDob = profileData.dob || '';
  const serverBloodGroup = profileData.bloodGroup || '';

  useEffect(() => {
    if (isLoading || !user) return;
    if (formHydrated.current) return;
    setName(serverName);
    setPhone(serverPhone);
    setDob(serverDob);
    setBloodGroup(serverBloodGroup);
    formHydrated.current = true;
  }, [isLoading, user, serverName, serverPhone, serverDob, serverBloodGroup]);

  const nameError = useMemo(() => {
    if (!touched.name) return null;
    const trimmed = name.trim();
    if (!trimmed) return 'Full name is required.';
    if (trimmed.length < LIMITS.nameMin) {
      return `Name must be at least ${LIMITS.nameMin} characters.`;
    }
    if (trimmed.length > LIMITS.nameMax) {
      return `Keep name under ${LIMITS.nameMax} characters.`;
    }
    return null;
  }, [touched.name, name]);

  const phoneError = useMemo(() => {
    if (!touched.phone) return null;
    const normalized = normalizePhone(phone);
    if (!normalized) return 'Phone number is required.';
    if (normalized.length < LIMITS.phoneMin) {
      return `Enter at least ${LIMITS.phoneMin} digits.`;
    }
    if (normalized.length > LIMITS.phoneMax) {
      return `Phone must be under ${LIMITS.phoneMax} characters.`;
    }
    if (!/^\+?\d{10,19}$/.test(normalized)) {
      return 'Use a valid phone (e.g. +92 300 1234567).';
    }
    return null;
  }, [touched.phone, phone]);

  const dobError = useMemo(() => {
    if (!touched.dob) return null;
    if (!dob.trim()) return null;
    if (dob.length !== LIMITS.dobLen || !isValidDob(dob)) {
      return 'Use a valid date as YYYY-MM-DD.';
    }
    return null;
  }, [touched.dob, dob]);

  const profileValid = !nameError && !phoneError && !dobError && name.trim().length >= LIMITS.nameMin;

  const saveProfile = async () => {
    setTouched(t => ({ ...t, name: true, phone: true, dob: true }));
    if (!profileValid) {
      Alert.alert('Check your details', nameError || phoneError || dobError || 'Fix the highlighted fields.');
      return;
    }
    try {
      await updateProfile.mutateAsync({ name: name.trim(), phone: phone.trim() });
      await updateProfileData.mutateAsync({
        ...profileData,
        dob: dob.trim(),
        bloodGroup,
      });
      formHydrated.current = false;
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        color={youBrand.accent}
        style={styles.loader}
      />
    );
  }

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
      <View style={styles.heroTip}>
        <View style={styles.heroIcon}>
          <Icon name="account-edit-outline" size={18} color={youBrand.accent} />
        </View>
        <Text style={styles.heroTipText}>
          Keep your name, phone, and health basics up to date.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Personal details</Text>

        <View style={styles.field}>
          <FieldLabel
            title="Full name"
            hint={`Required · ${LIMITS.nameMin}–${LIMITS.nameMax} characters`}
            count={name.length}
            max={LIMITS.nameMax}
            error={nameError}
          />
          <TextInput
            style={[styles.input, nameError && styles.inputError]}
            value={name}
            onChangeText={t => setName(t.slice(0, LIMITS.nameMax))}
            onBlur={() => setTouched(t => ({ ...t, name: true }))}
            placeholder="Your name"
            placeholderTextColor={youBrand.muted}
            maxLength={LIMITS.nameMax}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.field}>
          <FieldLabel title="Email" hint="Managed by your account login" />
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={user?.email || ''}
            editable={false}
          />
        </View>

        <View style={styles.field}>
          <FieldLabel
            title="Phone"
            hint={`Required · ${LIMITS.phoneMin}–${LIMITS.phoneMax} characters`}
            count={phone.length}
            max={LIMITS.phoneMax}
            error={phoneError}
          />
          <TextInput
            style={[styles.input, phoneError && styles.inputError]}
            value={phone}
            onChangeText={t =>
              setPhone(normalizePhone(t).slice(0, LIMITS.phoneMax))
            }
            onBlur={() => setTouched(t => ({ ...t, phone: true }))}
            placeholder="+923001234567"
            keyboardType="phone-pad"
            placeholderTextColor={youBrand.muted}
            maxLength={LIMITS.phoneMax}
          />
        </View>

        <View style={styles.field}>
          <FieldLabel
            title="Date of birth"
            hint="Optional · format YYYY-MM-DD"
            count={dob.length}
            max={LIMITS.dobLen}
            error={dobError}
          />
          <TextInput
            style={[styles.input, dobError && styles.inputError]}
            value={dob}
            onChangeText={t =>
              setDob(t.replace(/[^\d-]/g, '').slice(0, LIMITS.dobLen))
            }
            onBlur={() => setTouched(t => ({ ...t, dob: true }))}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={youBrand.muted}
            keyboardType="numbers-and-punctuation"
            maxLength={LIMITS.dobLen}
          />
        </View>

        <View style={styles.field}>
          <FieldLabel title="Blood group" hint="Optional · tap to select" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {BLOOD_GROUPS.map(bg => (
                <Pressable
                  key={bg}
                  style={[styles.chip, bloodGroup === bg && styles.chipActive]}
                  onPress={() =>
                    setBloodGroup(prev => (prev === bg ? '' : bg))
                  }>
                  <Text
                    style={[
                      styles.chipText,
                      bloodGroup === bg && styles.chipTextActive,
                    ]}>
                    {bg}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <Pressable
          style={[
            styles.primaryBtn,
            (!profileValid || updateProfile.isPending) && styles.btnDisabled,
          ]}
          onPress={saveProfile}
          disabled={updateProfile.isPending}>
          {updateProfile.isPending ? (
            <ActivityIndicator color={youBrand.onAccent} />
          ) : (
            <Text style={styles.primaryBtnText}>Save profile</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}

export function SettingsScreen() {
  return (
    <ScreenLayout
      headerMode="stack"
      title="Edit Profile"
      showSearch={false}
      backgroundColor={youBrand.page}>
      <RequireAuthGate
        title="Sign in to edit profile"
        subtitle="Update your personal details after signing in."
        icon="account-edit-outline">
        <SettingsContent />
      </RequireAuthGate>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: {
    paddingHorizontal: calmLayout.screenPadding,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  heroTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: youBrand.soft,
    borderRadius: 18,
    padding: spacing.md,
  },
  heroIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: youBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    color: youBrand.ink,
  },
  card: {
    backgroundColor: youBrand.card,
    borderRadius: 22,
    padding: spacing.lg,
    gap: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: youBrand.ink,
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
    color: youBrand.ink,
    letterSpacing: -0.2,
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
    color: youBrand.ink,
  },
  hint: {
    fontSize: 12,
    fontWeight: '500',
    color: youBrand.muted,
  },
  error: {
    fontSize: 12,
    fontWeight: '600',
    color: youBrand.danger,
  },
  counter: {
    fontSize: 12,
    fontWeight: '600',
    color: youBrand.muted,
  },
  counterError: { color: youBrand.danger },
  input: {
    backgroundColor: youBrand.page,
    borderWidth: 1.5,
    borderColor: youBrand.border,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    height: 50,
    fontSize: 15,
    color: youBrand.ink,
  },
  inputError: {
    borderColor: youBrand.danger,
  },
  inputDisabled: {
    backgroundColor: youBrand.glaze,
    color: youBrand.muted,
  },
  chipRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: youBrand.border,
    backgroundColor: youBrand.page,
  },
  chipActive: {
    backgroundColor: youBrand.accent,
    borderColor: youBrand.accent,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: youBrand.muted,
  },
  chipTextActive: { color: youBrand.onAccent },
  primaryBtn: {
    backgroundColor: youBrand.accent,
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: youBrand.onAccent,
  },
  btnDisabled: { opacity: 0.45 },
  loader: { marginVertical: spacing.xxxl },
});

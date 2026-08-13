import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import {
  useUserProfile,
  useProfileData,
  useUpdateProfile,
  useUpdateProfileData,
  useChangePassword,
} from '../../../lib/hooks/useApi';
import { BLOOD_GROUPS } from '../../../lib/profile/profileData';


function SettingsContent() {
  const insets = useSafeAreaInsets();
  const { data: user, isLoading } = useUserProfile();
  const { data: profileData } = useProfileData();
  const updateProfile = useUpdateProfile();
  const updateProfileData = useUpdateProfileData();
  const changePassword = useChangePassword();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const saveProfile = async () => {
    try {
      await updateProfile.mutateAsync({ name: name.trim(), phone: phone.trim() });
      await updateProfileData.mutateAsync({
        ...profileData,
        dob,
        bloodGroup,
      });
      formHydrated.current = false;
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    }
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Required', 'Enter current and new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
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
      Alert.alert('Updated', 'Password changed successfully.');
    } catch {
      Alert.alert('Error', 'Could not update password. Check your current password.');
    }
  };

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.brandPrimary}
        style={styles.loader}
      />
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.subtitle}>
        Update your account details and security settings.
      </Text>

      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.neutral500}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={user?.email || ''}
          editable={false}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+92 300 1234567"
          keyboardType="phone-pad"
          placeholderTextColor={colors.neutral500}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Date of Birth</Text>
        <TextInput
          style={styles.input}
          value={dob}
          onChangeText={setDob}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.neutral500}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Blood Group</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {BLOOD_GROUPS.map(bg => (
              <TouchableOpacity
                key={bg}
                style={[styles.chip, bloodGroup === bg && styles.chipActive]}
                onPress={() => setBloodGroup(bg)}
                activeOpacity={0.85}>
                <Text
                  style={[
                    styles.chipText,
                    bloodGroup === bg && styles.chipTextActive,
                  ]}>
                  {bg}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={saveProfile}
        disabled={updateProfile.isPending}
        activeOpacity={0.85}>
        {updateProfile.isPending ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.primaryBtnText}>Save Changes</Text>
        )}
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, styles.sectionGap]}>Security</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={colors.neutral500}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={colors.neutral500}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={colors.neutral500}
        />
      </View>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={savePassword}
        disabled={changePassword.isPending}
        activeOpacity={0.85}>
        {changePassword.isPending ? (
          <ActivityIndicator color={colors.brandPrimary} />
        ) : (
          <Text style={styles.secondaryBtnText}>Update Password</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

export function SettingsScreen() {
  return (
    <ScreenLayout headerMode="stack" title="Settings" showSearch={false}>
      <RequireAuthGate
        title="Sign in for settings"
        subtitle="Update account and security settings after signing in."
        icon="cog-outline">
        <SettingsContent />
      </RequireAuthGate>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg },
  subtitle: {
    fontSize: 14,
    color: colors.neutral500,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: spacing.md,
  },
  sectionGap: { marginTop: spacing.xl },
  field: { marginBottom: spacing.md },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral600,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    fontSize: 15,
    color: colors.inkHeadline,
  },
  inputDisabled: {
    backgroundColor: colors.neutral100,
    color: colors.neutral500,
  },
  chipRow: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral600,
  },
  chipTextActive: { color: colors.white },
  primaryBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  loader: { marginVertical: spacing.xxxl },
});
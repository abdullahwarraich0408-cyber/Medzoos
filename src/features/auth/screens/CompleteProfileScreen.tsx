import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../lib/auth/AuthContext';
import { colors, spacing } from '../../../theme';
import { AuthInput } from '../components/AuthInput';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { AuthPrimaryButton } from '../components/AuthButtons';

const GENDERS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export function CompleteProfileScreen() {
  const { updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        ...(dateOfBirth ? { dateOfBirth } : {}),
        ...(gender ? { gender } : {}),
      });
    } catch {
      Alert.alert('Could not save', 'We could not save your details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title="A few details to get started"
      subtitle="This helps us personalise your Medzoos care. You can update it later."
      kicker="Complete profile"
      compact
      showBack={false}>
      <AuthInput
        label="Full name"
        icon="account-outline"
        value={name}
        onChangeText={text => {
          setName(text);
          setError('');
        }}
        placeholder="Enter your full name"
        autoComplete="name"
        textContentType="name"
        error={error}
      />
      <AuthInput
        label="Date of birth"
        icon="calendar-outline"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
      />
      <Text style={styles.label}>Gender</Text>
      <View style={styles.genderGrid}>
        {GENDERS.map(item => (
          <TouchableOpacity
            key={item.value}
            onPress={() => setGender(item.value)}
            style={[styles.gender, gender === item.value && styles.genderActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: gender === item.value }}>
            <Text style={[styles.genderText, gender === item.value && styles.genderTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <AuthPrimaryButton
        label="Continue"
        loading={loading}
        loadingLabel="Saving..."
        showArrow={false}
        onPress={handleSubmit}
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.inkHeadline,
    marginBottom: 8,
  },
  genderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.lg,
  },
  gender: {
    minHeight: 48,
    minWidth: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: colors.brandMist,
  },
  genderActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandMist,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.inkHeadline,
  },
  genderTextActive: {
    color: colors.brandPrimary,
  },
});

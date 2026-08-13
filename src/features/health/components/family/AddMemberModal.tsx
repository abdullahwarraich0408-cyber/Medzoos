import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { AppSheet } from '../../../../components/modal/AppSheet';
import {
  RELATIONSHIPS,
  BLOOD_GROUPS,
  GENDERS,
} from '../../data/familyVaultModel';
import { colors, spacing, radius } from '../../../../theme';
import { healthOs, healthOsTypography } from '../../../../theme/healthOs';

export type AddMemberForm = {
  full_name: string;
  relationship: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  phone: string;
  emergency_contact: string;
};

export const EMPTY_ADD_MEMBER_FORM: AddMemberForm = {
  full_name: '',
  relationship: 'Father',
  date_of_birth: '',
  gender: '',
  blood_group: 'B+',
  phone: '',
  emergency_contact: '',
};

type AddMemberModalProps = {
  visible: boolean;
  form: AddMemberForm;
  onChange: (form: AddMemberForm) => void;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral300}
      />
    </View>
  );
}

export function AddMemberModal({
  visible,
  form,
  onChange,
  onClose,
  onSave,
  saving,
}: AddMemberModalProps) {
  return (
    <AppSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>Add family member</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
            <FormField
              label="Full name"
              value={form.full_name}
              onChangeText={v => onChange({ ...form, full_name: v })}
              placeholder="Enter full name"
            />
            <Text style={styles.fieldLabel}>Relationship</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {RELATIONSHIPS.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, form.relationship === r && styles.chipActive]}
                  onPress={() => onChange({ ...form, relationship: r })}>
                  <Text
                    style={[
                      styles.chipText,
                      form.relationship === r && styles.chipTextActive,
                    ]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <FormField
              label="Date of birth"
              value={form.date_of_birth}
              onChangeText={v => onChange({ ...form, date_of_birth: v })}
              placeholder="e.g. 1985-03-15"
            />
            <Text style={styles.fieldLabel}>Gender</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {GENDERS.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.chip, form.gender === g && styles.chipActive]}
                  onPress={() => onChange({ ...form, gender: g })}>
                  <Text
                    style={[
                      styles.chipText,
                      form.gender === g && styles.chipTextActive,
                    ]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.fieldLabel}>Blood group</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {BLOOD_GROUPS.map(bg => (
                <TouchableOpacity
                  key={bg}
                  style={[styles.chip, form.blood_group === bg && styles.chipActive]}
                  onPress={() => onChange({ ...form, blood_group: bg })}>
                  <Text
                    style={[
                      styles.chipText,
                      form.blood_group === bg && styles.chipTextActive,
                    ]}>
                    {bg}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <FormField
              label="Phone number (optional)"
              value={form.phone}
              onChangeText={v => onChange({ ...form, phone: v })}
              placeholder="03xx xxxxxxx"
            />
            <FormField
              label="Emergency contact (optional)"
              value={form.emergency_contact}
              onChangeText={v => onChange({ ...form, emergency_contact: v })}
              placeholder="Name and phone"
            />
          </ScrollView>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={onSave}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveText}>Save member</Text>
              )}
            </TouchableOpacity>
          </View>
    </AppSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    ...healthOsTypography.greeting,
    fontSize: 20,
    marginBottom: spacing.lg,
  },
  fieldWrap: { marginBottom: spacing.md },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral600,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.ink900,
  },
  chipRow: { marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  chipText: { fontSize: 13, color: colors.neutral600 },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
  },
  cancelText: { fontWeight: '600', color: colors.neutral600 },
  saveBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.brandPrimary,
  },
  saveText: { fontWeight: '700', color: colors.white },
});

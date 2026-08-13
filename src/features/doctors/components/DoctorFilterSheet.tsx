import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius } from '../../../theme';
import {
  FILTER_OPTIONS,
  type DoctorFilters,
  type ConsultType,
} from '../data/mockDoctors';

type DoctorFilterSheetProps = {
  visible: boolean;
  filters: DoctorFilters;
  category: ConsultType;
  onChange: (filters: DoctorFilters) => void;
  onClear: () => void;
  onClose: () => void;
};

function CheckboxRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity style={styles.checkRow} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Icon name="check" size={14} color={colors.white} />}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export function DoctorFilterSheet({
  visible,
  filters,
  category,
  onChange,
  onClear,
  onClose,
}: DoctorFilterSheetProps) {
  const toggle = (key: keyof DoctorFilters, value: string) => {
    const current = (filters[key] as string[]) ?? [];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  const toggleBool = (key: 'online' | 'availableToday') => {
    onChange({ ...filters, [key]: !filters[key] });
  };

  const activeCount =
    filters.specialties.length +
    filters.languages.length +
    filters.experience.length +
    (filters.online ? 1 : 0) +
    (filters.availableToday ? 1 : 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            {activeCount > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
                <Icon name="close" size={14} color={colors.brandPrimary} />
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.groupTitle}>Specialty</Text>
            {FILTER_OPTIONS.specialties.map(s => (
              <CheckboxRow
                key={s}
                label={s}
                checked={filters.specialties.includes(s)}
                onToggle={() => toggle('specialties', s)}
              />
            ))}

            <Text style={styles.groupTitle}>Availability</Text>
            {category !== 'online' && (
              <CheckboxRow
                label="Online now"
                checked={filters.online}
                onToggle={() => toggleBool('online')}
              />
            )}
            <CheckboxRow
              label="Available today"
              checked={filters.availableToday}
              onToggle={() => toggleBool('availableToday')}
            />

            <Text style={styles.groupTitle}>Experience</Text>
            {FILTER_OPTIONS.experience.map(exp => (
              <CheckboxRow
                key={exp}
                label={exp}
                checked={filters.experience.includes(exp)}
                onToggle={() => toggle('experience', exp)}
              />
            ))}

            <Text style={styles.groupTitle}>Language</Text>
            {FILTER_OPTIONS.languages.map(lang => (
              <CheckboxRow
                key={lang}
                label={lang}
                checked={filters.languages.includes(lang)}
                onToggle={() => toggle('languages', lang)}
              />
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.applyBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.applyText}>Show results</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(12,26,46,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral300,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkHeadline,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.neutral300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  checkLabel: {
    fontSize: 14,
    color: colors.neutral600,
  },
  applyBtn: {
    marginTop: spacing.lg,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});

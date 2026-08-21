import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { DoctorFolder } from '../../lib/medicalRecordModel';
import { formatDoctorFolderCounts } from '../../lib/medicalRecordModel';
import { colors, spacing, radius } from '../../../../theme';

type DoctorFolderCardProps = {
  folder: DoctorFolder;
  onPress: () => void;
};

export function DoctorFolderCard({ folder, onPress }: DoctorFolderCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.iconWrap}>
        <Icon name="stethoscope" size={18} color={colors.primary700} />
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {folder.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {[folder.specialty, formatDoctorFolderCounts(folder)]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
      <Icon name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pressed: { backgroundColor: colors.primary100 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2, minWidth: 0 },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

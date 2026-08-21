import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PatientPrescription } from '../data/medicineModel';
import { getPrescriptionSourceLabel } from '../data/medicineModel';
import { colors, spacing, radius } from '../../../theme';

type PrescriptionHubCardProps = {
  prescription: PatientPrescription;
  onPress: () => void;
};

export function PrescriptionHubCard({
  prescription,
  onPress,
}: PrescriptionHubCardProps) {
  const sourceLabel = getPrescriptionSourceLabel(prescription);
  const uploaded = prescription.uploadedByUser;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.iconWrap}>
        <Icon name="file-document-outline" size={18} color={colors.primary700} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {prescription.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {[prescription.doctorName, prescription.date].filter(Boolean).join(' · ')}
        </Text>
      </View>
      <View style={[styles.badge, uploaded && styles.badgePending]}>
        <Text style={[styles.badgeText, uploaded && styles.badgeTextPending]}>
          {sourceLabel}
        </Text>
      </View>
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
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  badge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    maxWidth: 140,
  },
  badgePending: {
    backgroundColor: colors.warningBg,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.successText,
  },
  badgeTextPending: {
    color: '#9A6B12',
  },
});

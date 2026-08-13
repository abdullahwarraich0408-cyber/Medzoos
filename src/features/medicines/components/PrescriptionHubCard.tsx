import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PatientPrescription } from '../data/medicineModel';
import { getVerificationLabel } from '../data/medicineModel';
import { colors, spacing, cardStyles, appIcons, appIconTile } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

type PrescriptionHubCardProps = {
  prescription: PatientPrescription;
  onPress: () => void;
};

export function PrescriptionHubCard({ prescription, onPress }: PrescriptionHubCardProps) {
  const statusLabel = getVerificationLabel(prescription.verificationStatus);
  const meta =
    prescription.verificationStatus === 'verified' && prescription.medicineCount > 0
      ? `${statusLabel} · ${prescription.medicineCount} medicine${prescription.medicineCount === 1 ? '' : 's'}`
      : statusLabel;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.iconWrap}>
        <Icon name="file-document-outline" size={appIcons.size.md} color={appIcons.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{prescription.title}</Text>
        {prescription.doctorName ? (
          <Text style={styles.doctor}>{prescription.doctorName}</Text>
        ) : null}
        <Text style={styles.date}>{prescription.date}</Text>
        <Text
          style={[
            styles.meta,
            prescription.verificationStatus === 'pending' && styles.metaPending,
          ]}>
          {meta}
        </Text>
      </View>
      <View style={cardStyles.chevronWrap}>
        <Icon name="chevron-right" size={18} color={colors.neutral500} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pressed: { backgroundColor: colors.brandMist },
  iconWrap: appIconTile('md'),
  body: { flex: 1, gap: 2 },
  title: {
    ...healthOsTypography.messageTitle,
    fontSize: 15,
  },
  doctor: {
    fontSize: 13,
    color: colors.neutral500,
  },
  date: {
    fontSize: 12,
    color: colors.neutral500,
  },
  meta: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brandPrimary,
    marginTop: 2,
  },
  metaPending: {
    color: colors.statusWarningText,
  },
});

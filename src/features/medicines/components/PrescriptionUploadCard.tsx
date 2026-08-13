import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, cardStyles } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

type PrescriptionUploadCardProps = {
  onUpload: () => void;
};

export function PrescriptionUploadCard({ onUpload }: PrescriptionUploadCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.title}>Have a prescription?</Text>
        <Text style={styles.subtitle}>Upload and get medicines verified.</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        onPress={onUpload}>
        <Icon name="cloud-upload-outline" size={16} color={colors.white} />
        <Text style={styles.btnText}>Upload prescription</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyles.premiumSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  copy: { flex: 1, gap: 2 },
  title: {
    ...healthOsTypography.messageTitle,
    fontSize: 14,
  },
  subtitle: {
    fontSize: 12,
    color: colors.neutral500,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  btnPressed: { opacity: 0.9 },
  btnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
});

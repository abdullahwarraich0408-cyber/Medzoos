import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius } from '../../../theme';

type PrescriptionUploadCardProps = {
  onUpload: () => void;
};

export function PrescriptionUploadCard({ onUpload }: PrescriptionUploadCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onUpload}>
      <View style={styles.iconWrap}>
        <Icon name="file-plus-outline" size={22} color={colors.primary700} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Upload prescription</Text>
        <Text style={styles.subtitle}>Save to My Health as uploaded by you</Text>
      </View>
      <View style={styles.arrow}>
        <Icon name="arrow-right" size={16} color={colors.primary700} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary100,
    borderRadius: radius.xxl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(23, 97, 142, 0.12)',
  },
  pressed: { opacity: 0.92 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 2, minWidth: 0 },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary900,
  },
  subtitle: {
    fontSize: 12,
    color: colors.primary600,
    lineHeight: 16,
  },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

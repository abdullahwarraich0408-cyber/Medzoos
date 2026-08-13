import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { UnifiedMedicalRecord } from '../../lib/medicalRecords';
import { colors, spacing, cardStyles, appIcons, appIconTile } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type MedicalRecordRowProps = {
  record: UnifiedMedicalRecord;
  onPress: () => void;
};

export function MedicalRecordRow({ record, onPress }: MedicalRecordRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.iconWrap}>
        <Icon name={record.icon} size={appIcons.size.md} color={appIcons.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {record.title}
        </Text>
        <Text style={styles.detail} numberOfLines={1}>
          {record.detail}
        </Text>
        <Text style={styles.date}>{record.date}</Text>
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
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...healthOsTypography.messageTitle,
    fontSize: 15,
  },
  detail: {
    fontSize: 13,
    color: colors.neutral500,
  },
  date: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 2,
  },
});

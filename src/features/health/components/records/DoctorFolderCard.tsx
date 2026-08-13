import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { DoctorFolder } from '../../lib/medicalRecordModel';
import { formatDoctorFolderCounts } from '../../lib/medicalRecordModel';
import { colors, spacing, cardStyles, appIcons, appIconTile } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type DoctorFolderCardProps = {
  folder: DoctorFolder;
  onPress: () => void;
};

export function DoctorFolderCard({ folder, onPress }: DoctorFolderCardProps) {
  const counts = formatDoctorFolderCounts(folder);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.iconWrap}>
        <Icon name="account-circle-outline" size={appIcons.size.lg} color={appIcons.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{folder.name}</Text>
        <Text style={styles.specialty}>{folder.specialty}</Text>
        <Text style={styles.meta}>Last visit {folder.lastVisitDate}</Text>
        <Text style={styles.counts}>{counts}</Text>
      </View>
      <View style={cardStyles.chevronWrap}>
        <Icon name="chevron-right" size={18} color={colors.neutral500} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pressed: { backgroundColor: colors.brandMist },
  iconWrap: appIconTile('md'),
  body: { flex: 1, gap: 2 },
  name: {
    ...healthOsTypography.messageTitle,
    fontSize: 15,
  },
  specialty: {
    fontSize: 13,
    color: colors.neutral500,
  },
  meta: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 2,
  },
  counts: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brandPrimary,
    marginTop: 2,
  },
});

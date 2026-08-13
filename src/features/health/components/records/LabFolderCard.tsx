import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { LabFolder } from '../../lib/medicalRecordModel';
import { formatLabFolderCounts } from '../../lib/medicalRecordModel';
import { colors, spacing, cardStyles, appIcons, appIconTile } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type LabFolderCardProps = {
  folder: LabFolder;
  onPress: () => void;
};

export function LabFolderCard({ folder, onPress }: LabFolderCardProps) {
  const counts = formatLabFolderCounts(folder);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.iconWrap}>
        <Icon name="flask-outline" size={appIcons.size.lg} color={appIcons.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{folder.name}</Text>
        <Text style={styles.meta}>Last test {folder.lastTestDate}</Text>
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

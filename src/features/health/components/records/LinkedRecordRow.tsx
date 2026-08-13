import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { MedicalRecordItem } from '../../lib/medicalRecordModel';
import { colors, spacing, radius, cardStyles, appIcons, appIconTile } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type LinkedRecordRowProps = {
  record: MedicalRecordItem;
  onPress: () => void;
  showStatus?: boolean;
  showNewBadge?: boolean;
};

export function LinkedRecordRow({
  record,
  onPress,
  showStatus = false,
  showNewBadge = false,
}: LinkedRecordRowProps) {
  const showBadge = showNewBadge && record.isUnread;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.iconWrap}>
        <Icon name={record.icon} size={appIcons.size.md} color={appIcons.color} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {record.title}
          </Text>
          {showBadge ? (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {record.description}
        </Text>
        <View style={styles.footer}>
          {showStatus && record.status ? (
            <Text style={styles.status}>{record.status}</Text>
          ) : null}
          <Text style={styles.date}>{record.date}</Text>
        </View>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...healthOsTypography.messageTitle,
    fontSize: 15,
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: colors.neutral500,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  date: {
    fontSize: 12,
    color: colors.neutral500,
  },
  newBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.brandLight,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.15)',
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brandPrimary,
  },
});

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { MedicalRecordItem } from '../../lib/medicalRecordModel';
import { colors, spacing, radius } from '../../../../theme';

type LinkedRecordRowProps = {
  record: MedicalRecordItem;
  onPress: () => void;
  showStatus?: boolean;
  showNewBadge?: boolean;
};

export function LinkedRecordRow({
  record,
  onPress,
  showNewBadge = false,
}: LinkedRecordRowProps) {
  const showBadge = showNewBadge && record.isUnread;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.iconWrap}>
        <Icon name={record.icon} size={18} color={colors.primary700} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {record.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {[
            record.uploadedByUser ? 'Uploaded by patient' : record.description,
            record.date,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
      {showBadge ? (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>New</Text>
        </View>
      ) : (
        <Icon name="chevron-right" size={18} color={colors.textMuted} />
      )}
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
  newBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primary100,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary800,
  },
});

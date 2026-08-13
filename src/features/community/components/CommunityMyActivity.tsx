import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows } from '../../../theme';

type ActivityRow = {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
};

type CommunityMyActivityProps = {
  rows: ActivityRow[];
  onViewRewards?: () => void;
};

export function CommunityMyActivity({
  rows,
  onViewRewards,
}: CommunityMyActivityProps) {
  return (
    <View style={styles.wrap}>
      {rows.map(row => (
        <Pressable
          key={row.title}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={row.onPress}>
          <View style={styles.iconWrap}>
            <Icon name={row.icon} size={18} color={colors.iconPrimary} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>{row.title}</Text>
            <Text style={styles.subtitle}>{row.subtitle}</Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.textMuted} />
        </Pressable>
      ))}
      {onViewRewards ? (
        <Pressable style={styles.link} onPress={onViewRewards}>
          <Text style={styles.linkText}>Open challenges to claim rewards</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.cardSoft,
  },
  rowPressed: { opacity: 0.96 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  link: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary700,
  },
});

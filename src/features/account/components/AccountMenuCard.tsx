import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, cardStyles, appIcons, appIconTile } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

type AccountMenuCardProps = {
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  onPress: () => void;
};

export function AccountMenuCard({
  title,
  subtitle,
  icon,
  iconColor,
  iconBg,
  onPress,
}: AccountMenuCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={24} color={appIcons.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={20} color={colors.neutral500} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...cardStyles.premiumSoft,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  pressed: { opacity: 0.92 },
  iconWrap: appIconTile('md'),
  body: { flex: 1, gap: 2 },
  title: {
    ...healthOsTypography.messageTitle,
    fontSize: 16,
  },
  subtitle: {
    ...healthOsTypography.messageCaption,
    fontSize: 12,
  },
});

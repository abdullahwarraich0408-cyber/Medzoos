import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, radius, spacing, shadows, appIcons, appIconTile } from '../theme';
import { healthOsTypography } from '../theme/healthOs';

type SimpleRowProps = {
  icon: string;
  iconColor?: string;
  title: string;
  message: string;
  onPress?: () => void;
  showChevron?: boolean;
};

/** One action or status — title + clear subtitle */
export function SimpleRow({
  icon,
  iconColor = appIcons.color,
  title,
  message,
  onPress,
  showChevron = true,
}: SimpleRowProps) {
  const content = (
    <>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={22} color={appIcons.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      {showChevron && onPress ? (
        <Icon name="chevron-right" size={22} color={colors.neutral500} />
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        onPress={onPress}
        accessibilityRole="button">
        {content}
      </Pressable>
    );
  }

  return <View style={styles.row}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 0,
    padding: spacing.lg,
    ...shadows.cardSoft,
  },
  pressed: { opacity: 0.92 },
  iconWrap: appIconTile('md'),
  body: { flex: 1, gap: 2 },
  title: healthOsTypography.messageTitle,
  message: healthOsTypography.messageCaption,
});

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, cardStyles, appIcons, appIconTile } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

export type AttentionItem = {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  message: string;
  onPress: () => void;
};

type HomeAttentionListProps = {
  items: AttentionItem[];
};

export function HomeAttentionList({ items }: HomeAttentionListProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.card}>
      {items.map((item, index) => (
        <React.Fragment key={item.title}>
          {index > 0 ? <View style={cardStyles.rowDivider} /> : null}
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={item.onPress}>
            <View style={styles.iconWrap}>
              <Icon name={item.icon} size={appIcons.size.md} color={appIcons.color} />
            </View>
            <View style={styles.body}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
            </View>
            <View style={cardStyles.chevronWrap}>
              <Icon name="chevron-right" size={18} color={colors.neutral500} />
            </View>
          </Pressable>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyles.grouped,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowPressed: { backgroundColor: colors.brandMist },
  iconWrap: appIconTile('md'),
  body: { flex: 1, gap: 2 },
  title: {
    ...healthOsTypography.messageTitle,
    fontSize: 14,
  },
  message: {
    ...healthOsTypography.messageCaption,
    fontSize: 12,
  },
});

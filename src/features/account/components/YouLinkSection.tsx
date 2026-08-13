import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, cardStyles } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

type YouLinkItem = {
  id: string;
  title: string;
};

type YouLinkSectionProps = {
  title: string;
  items: YouLinkItem[];
  onPressItem: (item: YouLinkItem) => void;
};

export function YouLinkSection({ title, items, onPressItem }: YouLinkSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 ? <View style={cardStyles.rowDivider} /> : null}
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => onPressItem(item)}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <View style={cardStyles.chevronWrap}>
                <Icon name="chevron-right" size={18} color={colors.neutral500} />
              </View>
            </Pressable>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  sectionTitle: {
    ...healthOsTypography.sectionTitle,
  },
  card: {
    ...cardStyles.grouped,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowPressed: { backgroundColor: colors.brandMist },
  rowTitle: {
    ...healthOsTypography.messageTitle,
    fontSize: 15,
    flex: 1,
  },
});

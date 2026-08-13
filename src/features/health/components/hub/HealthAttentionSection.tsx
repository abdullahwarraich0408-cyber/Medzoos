import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HealthAttentionItem } from '../../data/healthHubData';
import type { HealthStackParamList } from '../../../../navigation/types';
import { colors, spacing, cardStyles, appIcons, appIconTile } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type HealthAttentionSectionProps = {
  items: HealthAttentionItem[];
  navigation: NativeStackNavigationProp<HealthStackParamList>;
};

export function HealthAttentionSection({ items, navigation }: HealthAttentionSectionProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Needs attention</Text>
      <View style={styles.card}>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 ? <View style={cardStyles.rowDivider} /> : null}
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => navigation.navigate(item.screen)}>
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

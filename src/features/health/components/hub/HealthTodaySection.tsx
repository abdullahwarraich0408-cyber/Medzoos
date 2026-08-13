import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HealthTodayItem } from '../../data/healthHubData';
import type { HealthStackParamList } from '../../../../navigation/types';
import { colors, spacing, cardStyles } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type HealthTodaySectionProps = {
  items: HealthTodayItem[];
  navigation: NativeStackNavigationProp<HealthStackParamList>;
};

export function HealthTodaySection({ items, navigation }: HealthTodaySectionProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Today</Text>
      <View style={styles.card}>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 ? <View style={cardStyles.rowDivider} /> : null}
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => navigation.navigate(item.screen)}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.actionBtn}>
                <Text style={styles.actionText}>{item.actionLabel}</Text>
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
  title: {
    ...healthOsTypography.messageTitle,
    fontSize: 15,
    flex: 1,
  },
  actionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 999,
    backgroundColor: colors.brandLight,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.15)',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brandPrimary,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { FamilyActivityView } from '../../data/familyVaultModel';
import { colors, spacing, radius, cardStyles } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type FamilyActivitySectionProps = {
  items: FamilyActivityView[];
};

export function FamilyActivitySection({ items }: FamilyActivitySectionProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Family activity</Text>
      <View style={styles.card}>
        {items.map(item => (
          <View key={item.id} style={styles.row}>
            <View style={styles.iconWrap}>
              <Icon name={item.icon} size={16} color={colors.brandPrimary} />
            </View>
            <Text style={styles.message}>{item.message}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  title: {
    ...healthOsTypography.sectionTitle,
    fontSize: 15,
  },
  card: {
    ...cardStyles.premiumSoft,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral600,
    lineHeight: 18,
  },
});

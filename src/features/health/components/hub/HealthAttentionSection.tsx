import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HealthAttentionItem } from '../../data/healthHubData';
import type { HealthStackParamList } from '../../../../navigation/types';
import { colors, spacing, radius } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type HealthAttentionSectionProps = {
  items: HealthAttentionItem[];
  navigation: NativeStackNavigationProp<HealthStackParamList>;
};

export function HealthAttentionSection({
  items,
  navigation,
}: HealthAttentionSectionProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Needs attention</Text>
      <View style={styles.list}>
        {items.map(item => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => navigation.navigate(item.screen)}>
            <View style={styles.iconWrap}>
              <Icon name={item.icon} size={18} color={colors.primary700} />
            </View>
            <View style={styles.body}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message} numberOfLines={1}>
                {item.message}
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  sectionTitle: {
    ...healthOsTypography.sectionTitle,
  },
  list: { gap: spacing.sm },
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
  rowPressed: { backgroundColor: colors.primary100 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  message: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

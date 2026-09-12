import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HealthAttentionItem } from '../../data/healthHubData';
import type { HealthStackParamList } from '../../../../navigation/types';
import { spacing } from '../../../../theme';
import { calmLayout } from '../../../../theme/calmLayout';
import { healthBrand } from '../../healthBrand';

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
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Needs attention</Text>
      </View>
      <View style={styles.list}>
        {items.map(item => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => navigation.navigate(item.screen)}>
            <View style={styles.accentBar} />
            <View style={styles.iconWrap}>
              <Icon name={item.icon} size={18} color={healthBrand.alert} />
            </View>
            <View style={styles.body}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message} numberOfLines={1}>
                {item.message}
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color={healthBrand.alert} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: calmLayout.screenPadding,
    gap: spacing.md,
  },
  header: { gap: 4 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: healthBrand.ink,
    letterSpacing: -0.3,
  },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: healthBrand.alertSoft,
    borderRadius: 18,
    paddingVertical: spacing.md,
    paddingRight: spacing.lg,
    paddingLeft: 0,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: healthBrand.alert,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: { elevation: 1 },
    }),
  },
  rowPressed: { opacity: 0.92 },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: healthBrand.alert,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: healthBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  body: { flex: 1, gap: 2, minWidth: 0 },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: healthBrand.ink,
  },
  message: {
    fontSize: 12,
    fontWeight: '500',
    color: healthBrand.muted,
  },
});

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HEALTH_QUICK_ACTIONS } from '../../data/healthHubData';
import type { HealthStackParamList } from '../../../../navigation/types';
import { colors, spacing, radius } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type HealthQuickActionGridProps = {
  navigation: NativeStackNavigationProp<HealthStackParamList>;
  badges: {
    reports: string;
    prescriptions: string;
    family: string;
  };
};

export function HealthQuickActionGrid({
  navigation,
}: HealthQuickActionGridProps) {
  const rows = [
    HEALTH_QUICK_ACTIONS.slice(0, 2),
    HEALTH_QUICK_ACTIONS.slice(2, 4),
    HEALTH_QUICK_ACTIONS.slice(4, 6),
  ].filter(row => row.length > 0);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>My Health</Text>
      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map(action => (
              <Pressable
                key={action.id}
                style={({ pressed }) => [
                  styles.tile,
                  pressed && styles.pressed,
                ]}
                onPress={() => navigation.navigate(action.screen)}>
                <View style={styles.iconWrap}>
                  <Icon
                    name={action.icon}
                    size={22}
                    color={colors.primary700}
                  />
                </View>
                <Text style={styles.title}>{action.title}</Text>
              </Pressable>
            ))}
          </View>
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
  grid: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  pressed: { backgroundColor: colors.primary100 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});

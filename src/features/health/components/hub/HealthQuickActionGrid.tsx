import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HEALTH_QUICK_ACTIONS } from '../../data/healthHubData';
import type { HealthStackParamList } from '../../../../navigation/types';
import { colors, spacing, radius, shadows, iconTileStyle, arrowChipStyle, appIcons } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type HealthQuickActionGridProps = {
  navigation: NativeStackNavigationProp<HealthStackParamList>;
  badges: {
    reports: string;
    prescriptions: string;
    family: string;
  };
};

export function HealthQuickActionGrid({ navigation, badges }: HealthQuickActionGridProps) {
  const rows = [HEALTH_QUICK_ACTIONS.slice(0, 2), HEALTH_QUICK_ACTIONS.slice(2, 4)];

  const getBadge = (action: (typeof HEALTH_QUICK_ACTIONS)[number]) => {
    if (action.badgeKey === 'reports') return badges.reports;
    if (action.badgeKey === 'prescriptions') return badges.prescriptions;
    if (action.badgeKey === 'family') return badges.family;
    return action.badgeFallback ?? '';
  };

  return (
    <View style={styles.grid}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map(action => {
            const badge = getBadge(action);
            return (
              <Pressable
                key={action.id}
                style={({ pressed }) => [
                  styles.tile,
                  { backgroundColor: action.tileBg },
                  pressed && styles.pressed,
                ]}
                onPress={() => navigation.navigate(action.screen)}>
                <View style={styles.topRow}>
                  <View style={iconTileStyle()}>
                    <Icon name={action.icon} size={appIcons.size.lg} color={appIcons.color} />
                  </View>
                  <View style={arrowChipStyle()}>
                    <Icon name="arrow-top-right" size={14} color={appIcons.color} />
                  </View>
                </View>
                <Text style={styles.title}>{action.title}</Text>
                <Text style={styles.subtitle} numberOfLines={2}>
                  {action.subtitle}
                </Text>
                {badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
    minHeight: 128,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    ...shadows.cardSoft,
  },
  pressed: { opacity: 0.94, transform: [{ scale: 0.985 }] },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    ...healthOsTypography.messageTitle,
    fontSize: 14,
  },
  subtitle: {
    fontSize: 11,
    color: colors.neutral600,
    lineHeight: 15,
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: appIcons.arrowBg,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: appIcons.color,
  },
});

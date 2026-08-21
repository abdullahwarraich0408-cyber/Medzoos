import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { HealthActivityItem } from '../../data/healthHubData';
import { colors, spacing, radius } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type HealthActivityTimelineProps = {
  items: HealthActivityItem[];
  onViewHistory?: () => void;
};

export function HealthActivityTimeline({
  items,
  onViewHistory,
}: HealthActivityTimelineProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent activity</Text>
      <View style={styles.card}>
        {items.map((item, index) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.rail}>
              <View style={styles.dot} />
              {index < items.length - 1 ? <View style={styles.line} /> : null}
            </View>
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Icon name={item.icon} size={16} color={colors.primary700} />
              </View>
              <View style={styles.body}>
                <Text style={styles.title}>{item.title}</Text>
                {item.time ? (
                  <Text style={styles.time}>{item.time}</Text>
                ) : null}
              </View>
            </View>
          </View>
        ))}
        {onViewHistory ? (
          <>
            <View style={styles.footerDivider} />
            <Pressable
              style={({ pressed }) => [
                styles.historyRow,
                pressed && styles.historyPressed,
              ]}
              onPress={onViewHistory}>
              <Text style={styles.historyText}>View full history</Text>
              <Icon name="chevron-right" size={18} color={colors.primary700} />
            </Pressable>
          </>
        ) : null}
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
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingTop: spacing.md,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  rail: {
    width: 14,
    alignItems: 'center',
    marginRight: spacing.sm,
    paddingTop: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary400,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.primary100,
    marginTop: 4,
    marginBottom: -4,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  body: { flex: 1, gap: 2, paddingTop: 6 },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: colors.textMuted,
  },
  footerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  historyPressed: { backgroundColor: colors.primary100 },
  historyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary700,
  },
});

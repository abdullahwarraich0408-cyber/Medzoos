import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { HealthActivityItem } from '../../data/healthHubData';
import { colors, spacing, cardStyles, appIcons, appIconTile } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type HealthActivityTimelineProps = {
  items: HealthActivityItem[];
  onViewHistory?: () => void;
};

export function HealthActivityTimeline({ items, onViewHistory }: HealthActivityTimelineProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent activity</Text>
      <View style={styles.card}>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Icon name={item.icon} size={appIcons.size.sm} color={appIcons.color} />
              </View>
              <Text style={styles.title}>{item.title}</Text>
            </View>
          </React.Fragment>
        ))}
        {onViewHistory ? (
          <>
            <View style={styles.divider} />
            <Pressable
              style={({ pressed }) => [styles.historyRow, pressed && styles.historyPressed]}
              onPress={onViewHistory}>
              <Text style={styles.historyText}>View history</Text>
              <Icon name="chevron-right" size={18} color={colors.brandPrimary} />
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
    ...cardStyles.grouped,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral200,
    marginLeft: spacing.lg,
  },
  iconWrap: appIconTile('sm'),
  title: {
    ...healthOsTypography.messageTitle,
    fontSize: 15,
    flex: 1,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  historyPressed: { backgroundColor: colors.brandMist },
  historyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
});

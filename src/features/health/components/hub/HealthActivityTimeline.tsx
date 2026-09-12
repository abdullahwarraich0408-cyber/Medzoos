import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { HealthActivityItem } from '../../data/healthHubData';
import { spacing, radius } from '../../../../theme';
import { calmLayout } from '../../../../theme/calmLayout';
import { healthBrand } from '../../healthBrand';

type HealthActivityTimelineProps = {
  items: HealthActivityItem[];
  onViewHistory?: () => void;
};

export function HealthActivityTimeline({
  items,
  onViewHistory,
}: HealthActivityTimelineProps) {
  const hasItems = items.length > 0;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Recent activity</Text>
      </View>

      <View style={styles.panel}>
        {hasItems ? (
          items.map((item, index) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.rail}>
                <View style={styles.dot} />
                {index < items.length - 1 ? <View style={styles.spine} /> : null}
              </View>
              <View style={styles.bubble}>
                <View style={styles.bubbleIcon}>
                  <Icon name={item.icon} size={15} color={healthBrand.accent} />
                </View>
                <View style={styles.bubbleCopy}>
                  <Text style={styles.title}>{item.title}</Text>
                  {item.time ? (
                    <Text style={styles.time}>{item.time}</Text>
                  ) : null}
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Quiet for now</Text>
            <Text style={styles.emptyHint}>
              Lab results, uploads, and visits will appear on this spine.
            </Text>
          </View>
        )}

        {onViewHistory ? (
          <Pressable
            style={({ pressed }) => [
              styles.historyBtn,
              pressed && styles.pressed,
            ]}
            onPress={onViewHistory}>
            <Text style={styles.historyText}>View full history</Text>
            <Icon name="arrow-right" size={16} color={healthBrand.onAccent} />
          </Pressable>
        ) : null}
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
  panel: {
    backgroundColor: healthBrand.card,
    borderRadius: 24,
    padding: spacing.lg,
    gap: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: healthBrand.ink,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
      },
      android: { elevation: 2 },
    }),
  },
  item: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 52,
  },
  rail: {
    width: 16,
    alignItems: 'center',
    paddingTop: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: healthBrand.accent,
    borderWidth: 2,
    borderColor: healthBrand.glaze,
  },
  spine: {
    flex: 1,
    width: 2,
    marginTop: 4,
    backgroundColor: healthBrand.glaze,
    borderRadius: 1,
  },
  bubble: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: healthBrand.soft,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  bubbleIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: healthBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleCopy: { flex: 1, gap: 2, minWidth: 0 },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: healthBrand.ink,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    fontWeight: '500',
    color: healthBrand.muted,
  },
  empty: { gap: 6, paddingVertical: 4 },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: healthBrand.ink,
  },
  emptyHint: {
    fontSize: 13,
    lineHeight: 19,
    color: healthBrand.muted,
  },
  historyBtn: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: healthBrand.accent,
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  historyText: {
    fontSize: 13,
    fontWeight: '700',
    color: healthBrand.onAccent,
  },
  pressed: { opacity: 0.9 },
});

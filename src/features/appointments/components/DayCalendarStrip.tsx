import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { colors, spacing } from '../../../theme';
import { localDayKey } from '../data/localDay';

export type DayItem = {
  key: string;
  date: Date;
  dayLabel: string;
  dayNum: number;
  isToday: boolean;
};

type DayCalendarStripProps = {
  selectedKey: string;
  onSelect: (day: DayItem) => void;
  days?: number;
};

function buildDays(count: number): DayItem[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const todayKey = localDayKey(today);
  const start = new Date(today);
  start.setDate(today.getDate() - 3);

  return Array.from({ length: count }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = localDayKey(date);
    return {
      key,
      date,
      dayLabel: date
        .toLocaleDateString('en-US', { weekday: 'short' })
        .toUpperCase(),
      dayNum: date.getDate(),
      isToday: key === todayKey,
    };
  });
}

export function DayCalendarStrip({
  selectedKey,
  onSelect,
  days = 14,
}: DayCalendarStripProps) {
  const items = useMemo(() => buildDays(days), [days]);

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.strip}
        contentContainerStyle={styles.row}>
        {items.map(day => {
          const selected = day.key === selectedKey;
          return (
            <Pressable
              key={day.key}
              style={styles.item}
              onPress={() => onSelect(day)}>
              <Text
                style={[styles.dayLabel, selected && styles.dayLabelSelected]}>
                {day.dayLabel}
              </Text>
              <View
                style={[styles.numWrap, selected && styles.numWrapSelected]}>
                <Text
                  style={[styles.dayNum, selected && styles.dayNumSelected]}>
                  {day.dayNum}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function dayKeyFromDate(value?: string) {
  if (!value) return localDayKey();
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return localDayKey();
  return localDayKey(d);
}

const styles = StyleSheet.create({
  wrap: {
    flexGrow: 0,
    flexShrink: 0,
  },
  strip: {
    flexGrow: 0,
  },
  row: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 44,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  dayLabelSelected: {
    color: colors.primary700,
  },
  numWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numWrapSelected: {
    backgroundColor: colors.primary100,
  },
  dayNum: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dayNumSelected: {
    color: colors.primary700,
  },
});

import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { appointmentsBrand } from '../appointmentsBrand';
import { spacing, radius } from '../../../theme';
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
  markedKeys?: Set<string>;
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
  markedKeys,
}: DayCalendarStripProps) {
  const items = useMemo(() => buildDays(days), [days]);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your week</Text>
        <Text style={styles.headerHint}>Pick a day to see visits</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.strip}
        contentContainerStyle={styles.row}>
        {items.map(day => {
          const selected = day.key === selectedKey;
          const marked = markedKeys?.has(day.key);
          return (
            <Pressable
              key={day.key}
              style={[styles.item, selected && styles.itemSelected]}
              onPress={() => onSelect(day)}>
              <Text
                style={[
                  styles.dayLabel,
                  selected && styles.dayLabelSelected,
                  day.isToday && !selected && styles.dayLabelToday,
                ]}>
                {day.dayLabel}
              </Text>
              <View
                style={[styles.numWrap, selected && styles.numWrapSelected]}>
                <Text
                  style={[styles.dayNum, selected && styles.dayNumSelected]}>
                  {day.dayNum}
                </Text>
              </View>
              {marked ? (
                <View style={[styles.dot, selected && styles.dotSelected]} />
              ) : (
                <View style={styles.dotSpacer} />
              )}
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
    marginHorizontal: spacing.lg,
    backgroundColor: appointmentsBrand.card,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: appointmentsBrand.border,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: 2,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: appointmentsBrand.ink,
  },
  headerHint: {
    fontSize: 12,
    color: appointmentsBrand.muted,
  },
  strip: {
    flexGrow: 0,
  },
  row: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    gap: 6,
    minWidth: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: 6,
    borderRadius: radius.lg,
  },
  itemSelected: {
    backgroundColor: appointmentsBrand.soft,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: appointmentsBrand.muted,
    letterSpacing: 0.4,
  },
  dayLabelSelected: {
    color: appointmentsBrand.accent,
  },
  dayLabelToday: {
    color: appointmentsBrand.accentSoft,
  },
  numWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numWrapSelected: {
    backgroundColor: appointmentsBrand.accent,
  },
  dayNum: {
    fontSize: 15,
    fontWeight: '700',
    color: appointmentsBrand.ink,
  },
  dayNumSelected: {
    color: appointmentsBrand.onAccent,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: appointmentsBrand.accent,
  },
  dotSelected: {
    backgroundColor: appointmentsBrand.accentSoft,
  },
  dotSpacer: {
    width: 5,
    height: 5,
  },
});

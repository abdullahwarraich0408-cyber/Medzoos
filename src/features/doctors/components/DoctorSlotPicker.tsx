import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDoctorSlots } from '../../../lib/hooks/useApi';
import { spacing, shadows } from '../../../theme';
import { sortSlots, toLocalDateValue } from '../utils/bookingUtils';
import { bookingUi, useBookingLayout } from '../utils/bookingUi';

type DoctorSlotPickerProps = {
  doctorId: string;
  selectedDate: string;
  selectedSlot: string | null;
  onDateChange: (date: string) => void;
  onSlotChange: (slot: string | null) => void;
  slotParams?: Record<string, string>;
};

function buildMonthWindow(anchor: Date, count: number) {
  const start = new Date(anchor);
  start.setHours(0, 0, 0, 0);
  const items: Array<{
    value: string;
    weekday: string;
    dayNum: number;
    date: Date;
  }> = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    items.push({
      value: toLocalDateValue(d),
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      date: d,
    });
  }
  return items;
}

function formatSlotLabel(slot: string) {
  const match = String(slot).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return slot.toLowerCase();
  const hour = String(parseInt(match[1], 10)).padStart(2, '0');
  return `${hour}:${match[2]} ${match[3].toLowerCase()}`;
}

export function DoctorSlotPicker({
  doctorId,
  selectedDate,
  selectedSlot,
  onDateChange,
  onSlotChange,
  slotParams = {},
}: DoctorSlotPickerProps) {
  const layout = useBookingLayout();
  const dateCount = layout.dateCount;

  const selected = useMemo(() => {
    const d = new Date(`${selectedDate}T12:00:00`);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }, [selectedDate]);

  const [windowStart, setWindowStart] = useState(() => {
    const d = new Date(`${selectedDate}T12:00:00`);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    // Keep selected date visible when the visible window shrinks (rotation / resize)
    setWindowStart(prev => {
      const start = new Date(prev);
      const end = new Date(prev);
      end.setDate(start.getDate() + dateCount - 1);
      const selectedTime = selected.getTime();
      if (selectedTime < start.getTime() || selectedTime > end.getTime()) {
        const next = new Date(selected);
        next.setHours(0, 0, 0, 0);
        return next;
      }
      return prev;
    });
  }, [dateCount, selected]);

  const dates = useMemo(
    () => buildMonthWindow(windowStart, dateCount),
    [windowStart, dateCount],
  );

  const monthLabel = useMemo(() => {
    const mid = dates[Math.min(1, dates.length - 1)]?.date ?? selected;
    return mid.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [dates, selected]);

  const { data: availability, isLoading, isFetching } = useDoctorSlots(
    doctorId,
    selectedDate,
    slotParams,
  );

  const slots = availability?.slots || [];
  const booked = availability?.booked || [];
  const bookedSet = new Set(booked);
  const allSlots = sortSlots([...new Set([...slots, ...booked])]);
  const openCount = allSlots.filter(s => !bookedSet.has(s)).length;

  const shiftWindow = (deltaDays: number) => {
    const next = new Date(windowStart);
    next.setDate(windowStart.getDate() + deltaDays);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (next < today) {
      setWindowStart(today);
      return;
    }
    setWindowStart(next);
  };

  const isToday = toLocalDateValue(new Date()) === selectedDate;
  const cols = layout.slotCols;
  const availableWidth = Math.max(layout.innerWidth, 200);
  const slotWidth =
    (availableWidth - layout.slotGap * (cols - 1)) / cols;

  return (
    <View
      style={[
        styles.wrap,
        { gap: layout.isCompact ? 16 : layout.isTablet ? 28 : 22 },
      ]}>
      <View style={styles.monthRow}>
        <Text
          style={[styles.monthLabel, { fontSize: layout.font.month }]}
          numberOfLines={1}>
          {monthLabel}
        </Text>
        <View style={styles.monthNav}>
          <Pressable onPress={() => shiftWindow(-dateCount)} hitSlop={10}>
            <Icon name="chevron-left" size={22} color={bookingUi.ink} />
          </Pressable>
          <Pressable onPress={() => shiftWindow(dateCount)} hitSlop={10}>
            <Icon name="chevron-right" size={22} color={bookingUi.ink} />
          </Pressable>
        </View>
      </View>

      <View style={styles.dateRow}>
        {dates.map(item => {
          const active = selectedDate === item.value;
          return (
            <Pressable
              key={item.value}
              style={styles.dateItem}
              onPress={() => {
                onDateChange(item.value);
                onSlotChange(null);
              }}>
              <Text
                style={[
                  styles.weekday,
                  { fontSize: layout.font.weekday },
                  active && styles.weekdayActive,
                ]}
                numberOfLines={1}>
                {item.weekday}
              </Text>
              <View
                style={[
                  styles.dayCircle,
                  {
                    width: layout.daySize,
                    height: layout.daySize,
                    borderRadius: layout.daySize / 2,
                  },
                  active && styles.dayCircleActive,
                ]}>
                <Text
                  style={[
                    styles.dayNum,
                    { fontSize: layout.font.dayNum },
                    active && styles.dayNumActive,
                  ]}>
                  {item.dayNum}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.availHeader}>
        <Text
          style={[styles.availTitle, { fontSize: layout.font.availTitle }]}
          numberOfLines={1}>
          {isToday ? 'Today availability' : 'Availability'}
        </Text>
        <Text style={[styles.availMeta, { fontSize: layout.font.availMeta }]}>
          {isFetching
            ? '…'
            : `${Math.min(openCount, 99)} Stay${openCount === 1 ? '' : 's'}`}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={bookingUi.accent} />
        </View>
      ) : allSlots.length === 0 ? (
        <Text style={styles.emptyText}>No slots for this date.</Text>
      ) : (
        <View style={[styles.slotsGrid, { gap: layout.slotGap }]}>
          {allSlots.map(slot => {
            const isBooked = bookedSet.has(slot);
            const isSelected = selectedSlot === slot;
            return (
              <Pressable
                key={slot}
                disabled={isBooked}
                onPress={() => onSlotChange(slot)}
                style={[
                  styles.slotBtn,
                  {
                    width: slotWidth,
                    maxWidth: cols === 1 ? '100%' : undefined,
                    paddingVertical: layout.isCompact
                      ? 14
                      : layout.isTablet
                        ? 18
                        : 16,
                  },
                  isBooked && styles.slotBooked,
                  isSelected && styles.slotSelected,
                ]}>
                <Text
                  style={[
                    styles.slotText,
                    { fontSize: layout.font.slot },
                    isBooked && styles.slotTextBooked,
                    isSelected && styles.slotTextSelected,
                  ]}>
                  {formatSlotLabel(slot)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  monthLabel: {
    flex: 1,
    fontWeight: '700',
    color: bookingUi.ink,
    letterSpacing: -0.3,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dateItem: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  weekday: {
    fontWeight: '500',
    color: bookingUi.muted,
  },
  weekdayActive: {
    color: bookingUi.ink,
    fontWeight: '600',
  },
  dayCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: bookingUi.dayIdle,
    ...shadows.cardSoft,
  },
  dayCircleActive: {
    backgroundColor: bookingUi.accent,
  },
  dayNum: {
    fontWeight: '600',
    color: bookingUi.ink,
  },
  dayNumActive: {
    color: bookingUi.white,
    fontWeight: '700',
  },
  availHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  availTitle: {
    flex: 1,
    fontWeight: '700',
    color: bookingUi.ink,
  },
  availMeta: {
    fontWeight: '500',
    color: bookingUi.muted,
    flexShrink: 0,
  },
  loadingWrap: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: bookingUi.muted,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  slotBtn: {
    borderRadius: 18,
    backgroundColor: bookingUi.white,
    alignItems: 'center',
    ...shadows.cardSoft,
  },
  slotBooked: {
    opacity: 0.4,
  },
  slotSelected: {
    backgroundColor: bookingUi.accent,
  },
  slotText: {
    fontWeight: '600',
    color: bookingUi.ink,
  },
  slotTextBooked: {
    color: bookingUi.muted,
  },
  slotTextSelected: {
    color: bookingUi.white,
  },
});

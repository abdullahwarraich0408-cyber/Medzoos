import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDoctorSlots } from '../../../lib/hooks/useApi';

import {
  buildQuickDates,
  formatLongBookingDate,
  sortSlots,
} from '../utils/bookingUtils';

type DoctorSlotPickerProps = {
  doctorId: string;
  selectedDate: string;
  selectedSlot: string | null;
  onDateChange: (date: string) => void;
  onSlotChange: (slot: string | null) => void;
  slotParams?: Record<string, string>;
};

export function DoctorSlotPicker({
  doctorId,
  selectedDate,
  selectedSlot,
  onDateChange,
  onSlotChange,
  slotParams = {},
}: DoctorSlotPickerProps) {
  const quickDates = buildQuickDates(14);
  const { data: availability, isLoading, isFetching } = useDoctorSlots(
    doctorId,
    selectedDate,
    slotParams,
  );

  const slots = availability?.slots || [];
  const booked = availability?.booked || [];
  const ranges = availability?.ranges || [];
  const bookedSet = new Set(booked);
  const allSlots = sortSlots([...new Set([...slots, ...booked])]);
  const hasAnySlots = allSlots.length > 0;

  return (
    <View>
      <Text style={styles.label}>Select date</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateRow}>
        {quickDates.map(item => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.dateChip,
              selectedDate === item.value && styles.dateChipActive,
            ]}
            onPress={() => {
              onDateChange(item.value);
              onSlotChange(null);
            }}
            activeOpacity={0.85}>
            <Text
              style={[
                styles.dateDayLabel,
                selectedDate === item.value && styles.dateChipTextActive,
              ]}>
              {item.dayLabel}
            </Text>
            <Text
              style={[
                styles.dateDayNum,
                selectedDate === item.value && styles.dateChipTextActive,
              ]}>
              {item.dayNum}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.availabilityTitle}>
        Available slots for{' '}
        <Text style={styles.availabilityDate}>
          {formatLongBookingDate(selectedDate)}
        </Text>
      </Text>

      {ranges.length > 0 ? (
        <Text style={styles.hoursNote}>
          Doctor&apos;s hours this day: {ranges.join(' · ')}
        </Text>
      ) : (
        <Text style={styles.hoursNote}>
          No consultation hours set for this day. Try another date.
        </Text>
      )}

      <Text style={styles.liveNote}>
        {isFetching ? 'Updating live availability...' : 'Booked slots are locked for that date'}
      </Text>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.brandPrimary} />
          <Text style={styles.loadingText}>Loading available slots...</Text>
        </View>
      ) : !availability?.worksThisDay && slotParams.hospital_id ? (
        <Text style={styles.emptyText}>
          Doctor is not available at this hospital on{' '}
          {availability?.day || 'this day'}. Please pick another date.
        </Text>
      ) : !hasAnySlots ? (
        <Text style={styles.emptyText}>
          No slots available for this date. Try another day.
        </Text>
      ) : (
        <View style={styles.slotsGrid}>
          {allSlots.map(slot => {
            const isBooked = bookedSet.has(slot);
            const isSelected = selectedSlot === slot;

            return (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.slotBtn,
                  isBooked && styles.slotBtnBooked,
                  isSelected && styles.slotBtnSelected,
                ]}
                disabled={isBooked}
                onPress={() => onSlotChange(slot)}
                activeOpacity={0.85}>
                <Icon
                  name="clock-outline"
                  size={16}
                  color={
                    isBooked
                      ? colors.neutral500
                      : colors.brandPrimary
                  }
                />
                <Text
                  style={[
                    styles.slotText,
                    isBooked && styles.slotTextBooked,
                    isSelected && styles.slotTextSelected,
                  ]}>
                  {slot}
                </Text>
                {isBooked && <Text style={styles.bookedLabel}>BOOKED</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text style={styles.timezoneNote}>
        All times shown in Pakistan Standard Time (PKT)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.inkHeadline,
    marginBottom: spacing.sm,
  },
  dateRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  dateChip: {
    minWidth: 72,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  dateChipActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandLight,
  },
  dateDayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral600,
  },
  dateDayNum: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral600,
    marginTop: 2,
  },
  dateChipTextActive: {
    color: colors.brandPrimary,
  },
  availabilityTitle: {
    fontSize: 14,
    color: colors.neutral600,
    marginBottom: spacing.xs,
  },
  availabilityDate: {
    fontWeight: '600',
    color: colors.inkHeadline,
  },
  hoursNote: {
    fontSize: 12,
    color: colors.neutral500,
    marginBottom: spacing.xs,
  },
  liveNote: {
    fontSize: 12,
    color: colors.neutral500,
    marginBottom: spacing.lg,
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  loadingText: {
    fontSize: 13,
    color: colors.neutral500,
  },
  emptyText: {
    fontSize: 13,
    color: colors.neutral500,
    paddingVertical: spacing.md,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slotBtn: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    backgroundColor: colors.white,
  },
  slotBtnBooked: {
    backgroundColor: colors.neutral100,
    borderColor: healthOs.cardBorder,
    opacity: 0.7,
  },
  slotBtnSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandLight,
  },
  slotText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral800,
  },
  slotTextBooked: {
    color: colors.neutral500,
  },
  slotTextSelected: {
    color: colors.brandPrimary,
  },
  bookedLabel: {
    position: 'absolute',
    bottom: 4,
    fontSize: 9,
    fontWeight: '700',
    color: colors.neutral500,
    letterSpacing: 0.5,
  },
  timezoneNote: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: spacing.lg,
  },
});
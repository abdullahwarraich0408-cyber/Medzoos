import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DoctorSlotPicker } from '../../doctors/components/DoctorSlotPicker';
import { useRescheduleDoctorAppointment } from '../../../lib/hooks/useApi';
import type { DoctorAppointment } from '../../../lib/mappers/doctor';
import { toLocalDateValue } from '../../doctors/utils/bookingUtils';
import { colors, spacing, radius } from '../../../theme';

type Props = {
  appointment: DoctorAppointment | null;
  visible: boolean;
  onClose: () => void;
};

function toDateInputValue(isoOrDate?: string) {
  if (!isoOrDate) return toLocalDateValue(new Date());
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) {
    const raw = String(isoOrDate).slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : toLocalDateValue(new Date());
  }
  return toLocalDateValue(d);
}

export function RescheduleAppointmentModal({
  appointment,
  visible,
  onClose,
}: Props) {
  const reschedule = useRescheduleDoctorAppointment();
  const initialDate = useMemo(
    () =>
      toDateInputValue(
        appointment?.dateIso ||
          (appointment?.raw?.appointment_date as string | undefined),
      ),
    [appointment],
  );
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  if (!appointment) return null;

  const hospitalId =
    (appointment.raw?.hospital_id as string | undefined) ||
    ((appointment.raw?.practice_location as Record<string, unknown> | undefined)
      ?.hospital_id as string | undefined) ||
    undefined;
  const practiceLocationId =
    (appointment.raw?.practice_location_id as string | undefined) ||
    ((appointment.raw?.practice_location as Record<string, unknown> | undefined)
      ?.id as string | undefined) ||
    undefined;

  const slotParams: Record<string, string> = {};
  if (hospitalId) slotParams.hospital_id = hospitalId;
  if (practiceLocationId && practiceLocationId !== 'legacy') {
    slotParams.practice_location_id = practiceLocationId;
  }

  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot) {
      Alert.alert('Select date & time', 'Please choose a new slot.');
      return;
    }
    try {
      await reschedule.mutateAsync({
        id: appointment.id,
        appointment_date: selectedDate,
        slot: selectedSlot,
      });
      Alert.alert('Rescheduled', 'Your appointment time was updated.');
      onClose();
    } catch (error) {
      Alert.alert(
        'Could not reschedule',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Reschedule appointment</Text>
              <Text style={styles.subtitle}>
                {appointment.doctorName} · currently {appointment.date} ·{' '}
                {appointment.slot}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Icon name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {appointment.doctorId ? (
              <DoctorSlotPicker
                doctorId={appointment.doctorId}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onDateChange={date => {
                  setSelectedDate(date);
                  setSelectedSlot(null);
                }}
                onSlotChange={setSelectedSlot}
                slotParams={slotParams}
              />
            ) : (
              <Text style={styles.subtitle}>Doctor unavailable for slots.</Text>
            )}
          </ScrollView>

          <Pressable
            style={[styles.primaryBtn, reschedule.isPending && { opacity: 0.7 }]}
            disabled={reschedule.isPending}
            onPress={handleConfirm}>
            {reschedule.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryBtnText}>Confirm new time</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    maxHeight: '90%',
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  primaryBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});

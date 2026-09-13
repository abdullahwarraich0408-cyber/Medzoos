import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { DoctorAppointment } from '../../../lib/mappers/doctor';
import {
  formatPaymentLabel,
  normalizeMode,
} from '../../../lib/appointmentJourney';
import { VisitDocumentsSection } from './VisitDocumentsSection';
import { colors, spacing, radius } from '../../../theme';

type Props = {
  appointment: DoctorAppointment;
};

export function PreVisitPreparation({ appointment }: Props) {
  const status = String(appointment.status || '').toLowerCase();
  if (!['confirmed', 'checked_in'].includes(status)) return null;

  const mode = normalizeMode(appointment as unknown as Record<string, unknown>);
  const hospital =
    appointment.hospital ||
    (appointment.raw?.hospital as { name?: string } | undefined)?.name ||
    (appointment.raw?.doctor as { hospital?: string } | undefined)?.hospital ||
    null;
  const address =
    (appointment.raw?.hospital as { address?: string } | undefined)?.address ||
    null;

  const isClinic = mode === 'in_person';

  return (
    <View style={[styles.card, isClinic ? styles.clinic : styles.online]}>
      <Text style={styles.title}>
        {isClinic
          ? 'Prepare for your clinic visit'
          : 'Prepare for your consultation'}
      </Text>
      <View style={styles.list}>
        <View style={styles.row}>
          <Icon
            name="clock-outline"
            size={16}
            color={isClinic ? '#B45309' : '#0369A1'}
          />
          <Text style={styles.text}>
            {appointment.date} · {appointment.slot}
            {isClinic ? '. Arrive 10–15 minutes early.' : ''}
          </Text>
        </View>
        {isClinic && (hospital || address) ? (
          <View style={styles.row}>
            <Icon name="map-marker-outline" size={16} color="#B45309" />
            <Text style={styles.text}>
              {[hospital, address].filter(Boolean).join(' · ')}
            </Text>
          </View>
        ) : null}
        {!isClinic ? (
          <>
            <View style={styles.row}>
              <Icon name="message-outline" size={16} color="#0369A1" />
              <Text style={styles.text}>
                Chat:{' '}
                {appointment.canChat || appointment.canViewChat
                  ? 'Available for this visit'
                  : 'Opens closer to your appointment time'}
              </Text>
            </View>
            <View style={styles.row}>
              <Icon name="video-outline" size={16} color="#0369A1" />
              <Text style={styles.text}>
                Join video:{' '}
                {appointment.canJoin
                  ? 'Ready when your doctor starts'
                  : 'Available once consultation begins'}
              </Text>
            </View>
          </>
        ) : null}
        <Text style={styles.text}>
          Payment: {formatPaymentLabel(appointment as unknown as Record<string, unknown>)}
        </Text>
      </View>
      <VisitDocumentsSection appointmentId={appointment.id} compact />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  clinic: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  online: {
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  text: { flex: 1, fontSize: 13, color: colors.textPrimary, lineHeight: 18 },
});

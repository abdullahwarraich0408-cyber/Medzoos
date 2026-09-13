import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { DoctorAppointment } from '../../../lib/mappers/doctor';
import {
  formatFollowUpStatusLabel,
  formatPaymentLabel,
  normalizeMode,
} from '../../../lib/appointmentJourney';
import { shortPatientSummary } from '../../../lib/patientVisibleSummary';
import { VisitDocumentsSection } from './VisitDocumentsSection';
import { colors, spacing, radius } from '../../../theme';

type FollowUpLike = {
  id?: string;
  status?: string;
  recommended_date?: string;
  booked_appointment_id?: string;
};

type Props = {
  appointment: DoctorAppointment;
  followUp?: FollowUpLike | null;
  onViewPrescription?: () => void;
  onBookFollowUp?: () => void;
  onViewFollowUpAppointment?: (appointmentId: string) => void;
};

export function PostVisitSummary({
  appointment,
  followUp,
  onViewPrescription,
  onBookFollowUp,
  onViewFollowUpAppointment,
}: Props) {
  if (!appointment || appointment.status !== 'completed') return null;

  const mode = normalizeMode(appointment as unknown as Record<string, unknown>);
  const consultation = appointment.raw?.consultation as
    | Record<string, unknown>
    | undefined;
  const diagnosis =
    (consultation?.diagnosis as string) ||
    ((appointment.prescription as Record<string, unknown> | null)?.diagnosis as
      | string
      | undefined) ||
    null;
  const summary = shortPatientSummary(
    (consultation?.clinical_notes as string) ||
      appointment.consultationNotes ||
      (appointment.raw?.consultation_notes as string),
  );
  const hasRx = Boolean(appointment.prescription);
  const bookable =
    followUp &&
    !followUp.booked_appointment_id &&
    ['planned', 'notified', 'needs_rebooking', 'overdue'].includes(
      String(followUp.status || ''),
    );

  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>Visit summary</Text>
        <Text style={styles.meta}>
          {appointment.doctorName} · {appointment.specialty || 'Doctor'} ·{' '}
          {appointment.date} · {mode === 'in_person' ? 'In-clinic' : 'Online'}
        </Text>
        <Text style={styles.payment}>
          Payment:{' '}
          {formatPaymentLabel(appointment as unknown as Record<string, unknown>)}
        </Text>
      </View>

      <View>
        <Text style={styles.sectionLabel}>Clinical summary</Text>
        {diagnosis || summary ? (
          <View style={styles.summaryBlock}>
            {diagnosis ? (
              <Text style={styles.body}>
                <Text style={styles.bold}>Diagnosis: </Text>
                {diagnosis}
              </Text>
            ) : null}
            {summary ? <Text style={styles.body}>{summary}</Text> : null}
          </View>
        ) : (
          <Text style={styles.muted}>
            Your visit summary will appear here after the consultation is
            completed.
          </Text>
        )}
      </View>

      <View>
        <Text style={styles.sectionLabel}>Prescription</Text>
        {hasRx ? (
          <Pressable style={styles.secondaryBtn} onPress={onViewPrescription}>
            <Text style={styles.secondaryBtnText}>
              Prescription ready — View
            </Text>
          </Pressable>
        ) : (
          <Text style={styles.muted}>
            No prescription issued for this visit yet.
          </Text>
        )}
      </View>

      <VisitDocumentsSection appointmentId={appointment.id} compact />

      {followUp ? (
        <View>
          <Text style={styles.sectionLabel}>Follow-up</Text>
          <Text style={styles.body}>
            {formatFollowUpStatusLabel(followUp.status)}
            {followUp.recommended_date
              ? ` · around ${followUp.recommended_date}`
              : ''}
          </Text>
          {bookable ? (
            <Pressable style={styles.primaryBtn} onPress={onBookFollowUp}>
              <Text style={styles.primaryBtnText}>Book follow-up</Text>
            </Pressable>
          ) : followUp.booked_appointment_id ? (
            <Pressable
              style={styles.secondaryBtn}
              onPress={() =>
                onViewFollowUpAppointment?.(
                  String(followUp.booked_appointment_id),
                )
              }>
              <Text style={styles.secondaryBtnText}>
                View booked follow-up
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#99F6E4',
    backgroundColor: '#F0FDFA',
    padding: spacing.md,
    gap: spacing.md,
  },
  title: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
  payment: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  summaryBlock: { gap: 4 },
  body: { fontSize: 13, color: colors.textPrimary, lineHeight: 18 },
  bold: { fontWeight: '700' },
  muted: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  primaryBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  primaryBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  secondaryBtn: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  secondaryBtnText: {
    color: colors.brandPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
});

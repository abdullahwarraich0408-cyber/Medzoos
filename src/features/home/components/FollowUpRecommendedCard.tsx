import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePatientFollowUps } from '../../../lib/hooks/useApi';
import { formatFollowUpStatusLabel } from '../../../lib/appointmentJourney';
import { BookFollowUpModal } from '../../appointments/components/BookFollowUpModal';
import { colors, spacing, radius, shadows } from '../../../theme';

function formatDate(value?: unknown) {
  if (!value) return '';
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

type Props = {
  onOpenAppointments?: () => void;
};

export function FollowUpRecommendedCard({ onOpenAppointments }: Props) {
  const { data: followUps = [], isLoading } = usePatientFollowUps();
  const [booking, setBooking] = useState<Record<string, unknown> | null>(null);

  const active = useMemo(
    () =>
      (followUps || []).filter(
        f =>
          !f.booked_appointment_id &&
          ['planned', 'notified', 'needs_rebooking', 'overdue'].includes(
            String(f.status || ''),
          ),
      ),
    [followUps],
  );

  if (isLoading || active.length === 0) return null;

  const item =
    active.find(f => f.status === 'needs_rebooking') ||
    active.find(f => f.status === 'overdue') ||
    active[0];
  const doctor = item.doctor as { name?: string; specialty?: string } | undefined;
  const doctorName = doctor?.name
    ? `Dr. ${String(doctor.name).replace(/^Dr\.?\s*/i, '')}`
    : 'Your doctor';
  const needsRebooking = item.status === 'needs_rebooking';

  return (
    <>
      <View
        style={[
          styles.card,
          needsRebooking ? styles.cardWarn : styles.cardTeal,
        ]}>
        <View
          style={[
            styles.iconWrap,
            needsRebooking ? styles.iconWarn : styles.iconTeal,
          ]}>
          <Icon
            name="calendar-check"
            size={22}
            color={needsRebooking ? '#92400E' : '#0F766E'}
          />
        </View>
        <View style={styles.copy}>
          <Text
            style={[
              styles.eyebrow,
              needsRebooking ? styles.eyebrowWarn : styles.eyebrowTeal,
            ]}>
            {formatFollowUpStatusLabel(String(item.status))}
          </Text>
          <Text style={styles.title}>
            {needsRebooking ? 'Follow-up needs rebooking' : doctorName}
          </Text>
          <Text style={styles.subtitle}>
            {needsRebooking
              ? `${doctorName}${doctor?.specialty ? ` · ${doctor.specialty}` : ''}. Book again when ready.`
              : `${doctor?.specialty || 'Recommended by your doctor'}${
                  item.recommended_date
                    ? ` · around ${formatDate(item.recommended_date)}`
                    : ''
                }`}
          </Text>
          <View style={styles.actions}>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => setBooking(item)}>
              <Text style={styles.primaryBtnText}>Book follow-up</Text>
            </Pressable>
            {onOpenAppointments ? (
              <Pressable onPress={onOpenAppointments}>
                <Text style={styles.link}>View appointments</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      <BookFollowUpModal
        visible={Boolean(booking)}
        followUp={
          booking
            ? {
                id: String(booking.id),
                preferred_mode: booking.preferred_mode as string | undefined,
                recommended_date: booking.recommended_date as string | undefined,
                doctor: doctor,
              }
            : null
        }
        onClose={() => setBooking(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: radius.xxl,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardTeal: { borderColor: '#99F6E4', backgroundColor: '#F0FDFA' },
  cardWarn: { borderColor: '#FCD34D', backgroundColor: '#FFFBEB' },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTeal: { backgroundColor: '#CCFBF1' },
  iconWarn: { backgroundColor: '#FDE68A' },
  copy: { flex: 1, gap: 4 },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  eyebrowTeal: { color: '#0F766E' },
  eyebrowWarn: { color: '#92400E' },
  title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  primaryBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  link: { fontSize: 13, fontWeight: '700', color: colors.brandPrimary },
});

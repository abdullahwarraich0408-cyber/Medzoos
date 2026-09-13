import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import {
  useCancelDoctorAppointment,
  useDoctorAppointment,
  useJoinDoctorConsultation,
  usePatientFollowUps,
  useSelectConsultationMode,
  useSubmitDoctorReview,
} from '../../../lib/hooks/useApi';
import {
  buildPatientTimeline,
  formatAppointmentStatusLabel,
  formatPaymentLabel,
} from '../../../lib/appointmentJourney';
import { navigateToPharmaciesList } from '../../../lib/auth/navigation';
import { AppointmentTimeline } from '../components/AppointmentTimeline';
import { PreVisitPreparation } from '../components/PreVisitPreparation';
import { PostVisitSummary } from '../components/PostVisitSummary';
import { RescheduleAppointmentModal } from '../components/RescheduleAppointmentModal';
import { BookFollowUpModal } from '../components/BookFollowUpModal';
import type { YouStackParamList } from '../../../navigation/types';
import { colors, spacing, radius, shadows } from '../../../theme';

type DetailRoute = RouteProp<YouStackParamList, 'AppointmentDetail'>;
type DetailNav = NativeStackNavigationProp<YouStackParamList, 'AppointmentDetail'>;

export function AppointmentDetailScreen() {
  const navigation = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const insets = useSafeAreaInsets();
  const { appointmentId } = route.params;

  const appointmentQuery = useDoctorAppointment(appointmentId);
  const followUpsQuery = usePatientFollowUps();
  const cancelMut = useCancelDoctorAppointment();
  const joinMut = useJoinDoctorConsultation();
  const modeMut = useSelectConsultationMode();
  const reviewMut = useSubmitDoctorReview();

  const [showReschedule, setShowReschedule] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showRx, setShowRx] = useState(false);

  const appointment = appointmentQuery.data;
  const linkedFollowUp = useMemo(() => {
    const list = followUpsQuery.data || [];
    return (
      list.find(
        f =>
          String(f.source_appointment_id || f.appointment_id || '') ===
          appointmentId,
      ) ||
      list.find(
        f => String(f.booked_appointment_id || '') === appointmentId,
      ) ||
      null
    );
  }, [followUpsQuery.data, appointmentId]);

  const timeline = useMemo(
    () =>
      appointment
        ? buildPatientTimeline(
            appointment as unknown as Record<string, unknown>,
            { followUp: linkedFollowUp },
          )
        : [],
    [appointment, linkedFollowUp],
  );

  if (appointmentQuery.isLoading && !appointment) {
    return (
      <ScreenLayout headerMode="stack" title="Track visit" showSearch={false} showCart={false}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.brandPrimary} />
        </View>
      </ScreenLayout>
    );
  }

  if (!appointment) {
    return (
      <ScreenLayout headerMode="stack" title="Track visit" showSearch={false} showCart={false}>
        <View style={styles.centered}>
          <Text style={styles.muted}>Appointment not found</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Go back</Text>
          </Pressable>
        </View>
      </ScreenLayout>
    );
  }

  const doctorLabel = appointment.doctorName
    ? /^dr\.?\s/i.test(appointment.doctorName)
      ? appointment.doctorName
      : `Dr. ${appointment.doctorName}`
    : 'Doctor';

  const openChat = () => {
    navigation.navigate('AppointmentChat', {
      appointmentId: appointment.id,
      doctorName: doctorLabel,
    });
  };

  const openVideo = async () => {
    if (!appointment.isOnline) {
      Alert.alert(
        'Clinic visit',
        `${doctorLabel} is an in-clinic appointment${
          appointment.hospital ? ` at ${appointment.hospital}` : ''
        }.`,
      );
      return;
    }
    try {
      // Align with website: mark join attempt, then open in-app Element/Jitsi room
      if (appointment.canJoin) {
        await joinMut.mutateAsync(appointment.id).catch(() => null);
      }
      navigation.navigate('AppointmentVideo', {
        appointmentId: appointment.id,
        doctorName: doctorLabel,
        doctorImage: appointment.doctorPhoto,
        slot: appointment.slot,
        meetingUrl: appointment.meetingUrl,
      });
    } catch (error) {
      Alert.alert(
        'Could not join',
        error instanceof Error ? error.message : 'Try again shortly.',
      );
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel appointment?', 'This cannot be undone.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel visit',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelMut.mutateAsync(appointment.id);
            Alert.alert('Cancelled', 'Your appointment was cancelled.');
            navigation.goBack();
          } catch (error) {
            Alert.alert(
              'Could not cancel',
              error instanceof Error ? error.message : 'Try again.',
            );
          }
        },
      },
    ]);
  };

  const canManage = ['pending', 'confirmed'].includes(
    String(appointment.status || ''),
  );
  const status = String(appointment.status || '').toLowerCase();
  const isCompleted = status === 'completed';
  const isCancelled = ['cancelled', 'no_show'].includes(status);
  // Match website: only show video while the visit can still be joined
  const showVideoActions = Boolean(appointment.isOnline && appointment.canJoin);
  const rxItems = Array.isArray(appointment.prescription?.items)
    ? (appointment.prescription?.items as Array<Record<string, unknown>>)
    : [];
  const hasPrescription = Boolean(appointment.prescription) || rxItems.length > 0;
  const rxNotes = String(
    (appointment.prescription as Record<string, unknown> | null)?.notes || '',
  ).trim();

  const orderMedicines = () => {
    setShowRx(false);
    navigateToPharmaciesList(navigation);
  };

  const sharePrescription = async () => {
    const lines = [
      `Medzoos prescription — ${doctorLabel}`,
      appointment.date ? `Date: ${appointment.date}` : null,
      '',
      ...rxItems.map((item, index) => {
        const name = String(item.name || item.medicine || 'Medicine');
        const dosage = item.dosage ? ` — ${String(item.dosage)}` : '';
        const frequency = item.frequency ? ` · ${String(item.frequency)}` : '';
        const duration = item.duration ? ` · ${String(item.duration)}` : '';
        return `${index + 1}. ${name}${dosage}${frequency}${duration}`;
      }),
      rxNotes ? `\nAdvice: ${rxNotes}` : null,
    ].filter(Boolean);
    try {
      await Share.share({ message: lines.join('\n') });
    } catch {
      /* user dismissed */
    }
  };

  return (
    <ScreenLayout headerMode="stack" title="Track visit" showSearch={false} showCart={false}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              Math.max(insets.bottom, spacing.lg) +
              (showVideoActions || (isCompleted && hasPrescription) ? 120 : 40),
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Image
            source={{
              uri:
                appointment.doctorPhoto ||
                'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
            }}
            style={styles.avatar}
          />
          <View style={styles.heroCopy}>
            <Text style={styles.name}>{doctorLabel}</Text>
            <Text style={styles.specialty}>
              {appointment.specialty || 'Doctor'}
            </Text>
            <Text style={styles.meta}>
              {appointment.isOnline ? 'Online' : 'In-clinic'} ·{' '}
              {appointment.date} · {appointment.slot}
            </Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {formatAppointmentStatusLabel(appointment.status)}
                </Text>
              </View>
              <View style={[styles.badge, styles.badgeSoft]}>
                <Text style={styles.badgeSoftText}>
                  {formatPaymentLabel(
                    appointment as unknown as Record<string, unknown>,
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {appointment.needsModeSelection ? (
          <View style={styles.modeCard}>
            <Text style={styles.cardTitle}>Doctor confirmed your appointment</Text>
            <Text style={styles.muted}>
              Choose how you would like to attend this visit.
            </Text>
            <View style={styles.modeActions}>
              <Pressable
                style={styles.modeBtn}
                disabled={modeMut.isPending}
                onPress={() =>
                  modeMut.mutate({ id: appointment.id, mode: 'online' })
                }>
                <Icon name="video" size={18} color={colors.brandPrimary} />
                <Text style={styles.modeBtnText}>Online checkup</Text>
              </Pressable>
              <Pressable
                style={styles.modeBtn}
                disabled={modeMut.isPending}
                onPress={() =>
                  modeMut.mutate({ id: appointment.id, mode: 'in_person' })
                }>
                <Icon
                  name="hospital-building"
                  size={18}
                  color={colors.brandPrimary}
                />
                <Text style={styles.modeBtnText}>In-person visit</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Visit timeline</Text>
          <AppointmentTimeline steps={timeline} status={appointment.status} />
        </View>

        <PreVisitPreparation appointment={appointment} />
        <PostVisitSummary
          appointment={appointment}
          followUp={
            linkedFollowUp
              ? {
                  id: String(linkedFollowUp.id),
                  status: linkedFollowUp.status as string | undefined,
                  recommended_date: linkedFollowUp.recommended_date as
                    | string
                    | undefined,
                  booked_appointment_id: linkedFollowUp.booked_appointment_id as
                    | string
                    | undefined,
                }
              : null
          }
          onViewPrescription={() => setShowRx(true)}
          onBookFollowUp={() => setShowFollowUp(true)}
          onViewFollowUpAppointment={id =>
            navigation.navigate('AppointmentDetail', { appointmentId: id })
          }
        />

        <View style={styles.actionsRow}>
          {(appointment.canChat || appointment.canViewChat) && (
            <Pressable style={[styles.actionChip, styles.actionChat]} onPress={openChat}>
              <Icon name="message-outline" size={18} color={colors.white} />
              <Text style={styles.actionChipText}>
                {appointment.chatReadOnly ? 'View chat' : 'Chat'}
              </Text>
            </Pressable>
          )}
          {showVideoActions ? (
            <Pressable
              style={[styles.actionChip, styles.actionVideo]}
              onPress={openVideo}>
              <Icon name="video" size={18} color={colors.white} />
              <Text style={styles.actionChipText}>Join video</Text>
            </Pressable>
          ) : null}
          {isCompleted && hasPrescription ? (
            <Pressable
              style={[styles.actionChip, styles.actionVideo]}
              onPress={() => setShowRx(true)}>
              <Icon name="pill" size={18} color={colors.white} />
              <Text style={styles.actionChipText}>Prescription</Text>
            </Pressable>
          ) : null}
        </View>

        {canManage ? (
          <View style={styles.manageRow}>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => setShowReschedule(true)}>
              <Text style={styles.secondaryBtnText}>Reschedule</Text>
            </Pressable>
            <Pressable style={styles.dangerBtn} onPress={handleCancel}>
              <Text style={styles.dangerBtnText}>Cancel</Text>
            </Pressable>
          </View>
        ) : null}

        {appointment.canReview ? (
          <Pressable style={styles.secondaryBtn} onPress={() => setShowReview(true)}>
            <Text style={styles.secondaryBtnText}>Leave a review</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      {showVideoActions || (isCompleted && hasPrescription) || (!appointment.isOnline && !isCompleted && !isCancelled) ? (
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, spacing.md) },
          ]}>
          {showVideoActions ? (
            <Pressable style={styles.footerPrimaryBtn} onPress={openVideo}>
              <Text style={styles.footerPrimaryBtnText}>Join video call</Text>
            </Pressable>
          ) : isCompleted && hasPrescription ? (
            <Pressable
              style={styles.footerPrimaryBtn}
              onPress={() => setShowRx(true)}>
              <Text style={styles.footerPrimaryBtnText}>View prescription</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.footerPrimaryBtn} onPress={openVideo}>
              <Text style={styles.footerPrimaryBtnText}>View clinic details</Text>
            </Pressable>
          )}
        </View>
      ) : null}

      <RescheduleAppointmentModal
        visible={showReschedule}
        appointment={appointment}
        onClose={() => setShowReschedule(false)}
      />
      <BookFollowUpModal
        visible={showFollowUp}
        followUp={
          linkedFollowUp
            ? {
                id: String(linkedFollowUp.id),
                preferred_mode: linkedFollowUp.preferred_mode as
                  | string
                  | undefined,
                recommended_date: linkedFollowUp.recommended_date as
                  | string
                  | undefined,
                doctor: linkedFollowUp.doctor as { name?: string } | undefined,
              }
            : null
        }
        onClose={() => setShowFollowUp(false)}
      />

      <Modal visible={showReview} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.cardTitle}>Review {doctorLabel}</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map(value => (
                <Pressable key={value} onPress={() => setRating(value)}>
                  <Icon
                    name={rating >= value ? 'star' : 'star-outline'}
                    size={28}
                    color="#F59E0B"
                  />
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.reviewInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Write your review..."
              multiline
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.manageRow}>
              <Pressable
                style={styles.secondaryBtn}
                onPress={() => setShowReview(false)}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.primaryBtn}
                disabled={reviewMut.isPending || !appointment.doctorId}
                onPress={async () => {
                  try {
                    await reviewMut.mutateAsync({
                      doctorId: appointment.doctorId!,
                      appointment_id: appointment.id,
                      rating,
                      comment,
                    });
                    setShowReview(false);
                    Alert.alert('Thanks', 'Your review was submitted.');
                  } catch (error) {
                    Alert.alert(
                      'Could not submit',
                      error instanceof Error ? error.message : 'Try again.',
                    );
                  }
                }}>
                <Text style={styles.primaryBtnText}>Submit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showRx} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.rxHeader}>
              <Text style={styles.cardTitle}>Prescription</Text>
              <Pressable onPress={() => setShowRx(false)} hitSlop={8}>
                <Icon name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>
            <Text style={styles.rxDoctor}>{doctorLabel}</Text>
            {appointment.date ? (
              <Text style={styles.muted}>{appointment.date}</Text>
            ) : null}

            {rxItems.length > 0 ? (
              <View style={styles.rxList}>
                {rxItems.map((item, index) => (
                  <View key={`${String(item.medicine || item.name)}-${index}`} style={styles.rxItem}>
                    <Text style={styles.rxItemName}>
                      {index + 1}. {String(item.name || item.medicine || 'Medicine')}
                    </Text>
                    <Text style={styles.muted}>
                      {[item.dosage, item.frequency, item.duration, item.instructions]
                        .filter(Boolean)
                        .map(String)
                        .join(' · ') || 'As directed'}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.muted}>
                {rxNotes || 'Prescription details unavailable.'}
              </Text>
            )}

            {rxNotes && rxItems.length > 0 ? (
              <View style={styles.rxNotesBox}>
                <Text style={styles.rxNotesLabel}>Doctor advice</Text>
                <Text style={styles.muted}>{rxNotes}</Text>
              </View>
            ) : null}

            {rxItems.length > 0 ? (
              <Pressable style={styles.modalPrimaryBtn} onPress={orderMedicines}>
                <Icon name="cart-outline" size={18} color="#FFFFFF" />
                <Text style={styles.modalPrimaryBtnText}>Order medicines</Text>
              </Pressable>
            ) : null}

            <View style={styles.manageRow}>
              <Pressable style={styles.modalSecondaryBtn} onPress={() => setShowRx(false)}>
                <Text style={styles.modalSecondaryBtnText}>Close</Text>
              </Pressable>
              <Pressable style={styles.modalSecondaryBtn} onPress={sharePrescription}>
                <Text style={styles.modalSecondaryBtnText}>Share</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  muted: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  link: { fontSize: 14, fontWeight: '600', color: colors.brandPrimary },
  heroCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral100,
  },
  heroCopy: { flex: 1, justifyContent: 'center', gap: 4 },
  name: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  specialty: { fontSize: 13, color: colors.textMuted },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  badge: {
    backgroundColor: '#CCFBF1',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#0F766E' },
  badgeSoft: { backgroundColor: colors.neutral100 },
  badgeSoftText: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  modeCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modeActions: { gap: spacing.sm, marginTop: spacing.sm },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  modeBtnText: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  actionChat: { backgroundColor: colors.brandPrimary },
  actionVideo: { backgroundColor: '#0F766E' },
  actionChipText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  manageRow: { flexDirection: 'row', gap: spacing.sm },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  secondaryBtnText: {
    color: colors.brandPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  dangerBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FDA4AF',
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
  },
  dangerBtnText: { color: '#BE123C', fontWeight: '700', fontSize: 13 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral200,
  },
  primaryBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    flex: 1,
  },
  primaryBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  footerPrimaryBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerPrimaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  rxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rxDoctor: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rxList: { gap: spacing.sm },
  rxItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
  },
  rxItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rxNotesBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  rxNotesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  modalPrimaryBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  modalSecondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  modalSecondaryBtnText: {
    color: colors.brandPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  stars: { flexDirection: 'row', gap: spacing.sm },
  reviewInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: radius.lg,
    padding: spacing.md,
    textAlignVertical: 'top',
    color: colors.textPrimary,
  },
});

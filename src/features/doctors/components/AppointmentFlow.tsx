import { colors, spacing, radius, shadows } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../lib/auth/AuthContext';
import { navigateToOrders } from '../../../lib/auth/navigation';
import { useBookDoctorAppointment } from '../../../lib/hooks/useApi';
import {
  formatConsultations,
  type Doctor,
} from '../../../lib/mappers/doctor';
import { KeyboardAwareScrollView } from '../../../components/keyboard';

import type { DoctorsStackParamList } from '../../../navigation/types';
import {
  buildDoctorConsultOptions,
  type ConsultOption,
} from '../utils/consultOptions';
import {
  buildAppointmentIso,
  buildSlotParams,
  formatBookingDate,
  formatShortSlot,
  toLocalDateValue,
} from '../utils/bookingUtils';
import { bookingUi, useBookingLayout } from '../utils/bookingUi';
import { StripeCheckoutModal } from '../../../components/payments/StripeCheckoutModal';
import { startStripeCheckout } from '../../../lib/payments/stripeCheckout';
import { DoctorSlotPicker } from './DoctorSlotPicker';
import { BookingAuthModal } from './BookingAuthModal';
import { ConsultOptionRow } from './ConsultOptionRow';
import { ShareMedicalHistoryStep } from './ShareMedicalHistoryStep';
import type { ShareGrantPayload } from '../../../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { medicalHistoryApi } from '../../../lib/api';

type AppointmentFlowProps = {
  doctor: Doctor;
  initialConsultType?: 'online' | 'in_person' | null;
  practiceLocationId?: string | null;
  hospitalId?: string | null;
};

function withDr(name: string) {
  const trimmed = name.trim();
  if (/^dr\.?\s/i.test(trimmed)) return trimmed;
  return `Dr. ${trimmed}`;
}

function formatFee(fee: number) {
  return `Rs ${fee.toLocaleString()}`;
}

function BookingHero({
  doctor,
  fee,
  onChangeConsult,
}: {
  doctor: Doctor;
  fee: number;
  onChangeConsult: () => void;
}) {
  const layout = useBookingLayout();
  const patients = formatConsultations(doctor.reviews);
  const experience =
    doctor.experienceYears > 0
      ? `${doctor.experienceYears}Y+`
      : doctor.experience || '—';
  const iconSm = layout.isCompact ? 14 : 15;
  const iconMd = layout.isCompact ? 18 : 20;

  return (
    <View style={styles.hero}>
      <View style={[styles.heroTop, { minHeight: layout.photoH }]}>
        <View
          style={[
            styles.heroCopy,
            { paddingRight: layout.photoW + spacing.sm },
          ]}>
          <Text style={[styles.specialty, { fontSize: layout.font.specialty }]}>
            {doctor.specialty}
          </Text>
          <Text
            style={[
              styles.name,
              {
                fontSize: layout.font.name,
                lineHeight: layout.font.name + 6,
              },
            ]}
            numberOfLines={2}>
            {withDr(doctor.name)}
          </Text>
          <Text style={styles.feeLine}>
            <Text style={[styles.feeValue, { fontSize: layout.font.fee }]}>
              {formatFee(fee)}
            </Text>
            <Text style={[styles.feeUnit, { fontSize: layout.font.feeUnit }]}>
              {' '}
              /session
            </Text>
          </Text>
        </View>
        <Image
          source={{ uri: doctor.photo }}
          style={[
            styles.heroPhoto,
            {
              width: layout.photoW,
              height: layout.photoH,
            },
          ]}
          resizeMode="cover"
        />
      </View>

      {/* Stats sit fully below the photo — no negative overlap that covers values. */}
      <View style={[styles.statsRow, { gap: layout.statsGap }]}>
        <View
          style={[
            styles.statCard,
            { paddingVertical: layout.isCompact ? 14 : 16 },
          ]}>
          <View style={styles.statIcon}>
            <Icon
              name="book-open-page-variant-outline"
              size={iconSm}
              color={bookingUi.accent}
            />
          </View>
          <Text
            style={[
              styles.statValue,
              {
                fontSize: layout.font.statValue,
                lineHeight: layout.font.statValue + 4,
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}>
            {patients}+
          </Text>
          <Text style={[styles.statLabel, { fontSize: layout.font.statLabel }]}>
            Patients
          </Text>
        </View>
        <View
          style={[
            styles.statCard,
            { paddingVertical: layout.isCompact ? 14 : 16 },
          ]}>
          <View style={styles.statIcon}>
            <Icon
              name="hand-heart-outline"
              size={iconSm}
              color={bookingUi.accent}
            />
          </View>
          <Text
            style={[
              styles.statValue,
              {
                fontSize: layout.font.statValue,
                lineHeight: layout.font.statValue + 4,
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}>
            {experience}
          </Text>
          <Text style={[styles.statLabel, { fontSize: layout.font.statLabel }]}>
            Experience
          </Text>
        </View>
      </View>

      <View style={[styles.ratingRow, { gap: layout.isCompact ? 6 : 8 }]}>
        <Pressable
          style={[
            styles.actionCircle,
            {
              width: layout.actionSize,
              height: layout.actionSize,
              borderRadius: layout.actionSize / 2,
            },
          ]}
          onPress={onChangeConsult}
          hitSlop={6}>
          <Icon name="calendar-plus" size={iconMd} color={bookingUi.ink} />
        </Pressable>
        <View
          style={[
            styles.ratingBadge,
            { paddingVertical: layout.isCompact ? 12 : 14 },
          ]}>
          <Icon name="star" size={iconSm} color={bookingUi.white} />
          <Text
            style={[styles.ratingText, { fontSize: layout.font.rating }]}
            numberOfLines={1}>
            Rating {doctor.rating?.toFixed(1) ?? '4.8'}
          </Text>
        </View>
        <Pressable
          style={[
            styles.actionCircle,
            {
              width: layout.actionSize,
              height: layout.actionSize,
              borderRadius: layout.actionSize / 2,
            },
          ]}
          onPress={onChangeConsult}
          hitSlop={6}>
          <Icon
            name="calendar-blank-outline"
            size={iconMd}
            color={bookingUi.ink}
          />
        </Pressable>
        <View
          style={[
            styles.actionCircle,
            {
              width: layout.actionSize,
              height: layout.actionSize,
              borderRadius: layout.actionSize / 2,
            },
          ]}>
          <Icon name="clock-outline" size={iconMd} color={bookingUi.ink} />
        </View>
      </View>
    </View>
  );
}

export function AppointmentFlow({
  doctor,
  initialConsultType = null,
  practiceLocationId = null,
  hospitalId = null,
}: AppointmentFlowProps) {
  const layout = useBookingLayout();
  const navigation =
    useNavigation<NativeStackNavigationProp<DoctorsStackParamList>>();
  const { user, isAuthenticated } = useAuth();
  const bookAppointment = useBookDoctorAppointment();
  const queryClient = useQueryClient();

  const allOptions = useMemo(
    () => buildDoctorConsultOptions(doctor, hospitalId),
    [doctor, hospitalId],
  );

  const defaultOption = useMemo(() => {
    if (practiceLocationId) {
      const match = allOptions.find(
        o => o.practiceLocationId === practiceLocationId,
      );
      if (match) return match;
    }
    if (initialConsultType) {
      const match = allOptions.find(o => o.type === initialConsultType);
      if (match) return match;
    }
    return allOptions[0] || null;
  }, [allOptions, practiceLocationId, initialConsultType]);

  const [selectedOption, setSelectedOption] = useState<ConsultOption | null>(
    defaultOption,
  );
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    toLocalDateValue(new Date()),
  );
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'pay_at_clinic'>(
    'stripe',
  );
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);
  const [payingOnline, setPayingOnline] = useState(false);
  const [shareKeys, setShareKeys] = useState<string[]>([]);
  const [purpose, setPurpose] = useState<'consultation' | 'procedure'>(
    'consultation',
  );
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');

  // Options can resolve after mount — keep selection in sync for in-clinic entry
  useEffect(() => {
    if (!defaultOption) return;
    setSelectedOption(prev => {
      if (!prev) return defaultOption;
      const stillValid = allOptions.some(option => option.id === prev.id);
      return stillValid ? prev : defaultOption;
    });
  }, [defaultOption, allOptions]);

  useEffect(() => {
    if (user?.name) {
      setPatientName(prev => prev.trim() || user.name || '');
    }
    if (user?.phone) {
      setPatientPhone(prev => prev.trim() || user.phone || '');
    }
  }, [user?.name, user?.phone]);

  const consultType = selectedOption?.type;
  const isInPerson = consultType === 'in_person';

  // In-clinic defaults to pay-at-clinic; online must use Stripe
  useEffect(() => {
    if (isInPerson) {
      setPaymentMethod(prev => (prev === 'stripe' ? 'pay_at_clinic' : prev));
    } else if (consultType === 'online') {
      setPaymentMethod('stripe');
    }
  }, [consultType, isInPerson]);

  const appointmentDateIso = useMemo(
    () =>
      selectedSlot
        ? buildAppointmentIso(selectedDate, selectedSlot)
        : '',
    [selectedDate, selectedSlot],
  );

  const slotParams = useMemo(
    () => buildSlotParams(selectedOption),
    [selectedOption],
  );

  const handleSlotContinue = () => {
    if (!selectedOption) {
      Alert.alert(
        'Choose consultation',
        'Please choose online or in-clinic consultation first.',
      );
      return;
    }
    if (!selectedSlot) {
      Alert.alert('Select a slot', 'Please select a time slot to continue.');
      return;
    }
    if (!selectedDate) {
      Alert.alert('Select a date', 'Please select an appointment date.');
      return;
    }
    setStep(2);
  };

  const buildShareGrants = async (): Promise<ShareGrantPayload[]> => {
    if (!shareKeys.length) return [];
    const shareable =
      queryClient.getQueryData<
        Awaited<ReturnType<typeof medicalHistoryApi.listShareable>>
      >(['shareable-medical-history']) ||
      (await medicalHistoryApi.listShareable().catch(() => undefined));
    return shareKeys
      .map(key => {
        const [record_type, ...rest] = key.split(':');
        const record_id = rest.join(':');
        if (!record_type || !record_id) return null;
        return { record_type, record_id };
      })
      .filter(Boolean) as ShareGrantPayload[];
  };

  const resolvePracticeLocationId = () => {
    const value = String(selectedOption?.practiceLocationId || '').trim();
    if (
      !value ||
      value === 'legacy' ||
      value === 'loc' ||
      value === 'null' ||
      value === 'undefined'
    ) {
      return undefined;
    }
    return value;
  };

  const resolveHospitalId = () => {
    return (
      selectedOption?.hospitalId ||
      doctor.hospitalId ||
      doctor.hospitalData?.id ||
      undefined
    );
  };

  const submitBooking = async () => {
    if (!selectedOption) {
      Alert.alert(
        'Missing consultation type',
        'Please choose online or in-clinic consultation.',
      );
      return;
    }
    if (!selectedOption.type) {
      Alert.alert(
        'Missing consultation type',
        'Please choose online or in-clinic consultation.',
      );
      return;
    }
    if (!selectedSlot) {
      Alert.alert('Missing time slot', 'Please go back and select a time slot.');
      setStep(1);
      return;
    }
    if (!selectedDate || !appointmentDateIso) {
      Alert.alert('Missing date', 'Please go back and select an appointment date.');
      setStep(1);
      return;
    }
    if (!patientName.trim()) {
      Alert.alert('Patient name required', 'Please enter the patient name.');
      setStep(2);
      return;
    }
    if (selectedOption.type === 'in_person') {
      const practiceLocationId = resolvePracticeLocationId();
      const hospitalId = resolveHospitalId();
      if (!practiceLocationId && !hospitalId && !doctor.hospital) {
        Alert.alert(
          'Clinic required',
          'This in-clinic booking needs a hospital/clinic. Please choose a clinic location.',
        );
        setShowOptionModal(true);
        return;
      }
    }

    setPayingOnline(true);
    try {
      const share_grants = await buildShareGrants();
      const practiceLocationId = resolvePracticeLocationId();
      const hospitalId = resolveHospitalId();
      const method =
        selectedOption.type === 'online'
          ? 'stripe'
          : paymentMethod === 'stripe'
            ? 'stripe'
            : 'pay_at_clinic';

      const result = await bookAppointment.mutateAsync({
        doctor_id: doctor.id,
        slot: selectedSlot,
        payment_method: method,
        appointment_date: appointmentDateIso,
        reason:
          purpose === 'consultation'
            ? 'Normal Consultation'
            : 'Surgery / Procedure Visit',
        preferred_consultation_mode: selectedOption.type,
        hospital_id: hospitalId || undefined,
        practice_location_id: practiceLocationId,
        share_grants: share_grants.length ? share_grants : undefined,
      });

      const booked =
        (result as { appointment?: Record<string, unknown> }).appointment ||
        (result as Record<string, unknown>);
      const appointmentId = String(
        (booked as { id?: string; appointment_id?: string }).id ||
          (booked as { appointment_id?: string }).appointment_id ||
          '',
      );

      if (method === 'stripe') {
        if (!appointmentId) {
          throw new Error('Appointment created but missing id for Stripe payment.');
        }
        const payment = await startStripeCheckout({
          purpose: 'appointment',
          appointment_id: appointmentId,
        });
        setStripeUrl(payment.checkoutUrl);
        return;
      }

      setStep(4);
    } catch (error) {
      Alert.alert(
        'Booking failed',
        error instanceof Error ? error.message : 'Could not book appointment.',
      );
    } finally {
      setPayingOnline(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!patientName.trim()) {
      Alert.alert('Patient name required', 'Please enter the patient name.');
      return;
    }

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setStep(3);
  };

  if (!selectedOption) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>
          No consultation options available for this doctor.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {step === 1 ? (
        <BookingHero
          doctor={doctor}
          fee={selectedOption.fee}
          onChangeConsult={() => setShowOptionModal(true)}
        />
      ) : step === 2 || step === 3 ? (
        <View style={styles.doctorHeader}>
          <Image source={{ uri: doctor.photo }} style={styles.doctorPhoto} />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{withDr(doctor.name)}</Text>
            <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
            <View style={styles.consultRow}>
              <Icon
                name={consultType === 'online' ? 'video' : 'hospital-building'}
                size={14}
                color={bookingUi.accent}
              />
              <Text style={styles.consultTitle}>{selectedOption.title}</Text>
              <TouchableOpacity onPress={() => setShowOptionModal(true)}>
                <Text style={styles.changeLink}>Change</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.feeText}>
              Fee: {formatFee(selectedOption.fee)}
            </Text>
          </View>
        </View>
      ) : null}

      {step === 1 && (
        <View
          style={[
            styles.stepBody,
            {
              marginHorizontal: layout.isTablet ? 0 : -layout.pad,
              paddingHorizontal: layout.pad,
              borderRadius: layout.isTablet ? 28 : undefined,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
            },
          ]}>
          <DoctorSlotPicker
            doctorId={doctor.id}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onDateChange={setSelectedDate}
            onSlotChange={setSelectedSlot}
            slotParams={slotParams}
          />

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              !selectedSlot && styles.primaryBtnDisabled,
              layout.isTablet && styles.primaryBtnTablet,
            ]}
            onPress={handleSlotContinue}
            disabled={!selectedSlot}
            activeOpacity={0.85}>
            <Text style={[styles.primaryBtnText, { fontSize: layout.font.cta }]}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => setStep(1)}
            activeOpacity={0.8}>
            <Icon name="arrow-left" size={16} color={bookingUi.accent} />
            <Text style={styles.backLinkText}>Change date & time</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Patient details</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Patient name</Text>
            <TextInput
              style={styles.input}
              value={patientName}
              onChangeText={setPatientName}
              placeholder="Enter your name"
              placeholderTextColor={colors.neutral500}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Phone number</Text>
            <TextInput
              style={styles.input}
              value={patientPhone}
              onChangeText={setPatientPhone}
              placeholder="03XX XXXXXXX"
              keyboardType="phone-pad"
              placeholderTextColor={colors.neutral500}
            />
            <Text style={styles.fieldHint}>
              You will be contacted through this number.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Purpose of appointment</Text>
          {(
            [
              { id: 'consultation' as const, label: 'Normal Consultation' },
              { id: 'procedure' as const, label: 'Surgery / Procedure Visit' },
            ] as const
          ).map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.radioRow,
                purpose === item.id && styles.radioRowActive,
              ]}
              onPress={() => setPurpose(item.id)}
              activeOpacity={0.85}>
              <View
                style={[
                  styles.radio,
                  purpose === item.id && styles.radioActive,
                ]}
              />
              <Text style={styles.radioLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.sectionTitle}>Share health records?</Text>
          <Text style={styles.fieldHint}>
            Next step lets you pick exact visit summaries, prescriptions, and
            lab reports to share with this doctor.
          </Text>

          <Text style={[styles.sectionTitle, styles.paymentTitle]}>
            Select payment method
          </Text>
          {(
            [
              {
                id: 'stripe' as const,
                label: 'Pay online (Stripe)',
                note: `PKR ${selectedOption.fee.toLocaleString()}`,
              },
              {
                id: 'pay_at_clinic' as const,
                label:
                  isInPerson
                    ? 'Pay cash at clinic'
                    : 'Pay after consultation',
                note: `PKR ${selectedOption.fee.toLocaleString()}`,
              },
            ] as const
          )
            .filter(method => (consultType === 'online' ? method.id === 'stripe' : true))
            .map(method => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentRow,
                paymentMethod === method.id && styles.paymentRowActive,
              ]}
              onPress={() => setPaymentMethod(method.id)}
              activeOpacity={0.85}>
              <Text style={styles.paymentLabel}>{method.label}</Text>
              <Text style={styles.paymentNote}>{method.note}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Image
                source={{ uri: doctor.photo }}
                style={styles.summaryAvatar}
              />
              <View>
                <Text style={styles.summaryName}>{doctor.name}</Text>
                <Text style={styles.summarySpecialty}>{doctor.specialty}</Text>
              </View>
            </View>
            <Text style={styles.summaryLine}>
              Location: {selectedOption.title}
            </Text>
            <Text style={styles.summaryFee}>
              PKR {selectedOption.fee.toLocaleString()}
            </Text>
            <View style={styles.summarySlotRow}>
              <Icon name="clock-outline" size={14} color={colors.brandPrimary} />
              <Text style={styles.summarySlot}>
                {formatShortSlot(selectedDate, selectedSlot || '')}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                layout.isTablet && styles.primaryBtnTablet,
                (bookAppointment.isPending ||
                  payingOnline ||
                  !patientName.trim()) &&
                  styles.primaryBtnDisabled,
              ]}
              onPress={handleConfirmBooking}
              disabled={
                bookAppointment.isPending ||
                payingOnline ||
                !patientName.trim()
              }
              activeOpacity={0.85}>
              {bookAppointment.isPending || payingOnline ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {paymentMethod === 'stripe'
                    ? 'Continue to share & pay'
                    : 'Continue'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.secureRow}>
            <Icon name="lock-outline" size={14} color={colors.neutral500} />
            <Text style={styles.secureText}>
              Secure payment · pending until doctor confirms
            </Text>
          </View>
        </KeyboardAwareScrollView>
      )}

      {step === 3 && (
        <View style={[styles.stepBody, { paddingHorizontal: layout.pad }]}>
          <ShareMedicalHistoryStep
            doctorName={doctor.name}
            selectedKeys={shareKeys}
            onChangeSelectedKeys={setShareKeys}
            onBack={() => setStep(2)}
            onSkip={() => {
              setShareKeys([]);
              submitBooking();
            }}
            onShareAndContinue={() => submitBooking()}
            isSubmitting={bookAppointment.isPending || payingOnline}
          />
        </View>
      )}

      {step === 4 && (
        <View
          style={[
            styles.stepBody,
            styles.successSheet,
            {
              marginHorizontal: layout.isTablet ? 0 : -layout.pad,
              paddingHorizontal: layout.pad,
              borderRadius: layout.isTablet ? 28 : undefined,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              minHeight: layout.isTall ? Math.min(layout.height * 0.42, 380) : undefined,
            },
          ]}>
          <View style={styles.successWrap}>
            <View
              style={[
                styles.successIcon,
                layout.isCompact && styles.successIconCompact,
              ]}>
              <Icon
                name="check"
                size={layout.isCompact ? 28 : 32}
                color={colors.statusSuccess}
              />
            </View>
            <Text
              style={[
                styles.successTitle,
                { fontSize: layout.font.name > 24 ? 22 : layout.isCompact ? 18 : 20 },
              ]}>
              Appointment Booked
            </Text>
            <Text
              style={[
                styles.successSub,
                { fontSize: layout.isCompact ? 13 : 14 },
              ]}>
              Your {consultType === 'online' ? 'online' : 'in-clinic'} appointment
              with {doctor.name} is pending confirmation.
            </Text>
            <Text style={styles.successDate}>
              {formatBookingDate(selectedDate)} · {selectedSlot}
            </Text>
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                styles.successBtn,
                layout.isTablet && styles.primaryBtnTablet,
              ]}
              onPress={() => navigation.navigate('ConsultHome')}
              activeOpacity={0.85}>
              <Text
                style={[styles.primaryBtnText, { fontSize: layout.font.cta }]}
                numberOfLines={1}>
                Back to Doctors
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                styles.successBtn,
                layout.isTablet && styles.primaryBtnTablet,
              ]}
              onPress={() => navigateToOrders(navigation)}
              activeOpacity={0.85}>
              <Text
                style={[
                  styles.secondaryBtnText,
                  { fontSize: layout.isCompact ? 14 : 15 },
                ]}
                numberOfLines={1}>
                View Appointments
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        visible={showOptionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptionModal(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowOptionModal(false)}>
          <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choose consultation type</Text>
            <ScrollView style={styles.modalList}>
              {allOptions.map(option => (
                <View key={option.id} style={styles.modalOption}>
                  <ConsultOptionRow
                    option={option}
                    onPress={opt => {
                      setSelectedOption(opt);
                      setSelectedSlot(null);
                      setShowOptionModal(false);
                    }}
                  />
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <BookingAuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          setStep(3);
        }}
        doctor={doctor}
        consultOption={selectedOption}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
      />

      <StripeCheckoutModal
        visible={Boolean(stripeUrl)}
        checkoutUrl={stripeUrl}
        onPaid={() => {
          setStripeUrl(null);
          setStep(4);
        }}
        onCancelled={() => {
          setStripeUrl(null);
          Alert.alert(
            'Payment cancelled',
            'Appointment was created but payment was not completed.',
          );
        }}
        onError={message => {
          setStripeUrl(null);
          Alert.alert('Payment failed', message);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyWrap: {
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    color: colors.neutral500,
  },
  hero: {
    marginBottom: 8,
    width: '100%',
  },
  heroTop: {
    position: 'relative',
    width: '100%',
    marginBottom: 12,
  },
  heroCopy: {
    gap: 6,
    paddingBottom: 4,
    zIndex: 2,
  },
  heroPhoto: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  specialty: {
    fontWeight: '500',
    color: bookingUi.muted,
  },
  name: {
    fontWeight: '800',
    color: bookingUi.ink,
    letterSpacing: -0.5,
  },
  feeLine: {
    marginTop: 4,
    flexWrap: 'wrap',
  },
  feeValue: {
    fontWeight: '800',
    color: bookingUi.ink,
  },
  feeUnit: {
    fontWeight: '500',
    color: bookingUi.muted,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: bookingUi.card,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingRight: 40,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.cardSoft,
  },
  statIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: bookingUi.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontWeight: '800',
    color: bookingUi.ink,
    letterSpacing: -0.4,
  },
  statLabel: {
    marginTop: 4,
    fontWeight: '500',
    color: bookingUi.muted,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
    width: '100%',
  },
  actionCircle: {
    backgroundColor: bookingUi.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...shadows.cardSoft,
  },
  ratingBadge: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: bookingUi.accent,
    ...shadows.cardSoft,
  },
  ratingText: {
    fontWeight: '700',
    color: bookingUi.white,
    flexShrink: 1,
  },
  stepBody: {
    backgroundColor: bookingUi.sheet,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingBottom: spacing.lg,
    marginTop: 12,
    width: 'auto',
  },
  primaryBtn: {
    height: 54,
    borderRadius: 999,
    backgroundColor: bookingUi.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    paddingHorizontal: spacing.xl,
    alignSelf: 'stretch',
    width: '100%',
  },
  primaryBtnTablet: {
    alignSelf: 'center',
    minWidth: 280,
    maxWidth: 420,
    width: '60%',
  },
  primaryBtnDisabled: {
    opacity: 0.45,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: bookingUi.white,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  doctorHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    marginBottom: spacing.lg,
  },
  doctorPhoto: {
    width: 64,
    height: 64,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral100,
  },
  doctorInfo: {
    flex: 1,
    minWidth: 0,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  doctorSpecialty: {
    fontSize: 12,
    fontWeight: '600',
    color: bookingUi.accent,
    marginTop: 2,
  },
  consultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  consultTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral600,
    flex: 1,
  },
  changeLink: {
    fontSize: 12,
    fontWeight: '600',
    color: bookingUi.accent,
  },
  feeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginTop: spacing.sm,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  backLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: bookingUi.accent,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: spacing.md,
  },
  paymentTitle: {
    marginTop: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.inkHeadline,
    marginBottom: spacing.xs,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.inkHeadline,
    backgroundColor: colors.white,
  },
  fieldHint: {
    fontSize: 11,
    color: colors.neutral500,
    marginTop: spacing.xs,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  radioRowActive: {
    borderColor: colors.primary700,
    backgroundColor: colors.primary100,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.primary300,
  },
  radioActive: {
    borderColor: colors.primary700,
    backgroundColor: colors.primary700,
  },
  radioLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.inkHeadline,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: healthOs.cardBorder,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  paymentRowActive: {
    borderColor: colors.primary700,
    backgroundColor: colors.primary100,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.inkHeadline,
    flex: 1,
  },
  paymentNote: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  summaryCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  summaryAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  summaryName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  summarySpecialty: {
    fontSize: 11,
    color: colors.neutral500,
  },
  summaryLine: {
    fontSize: 12,
    color: colors.neutral600,
    marginBottom: spacing.xs,
  },
  summaryFee: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: spacing.sm,
  },
  summarySlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summarySlot: {
    fontSize: 12,
    color: colors.neutral600,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xxxl,
  },
  secureText: {
    fontSize: 12,
    color: colors.neutral500,
  },
  successSheet: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  successWrap: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.statusSuccessBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successIconCompact: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.inkHeadline,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  successSub: {
    fontSize: 14,
    color: colors.neutral500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  successDate: {
    fontSize: 13,
    color: colors.neutral500,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  successBtn: {
    marginTop: spacing.sm,
    minHeight: 52,
    height: undefined,
    paddingVertical: spacing.md,
  },
  secondaryBtn: {
    minHeight: 52,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary700,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignSelf: 'stretch',
    width: '100%',
    backgroundColor: colors.primary100,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.brandPrimary,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12,26,46,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral300,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: spacing.lg,
  },
  modalList: {
    maxHeight: 360,
  },
  modalOption: {
    marginBottom: spacing.sm,
  },
});
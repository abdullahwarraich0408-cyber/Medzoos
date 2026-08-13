import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { useMemo, useState } from 'react';
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
import { useBookDoctorAppointment } from '../../../lib/hooks/useApi';
import type { Doctor } from '../../../lib/mappers/doctor';

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
import { DoctorSlotPicker } from './DoctorSlotPicker';
import { BookingAuthModal } from './BookingAuthModal';
import { ConsultOptionRow } from './ConsultOptionRow';

type AppointmentFlowProps = {
  doctor: Doctor;
  initialConsultType?: 'online' | 'in_person' | null;
  practiceLocationId?: string | null;
  hospitalId?: string | null;
};

export function AppointmentFlow({
  doctor,
  initialConsultType = null,
  practiceLocationId = null,
  hospitalId = null,
}: AppointmentFlowProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<DoctorsStackParamList>>();
  const { user, isAuthenticated } = useAuth();
  const bookAppointment = useBookDoctorAppointment();

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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [purpose, setPurpose] = useState<'consultation' | 'procedure'>(
    'consultation',
  );
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');

  const consultType = selectedOption?.type;
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
    if (!selectedSlot) {
      Alert.alert('Select a slot', 'Please select a time slot to continue.');
      return;
    }
    setStep(2);
  };

  const submitBooking = async () => {
    if (!consultType || !selectedOption || !selectedSlot) {
      Alert.alert('Missing details', 'Please complete all booking details.');
      return;
    }

    try {
      await bookAppointment.mutateAsync({
        doctor_id: doctor.id,
        slot: selectedSlot,
        payment_method: paymentMethod,
        appointment_date: appointmentDateIso,
        reason:
          purpose === 'consultation'
            ? 'Normal Consultation'
            : 'Surgery / Procedure Visit',
        preferred_consultation_mode: consultType,
        hospital_id: selectedOption.hospitalId || undefined,
        practice_location_id: selectedOption.practiceLocationId || undefined,
      });
      setStep(3);
    } catch (error) {
      Alert.alert(
        'Booking failed',
        error instanceof Error ? error.message : 'Could not book appointment.',
      );
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

    await submitBooking();
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
      {step < 3 && (
        <View style={styles.doctorHeader}>
          <Image source={{ uri: doctor.photo }} style={styles.doctorPhoto} />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
            <View style={styles.consultRow}>
              <Icon
                name={consultType === 'online' ? 'video' : 'hospital-building'}
                size={14}
                color={colors.brandPrimary}
              />
              <Text style={styles.consultTitle}>{selectedOption.title}</Text>
              <TouchableOpacity onPress={() => setShowOptionModal(true)}>
                <Text style={styles.changeLink}>Change</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.feeText}>
              Fee: PKR {selectedOption.fee.toLocaleString()}
            </Text>
          </View>
        </View>
      )}

      {step === 1 && (
        <View>
          <DoctorSlotPicker
            doctorId={doctor.id}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onDateChange={setSelectedDate}
            onSlotChange={setSelectedSlot}
            slotParams={slotParams}
          />

          <View style={styles.trustBanner}>
            <Text style={styles.trustText}>
              95% patients feel satisfied after booking on Medzoos. It takes
              only 30 sec to book an appointment.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              !selectedSlot && styles.primaryBtnDisabled,
            ]}
            onPress={handleSlotContinue}
            disabled={!selectedSlot}
            activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => setStep(1)}
            activeOpacity={0.8}>
            <Icon name="arrow-left" size={16} color={colors.brandPrimary} />
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

          <Text style={[styles.sectionTitle, styles.paymentTitle]}>
            Select payment method
          </Text>
          {(
            [
              {
                id: 'card' as const,
                label: 'Online Payment',
                note: `PKR ${selectedOption.fee.toLocaleString()}`,
              },
              {
                id: 'cod' as const,
                label:
                  consultType === 'in_person'
                    ? 'Pay cash at clinic'
                    : 'Pay after consultation',
                note: `PKR ${selectedOption.fee.toLocaleString()}`,
              },
            ] as const
          ).map(method => (
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
                (bookAppointment.isPending || !patientName.trim()) &&
                  styles.primaryBtnDisabled,
              ]}
              onPress={handleConfirmBooking}
              disabled={bookAppointment.isPending || !patientName.trim()}
              activeOpacity={0.85}>
              {bookAppointment.isPending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryBtnText}>Confirm booking</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.secureRow}>
            <Icon name="lock-outline" size={14} color={colors.neutral500} />
            <Text style={styles.secureText}>
              Secure payment · pending until doctor confirms
            </Text>
          </View>
        </ScrollView>
      )}

      {step === 3 && (
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Icon name="check" size={32} color={colors.statusSuccess} />
          </View>
          <Text style={styles.successTitle}>Appointment Booked</Text>
          <Text style={styles.successSub}>
            Your {consultType === 'online' ? 'online' : 'in-clinic'} appointment
            with {doctor.name} is pending confirmation.
          </Text>
          <Text style={styles.successDate}>
            {formatBookingDate(selectedDate)} · {selectedSlot}
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('ConsultHome')}
            activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Back to Doctors</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() =>
              navigation.getParent()?.getParent()?.navigate('You' as never, {
                screen: 'YouHome',
              } as never)
            }
            activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>View My Account</Text>
          </TouchableOpacity>
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
          submitBooking();
        }}
        doctor={doctor}
        consultOption={selectedOption}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
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
    color: colors.brandPrimary,
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
    color: colors.brandPrimary,
  },
  feeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginTop: spacing.sm,
  },
  trustBanner: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: `${colors.brandLight}66`,
    borderWidth: 1,
    borderColor: colors.brandLight,
  },
  trustText: {
    fontSize: 12,
    color: colors.neutral600,
    lineHeight: 18,
  },
  primaryBtn: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
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
    color: colors.brandPrimary,
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
    borderColor: colors.brandPrimary,
    backgroundColor: `${colors.brandLight}66`,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.neutral300,
  },
  radioActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandPrimary,
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
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandLight,
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
  successWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.statusSuccessBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: spacing.sm,
  },
  successSub: {
    fontSize: 14,
    color: colors.neutral500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  successDate: {
    fontSize: 13,
    color: colors.neutral500,
    marginBottom: spacing.xl,
  },
  secondaryBtn: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    alignSelf: 'stretch',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.brandPrimary,
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
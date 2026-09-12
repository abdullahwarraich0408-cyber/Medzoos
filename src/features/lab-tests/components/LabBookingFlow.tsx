import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../lib/auth/AuthContext';
import { navigateToSignIn, navigateToOrders } from '../../../lib/auth/navigation';
import {
  useBookLabTest,
  useLabTestTimeSlots,
} from '../../../lib/hooks/useApi';
import type { LabTest } from '../../../lib/mappers/labTest';
import type { LabTestsStackParamList } from '../../../navigation/types';
import { useLocationContext } from '../../../lib/location/LocationContext';
import type { DetectedLocation } from '../../../lib/location/types';
import { UseLocationButton } from '../../../components/location/UseLocationButton';
import { StripeCheckoutModal } from '../../../components/payments/StripeCheckoutModal';
import { startStripeCheckout } from '../../../lib/payments/stripeCheckout';
import { KeyboardAwareScrollView } from '../../../components/keyboard';
import { TIME_SLOTS } from '../data/mockLabTests';
import { ReadPrescriptionSection } from './ReadPrescriptionSection';
import { labTestsBrand } from '../labTestsBrand';
import { spacing, radius } from '../../../theme';

const STEPS = [
  { id: 1, label: 'Review', icon: 'flask-outline' },
  { id: 2, label: 'Details', icon: 'account-outline' },
  { id: 3, label: 'Slot', icon: 'calendar-clock' },
  { id: 4, label: 'Done', icon: 'check' },
];

type LabBookingFlowProps = {
  test: LabTest;
  onDone?: () => void;
};

export function LabBookingFlow({ test, onDone }: LabBookingFlowProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<LabTestsStackParamList>>();
  const { user, isAuthenticated } = useAuth();
  const { location: savedCity, detectedAddress } = useLocationContext();
  const { data: apiTimeSlots = [] } = useLabTestTimeSlots();
  const bookLabTest = useBookLabTest();
  const timeSlots = apiTimeSlots.length > 0 ? apiTimeSlots : TIME_SLOTS;

  const [step, setStep] = useState(1);
  const [collectionType, setCollectionType] = useState<'HOME' | 'VISIT_LAB'>(
    test.homeCollection ? 'HOME' : 'VISIT_LAB',
  );
  const [patient, setPatient] = useState({
    name: user?.name || '',
    gender: '',
    age: '',
    phone: user?.phone || '',
  });
  const [address, setAddress] = useState({
    line: detectedAddress?.street || '',
    city: detectedAddress?.city || savedCity || 'Karachi',
    phone: user?.phone || '',
  });
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [collectionDate, setCollectionDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [prescriptionUrl, setPrescriptionUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('stripe');
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const detailsValid =
    patient.name.trim() &&
    patient.phone.trim() &&
    (collectionType === 'VISIT_LAB' || address.line.trim());

  const submitBooking = async () => {
    if (!selectedSlot) return;

    setPaying(true);
    try {
      const method = collectionType === 'HOME' ? 'stripe' : paymentMethod;
      const booking = await bookLabTest.mutateAsync({
        lab_test_id: test.id,
        patient_name: patient.name.trim(),
        patient_gender: patient.gender || undefined,
        patient_age: patient.age ? Number(patient.age) : undefined,
        collection_type: collectionType,
        time_slot: selectedSlot,
        payment_method: method,
        collection_date: new Date(collectionDate).toISOString(),
        collection_address:
          collectionType === 'HOME'
            ? { ...address, phone: patient.phone.trim() }
            : undefined,
        prescription_url: prescriptionUrl || undefined,
      });

      if (method === 'stripe') {
        const bookingId =
          (booking as { booking?: { id?: string }; id?: string }).booking?.id ||
          (booking as { id?: string }).id;
        if (!bookingId) {
          throw new Error(
            'Lab booking created but missing id for Stripe payment.',
          );
        }
        const payment = await startStripeCheckout({
          purpose: 'lab',
          booking_ids: [bookingId],
        });
        setStripeUrl(payment.checkoutUrl);
        return;
      }

      setStep(4);
    } catch (error) {
      Alert.alert(
        'Booking failed',
        error instanceof Error ? error.message : 'Could not book lab test.',
      );
    } finally {
      setPaying(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      Alert.alert('Sign in required', 'Please sign in to book a lab test.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigateToSignIn(navigation) },
      ]);
      return;
    }
    await submitBooking();
  };

  const stepIndicator = useMemo(
    () => (
      <View style={styles.stepsRow}>
        {STEPS.map((s, i) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <React.Fragment key={s.id}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    done && styles.stepCircleDone,
                    active && styles.stepCircleActive,
                  ]}>
                  {done ? (
                    <Icon name="check" size={14} color={labTestsBrand.onAccent} />
                  ) : (
                    <Icon
                      name={s.icon}
                      size={14}
                      color={
                        active ? labTestsBrand.onAccent : labTestsBrand.muted
                      }
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    (active || done) && styles.stepLabelActive,
                  ]}>
                  {s.label}
                </Text>
              </View>
              {i < STEPS.length - 1 ? (
                <View
                  style={[styles.stepLine, done && styles.stepLineDone]}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
    ),
    [step],
  );

  return (
    <View style={styles.container}>
      {step < 4 ? stepIndicator : null}

      {step === 1 ? (
        <View style={styles.stepBody}>
          <Text style={styles.stepHeading}>Confirm this package</Text>
          <Text style={styles.stepHint}>
            Review preparation notes, then continue to patient details.
          </Text>

          <View style={styles.reviewCard}>
            <View style={styles.reviewRow}>
              <Icon name="flask-outline" size={16} color={labTestsBrand.accent} />
              <Text style={styles.reviewTitle} numberOfLines={2}>
                {test.name}
              </Text>
            </View>
            <Text style={styles.reviewMeta}>
              {test.lab} · {test.testsIncluded} tests · PKR{' '}
              {test.price.toLocaleString()}
            </Text>

            {test.fastingRequired ? (
              <View style={styles.noteWarn}>
                <Icon name="alert-circle-outline" size={16} color="#B45309" />
                <Text style={styles.noteWarnText}>
                  Fasting required before this test
                </Text>
              </View>
            ) : null}
            {test.preparation ? (
              <View style={styles.noteSoft}>
                <Icon
                  name="information-outline"
                  size={16}
                  color={labTestsBrand.accent}
                />
                <Text style={styles.noteSoftText}>{test.preparation}</Text>
              </View>
            ) : null}
            {test.homeCollection ? (
              <View style={styles.noteSoft}>
                <Icon
                  name="home-outline"
                  size={16}
                  color={labTestsBrand.accent}
                />
                <Text style={styles.noteSoftText}>
                  Free home sample collection is available for this package.
                </Text>
              </View>
            ) : null}
          </View>

          <PrimaryButton label="Continue to details" onPress={() => setStep(2)} />
        </View>
      ) : null}

      {step === 2 ? (
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.stepBody}>
          <Text style={styles.stepHeading}>Patient & collection</Text>
          <Text style={styles.stepHint}>
            Who is this test for, and how should we collect the sample?
          </Text>

          <Field label="Patient name">
            <TextInput
              style={styles.input}
              value={patient.name}
              onChangeText={v => setPatient(p => ({ ...p, name: v }))}
              placeholder="Full name"
              placeholderTextColor={labTestsBrand.muted}
            />
          </Field>
          <View style={styles.row}>
            <View style={styles.half}>
              <Field label="Gender">
                <TextInput
                  style={styles.input}
                  value={patient.gender}
                  onChangeText={v => setPatient(p => ({ ...p, gender: v }))}
                  placeholder="Male / Female"
                  placeholderTextColor={labTestsBrand.muted}
                />
              </Field>
            </View>
            <View style={styles.half}>
              <Field label="Age">
                <TextInput
                  style={styles.input}
                  value={patient.age}
                  onChangeText={v => setPatient(p => ({ ...p, age: v }))}
                  placeholder="Age"
                  keyboardType="number-pad"
                  placeholderTextColor={labTestsBrand.muted}
                />
              </Field>
            </View>
          </View>
          <Field label="Phone">
            <TextInput
              style={styles.input}
              value={patient.phone}
              onChangeText={v => setPatient(p => ({ ...p, phone: v }))}
              placeholder="03XX XXXXXXX"
              keyboardType="phone-pad"
              placeholderTextColor={labTestsBrand.muted}
            />
          </Field>

          <Text style={styles.sectionTitle}>Collection method</Text>
          <View style={styles.collectionRow}>
            {test.homeCollection ? (
              <TouchableOpacity
                style={[
                  styles.collectionBtn,
                  collectionType === 'HOME' && styles.collectionBtnActive,
                ]}
                onPress={() => setCollectionType('HOME')}
                activeOpacity={0.85}>
                <View
                  style={[
                    styles.collectionIcon,
                    collectionType === 'HOME' && styles.collectionIconActive,
                  ]}>
                  <Icon
                    name="home-outline"
                    size={18}
                    color={
                      collectionType === 'HOME'
                        ? labTestsBrand.onAccent
                        : labTestsBrand.accent
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.collectionText,
                    collectionType === 'HOME' && styles.collectionTextActive,
                  ]}>
                  Home
                </Text>
                <Text style={styles.collectionSub}>Phlebotomist visit</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[
                styles.collectionBtn,
                collectionType === 'VISIT_LAB' && styles.collectionBtnActive,
              ]}
              onPress={() => setCollectionType('VISIT_LAB')}
              activeOpacity={0.85}>
              <View
                style={[
                  styles.collectionIcon,
                  collectionType === 'VISIT_LAB' && styles.collectionIconActive,
                ]}>
                <Icon
                  name="hospital-building"
                  size={18}
                  color={
                    collectionType === 'VISIT_LAB'
                      ? labTestsBrand.onAccent
                      : labTestsBrand.accent
                  }
                />
              </View>
              <Text
                style={[
                  styles.collectionText,
                  collectionType === 'VISIT_LAB' && styles.collectionTextActive,
                ]}>
                Visit lab
              </Text>
              <Text style={styles.collectionSub}>At partner center</Text>
            </TouchableOpacity>
          </View>

          {collectionType === 'HOME' ? (
            <>
              <Field label="Street address">
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={address.line}
                  onChangeText={v => setAddress(a => ({ ...a, line: v }))}
                  placeholder="House / street address"
                  multiline
                  placeholderTextColor={labTestsBrand.muted}
                />
              </Field>
              <Field label="City">
                <TextInput
                  style={styles.input}
                  value={address.city}
                  onChangeText={v => setAddress(a => ({ ...a, city: v }))}
                  placeholder="City"
                  placeholderTextColor={labTestsBrand.muted}
                />
              </Field>
              <UseLocationButton
                onLocationDetected={(loc: DetectedLocation) =>
                  setAddress(a => ({
                    ...a,
                    line: loc.street || a.line,
                    city: loc.city || a.city,
                  }))
                }
                style={styles.locationBtn}
              />
            </>
          ) : null}

          <ReadPrescriptionSection
            prescriptionUrl={prescriptionUrl}
            onPrescriptionUrlChange={setPrescriptionUrl}
            onSignInRequired={() => navigateToSignIn(navigation)}
          />

          <View style={styles.navRow}>
            <TouchableOpacity
              style={styles.backStepBtn}
              onPress={() => setStep(1)}
              activeOpacity={0.85}>
              <Icon name="arrow-left" size={16} color={labTestsBrand.accent} />
              <Text style={styles.backStepText}>Back</Text>
            </TouchableOpacity>
            <View style={styles.navPrimary}>
              <PrimaryButton
                label="Continue to slot"
                onPress={() => setStep(3)}
                disabled={!detailsValid}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
      ) : null}

      {step === 3 ? (
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.stepBody}>
          <Text style={styles.stepHeading}>Pick date & time</Text>
          <Text style={styles.stepHint}>
            Choose when the sample should be collected, then confirm payment.
          </Text>

          <Field label="Collection date">
            <TextInput
              style={styles.input}
              value={collectionDate}
              onChangeText={setCollectionDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={labTestsBrand.muted}
            />
          </Field>

          <Text style={styles.sectionTitle}>Available slots</Text>
          <View style={styles.slotsGrid}>
            {timeSlots.map(slot => {
              const active = selectedSlot === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotBtn, active && styles.slotBtnActive]}
                  onPress={() => setSelectedSlot(slot)}
                  activeOpacity={0.85}>
                  <Icon
                    name="clock-outline"
                    size={14}
                    color={
                      active ? labTestsBrand.onAccent : labTestsBrand.accent
                    }
                  />
                  <Text
                    style={[styles.slotText, active && styles.slotTextActive]}
                    numberOfLines={2}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryHeading}>Booking summary</Text>
            <SummaryRow
              label={test.name}
              value={`PKR ${test.price.toLocaleString()}`}
              bold
            />
            <SummaryRow
              label="Collection"
              value={collectionType === 'HOME' ? 'Home visit' : 'Lab visit'}
            />
            <SummaryRow label="Patient" value={patient.name || '—'} />
            {selectedSlot ? (
              <SummaryRow label="Slot" value={selectedSlot} />
            ) : null}
          </View>

          {collectionType === 'VISIT_LAB' ? (
            <View style={styles.paymentBlock}>
              <Text style={styles.sectionTitle}>Payment method</Text>
              {(
                [
                  {
                    id: 'stripe' as const,
                    label: 'Pay online',
                    sub: 'Secure Stripe checkout',
                    icon: 'credit-card-outline',
                  },
                  {
                    id: 'cod' as const,
                    label: 'Pay at lab',
                    sub: 'Cash on visit',
                    icon: 'cash',
                  },
                ] as const
              ).map(method => {
                const active = paymentMethod === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentRow,
                      active && styles.paymentRowActive,
                    ]}
                    onPress={() => setPaymentMethod(method.id)}
                    activeOpacity={0.85}>
                    <View style={styles.paymentLeft}>
                      <View
                        style={[
                          styles.paymentIcon,
                          active && styles.paymentIconActive,
                        ]}>
                        <Icon
                          name={method.icon}
                          size={16}
                          color={
                            active
                              ? labTestsBrand.onAccent
                              : labTestsBrand.accent
                          }
                        />
                      </View>
                      <View>
                        <Text style={styles.paymentLabel}>{method.label}</Text>
                        <Text style={styles.paymentSub}>{method.sub}</Text>
                      </View>
                    </View>
                    <Icon
                      name={active ? 'radiobox-marked' : 'radiobox-blank'}
                      size={22}
                      color={labTestsBrand.accent}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.secureRow}>
              <Icon
                name="shield-check-outline"
                size={16}
                color={labTestsBrand.accent}
              />
              <Text style={styles.secureText}>
                Home collection uses secure online Stripe payment.
              </Text>
            </View>
          )}

          <View style={styles.navRow}>
            <TouchableOpacity
              style={styles.backStepBtn}
              onPress={() => setStep(2)}
              activeOpacity={0.85}>
              <Icon name="arrow-left" size={16} color={labTestsBrand.accent} />
              <Text style={styles.backStepText}>Back</Text>
            </TouchableOpacity>
            <View style={styles.navPrimary}>
              <PrimaryButton
                label={
                  collectionType === 'HOME' || paymentMethod === 'stripe'
                    ? 'Confirm & pay'
                    : 'Confirm booking'
                }
                onPress={handleConfirmBooking}
                disabled={!selectedSlot || bookLabTest.isPending || paying}
                loading={bookLabTest.isPending || paying}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
      ) : null}

      {step === 4 ? (
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Icon name="check-bold" size={28} color={labTestsBrand.success} />
          </View>
          <Text style={styles.successTitle}>Booking confirmed</Text>
          <Text style={styles.successSub}>
            Track collection in Orders. Your report will appear here when the
            lab uploads it.
          </Text>

          <View style={styles.successMeta}>
            <SummaryRow label="Test" value={test.name} bold />
            <SummaryRow
              label="Collection"
              value={collectionType === 'HOME' ? 'Home visit' : 'Lab visit'}
            />
            {selectedSlot ? (
              <SummaryRow label="Slot" value={selectedSlot} />
            ) : null}
          </View>

          <PrimaryButton
            label="View orders"
            onPress={() => {
              onDone?.();
              navigateToOrders(navigation);
            }}
          />
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {
              onDone?.();
              navigation.navigate('LabReports');
            }}
            activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>My reports</Text>
          </TouchableOpacity>
        </View>
      ) : null}

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
            'Booking was created but payment was not completed.',
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

function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, disabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}>
      {loading ? (
        <ActivityIndicator color={labTestsBrand.onAccent} />
      ) : (
        <>
          <Text style={styles.primaryBtnText}>{label}</Text>
          <Icon name="arrow-right" size={16} color={labTestsBrand.onAccent} />
        </>
      )}
    </TouchableOpacity>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel} numberOfLines={2}>
        {label}
      </Text>
      <Text
        style={[styles.summaryValue, bold && styles.summaryValueBold]}
        numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: 2,
  },
  stepItem: { alignItems: 'center', width: 58 },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: labTestsBrand.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: labTestsBrand.page,
  },
  stepCircleDone: {
    backgroundColor: labTestsBrand.accent,
    borderColor: labTestsBrand.accent,
  },
  stepCircleActive: {
    borderColor: labTestsBrand.accent,
    backgroundColor: labTestsBrand.accent,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: labTestsBrand.muted,
    marginTop: 5,
  },
  stepLabelActive: { color: labTestsBrand.accent },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: labTestsBrand.mist,
    marginTop: 16,
    minWidth: 10,
  },
  stepLineDone: { backgroundColor: labTestsBrand.accent },

  stepBody: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  stepHeading: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
    color: labTestsBrand.ink,
  },
  stepHint: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: labTestsBrand.muted,
    marginBottom: 4,
  },

  reviewCard: {
    backgroundColor: labTestsBrand.page,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    padding: spacing.md,
    gap: 8,
    marginBottom: spacing.sm,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  reviewTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: labTestsBrand.ink,
    lineHeight: 20,
  },
  reviewMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: labTestsBrand.muted,
  },
  noteWarn: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 10,
  },
  noteWarnText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#9A3412',
    lineHeight: 17,
  },
  noteSoft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: labTestsBrand.soft,
    borderRadius: 12,
    padding: 10,
  },
  noteSoftText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: labTestsBrand.ink,
    lineHeight: 17,
  },

  field: { marginBottom: spacing.sm },
  locationBtn: { marginBottom: spacing.sm },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: labTestsBrand.ink,
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    fontWeight: '500',
    color: labTestsBrand.ink,
    backgroundColor: labTestsBrand.page,
  },
  textArea: {
    minHeight: 88,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: labTestsBrand.ink,
    marginTop: 4,
    marginBottom: 8,
  },
  collectionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.sm,
  },
  collectionBtn: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 6,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    backgroundColor: labTestsBrand.page,
    minWidth: 0,
  },
  collectionBtnActive: {
    borderColor: labTestsBrand.accent,
    backgroundColor: labTestsBrand.soft,
  },
  collectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: labTestsBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: labTestsBrand.border,
  },
  collectionIconActive: {
    backgroundColor: labTestsBrand.accent,
    borderColor: labTestsBrand.accent,
  },
  collectionText: {
    fontSize: 13,
    fontWeight: '800',
    color: labTestsBrand.ink,
  },
  collectionTextActive: {
    color: labTestsBrand.accent,
  },
  collectionSub: {
    fontSize: 11,
    fontWeight: '500',
    color: labTestsBrand.muted,
  },

  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.sm,
  },
  slotBtn: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    backgroundColor: labTestsBrand.page,
  },
  slotBtnActive: {
    borderColor: labTestsBrand.accent,
    backgroundColor: labTestsBrand.accent,
  },
  slotText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: labTestsBrand.ink,
  },
  slotTextActive: { color: labTestsBrand.onAccent },

  summary: {
    padding: spacing.md,
    backgroundColor: labTestsBrand.page,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    marginBottom: spacing.sm,
    gap: 6,
  },
  summaryHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: labTestsBrand.accent,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: labTestsBrand.muted,
  },
  summaryValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: labTestsBrand.ink,
    textAlign: 'right',
  },
  summaryValueBold: {
    fontWeight: '800',
    color: labTestsBrand.accent,
  },

  paymentBlock: {
    marginBottom: spacing.sm,
    gap: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    borderRadius: 16,
    padding: 12,
    backgroundColor: labTestsBrand.page,
  },
  paymentRowActive: {
    borderColor: labTestsBrand.accent,
    backgroundColor: labTestsBrand.soft,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  paymentIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: labTestsBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: labTestsBrand.border,
  },
  paymentIconActive: {
    backgroundColor: labTestsBrand.accent,
    borderColor: labTestsBrand.accent,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: labTestsBrand.ink,
  },
  paymentSub: {
    fontSize: 11,
    fontWeight: '500',
    color: labTestsBrand.muted,
    marginTop: 1,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: labTestsBrand.soft,
    borderRadius: 14,
    padding: 12,
    marginBottom: spacing.sm,
  },
  secureText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: labTestsBrand.ink,
    lineHeight: 17,
  },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  backStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    backgroundColor: labTestsBrand.page,
  },
  backStepText: {
    fontSize: 13,
    fontWeight: '700',
    color: labTestsBrand.accent,
  },
  navPrimary: { flex: 1 },

  primaryBtn: {
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: labTestsBrand.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.lg,
  },
  btnDisabled: { opacity: 0.45 },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: labTestsBrand.onAccent,
  },
  secondaryBtn: {
    minHeight: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: labTestsBrand.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: labTestsBrand.card,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: labTestsBrand.accent,
  },

  successWrap: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  successIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: labTestsBrand.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: labTestsBrand.ink,
  },
  successSub: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    color: labTestsBrand.muted,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  successMeta: {
    alignSelf: 'stretch',
    padding: spacing.md,
    backgroundColor: labTestsBrand.page,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    marginBottom: spacing.sm,
    gap: 6,
  },
});

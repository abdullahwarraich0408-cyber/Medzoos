import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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
import { TIME_SLOTS } from '../data/mockLabTests';
import { ReadPrescriptionSection } from './ReadPrescriptionSection';

const STEPS = [
  { id: 1, label: 'Test', icon: 'flask' },
  { id: 2, label: 'Details', icon: 'map-marker' },
  { id: 3, label: 'Slot', icon: 'clock-outline' },
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

  const detailsValid =
    patient.name.trim() &&
    patient.phone.trim() &&
    (collectionType === 'VISIT_LAB' || address.line.trim());

  const submitBooking = async () => {
    if (!selectedSlot) return;

    try {
      await bookLabTest.mutateAsync({
        lab_test_id: test.id,
        patient_name: patient.name.trim(),
        patient_gender: patient.gender || undefined,
        patient_age: patient.age ? Number(patient.age) : undefined,
        collection_type: collectionType,
        time_slot: selectedSlot,
        payment_method: 'cod',
        collection_date: new Date(collectionDate).toISOString(),
        collection_address:
          collectionType === 'HOME'
            ? { ...address, phone: patient.phone.trim() }
            : undefined,
        prescription_url: prescriptionUrl || undefined,
      });
      setStep(4);
    } catch (error) {
      Alert.alert(
        'Booking failed',
        error instanceof Error ? error.message : 'Could not book lab test.',
      );
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
                    <Icon name="check" size={14} color={colors.white} />
                  ) : (
                    <Icon
                      name={s.icon}
                      size={14}
                      color={active ? colors.brandPrimary : colors.neutral500}
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
              {i < STEPS.length - 1 && (
                <View
                  style={[styles.stepLine, done && styles.stepLineDone]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    ),
    [step],
  );

  return (
    <View style={styles.container}>
      {step < 4 && stepIndicator}

      {step === 1 && (
        <View>
          <View style={styles.testSummary}>
            <Text style={styles.testName}>{test.name}</Text>
            <Text style={styles.testMeta}>
              {test.lab} · {test.testsIncluded} tests
            </Text>
            {test.fastingRequired && (
              <Text style={styles.warning}>Fasting required before this test</Text>
            )}
            {test.preparation && (
              <Text style={styles.prep}>{test.preparation}</Text>
            )}
            {test.description && (
              <Text style={styles.desc}>{test.description}</Text>
            )}
            <Text style={styles.price}>PKR {test.price.toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setStep(2)}
            activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Field label="Patient name">
            <TextInput
              style={styles.input}
              value={patient.name}
              onChangeText={v => setPatient(p => ({ ...p, name: v }))}
              placeholder="Full name"
              placeholderTextColor={colors.neutral500}
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
                  placeholderTextColor={colors.neutral500}
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
                  placeholderTextColor={colors.neutral500}
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
              placeholderTextColor={colors.neutral500}
            />
          </Field>

          <View style={styles.collectionRow}>
            {test.homeCollection && (
              <TouchableOpacity
                style={[
                  styles.collectionBtn,
                  collectionType === 'HOME' && styles.collectionBtnActive,
                ]}
                onPress={() => setCollectionType('HOME')}
                activeOpacity={0.85}>
                <Icon name="home" size={16} color={colors.brandPrimary} />
                <Text style={styles.collectionText}>Home Collection</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.collectionBtn,
                collectionType === 'VISIT_LAB' && styles.collectionBtnActive,
              ]}
              onPress={() => setCollectionType('VISIT_LAB')}
              activeOpacity={0.85}>
              <Icon name="hospital-building" size={16} color={colors.brandPrimary} />
              <Text style={styles.collectionText}>Visit Lab</Text>
            </TouchableOpacity>
          </View>

          {collectionType === 'HOME' && (
            <>
              <Field label="Street address">
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={address.line}
                  onChangeText={v => setAddress(a => ({ ...a, line: v }))}
                  placeholder="House / street address"
                  multiline
                  placeholderTextColor={colors.neutral500}
                />
              </Field>
              <Field label="City">
                <TextInput
                  style={styles.input}
                  value={address.city}
                  onChangeText={v => setAddress(a => ({ ...a, city: v }))}
                  placeholder="City"
                  placeholderTextColor={colors.neutral500}
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
          )}

          <ReadPrescriptionSection
            prescriptionUrl={prescriptionUrl}
            onPrescriptionUrlChange={setPrescriptionUrl}
            onSignInRequired={() => navigateToSignIn(navigation)}
          />

          <TouchableOpacity
            style={[styles.primaryBtn, !detailsValid && styles.btnDisabled]}
            onPress={() => setStep(3)}
            disabled={!detailsValid}
            activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Continue to Slot</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 3 && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Field label="Collection date">
            <TextInput
              style={styles.input}
              value={collectionDate}
              onChangeText={setCollectionDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.neutral500}
            />
          </Field>

          <Text style={styles.sectionTitle}>Select time slot</Text>
          <View style={styles.slotsGrid}>
            {timeSlots.map(slot => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.slotBtn,
                  selectedSlot === slot && styles.slotBtnActive,
                ]}
                onPress={() => setSelectedSlot(slot)}
                activeOpacity={0.85}>
                <Text
                  style={[
                    styles.slotText,
                    selectedSlot === slot && styles.slotTextActive,
                  ]}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.summary}>
            <SummaryRow label={test.name} value={`PKR ${test.price.toLocaleString()}`} bold />
            <SummaryRow
              label="Collection"
              value={collectionType === 'HOME' ? 'Home' : 'Lab visit'}
            />
            <SummaryRow label="Patient" value={patient.name} />
          </View>

          <View style={styles.secureRow}>
            <Icon name="lock-outline" size={14} color={colors.neutral500} />
            <Text style={styles.secureText}>
              Pay on collection — no online payment required.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (!selectedSlot || bookLabTest.isPending) && styles.btnDisabled,
            ]}
            onPress={handleConfirmBooking}
            disabled={!selectedSlot || bookLabTest.isPending}
            activeOpacity={0.85}>
            {bookLabTest.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryBtnText}>Confirm Booking</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 4 && (
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Icon name="check" size={32} color={colors.statusSuccess} />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed</Text>
          <Text style={styles.successSub}>
            Track your order in Orders. Reports will appear when ready.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              onDone?.();
              navigateToOrders(navigation);
            }}
            activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>View Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {
              onDone?.();
              navigation.navigate('LabReports');
            }}
            activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>My Reports</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
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
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.summaryValueBold]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  stepItem: { alignItems: 'center', width: 56 },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: healthOs.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  stepCircleDone: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  stepCircleActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandLight,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral500,
    marginTop: 4,
  },
  stepLabelActive: { color: colors.brandPrimary },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.neutral200,
    marginTop: 18,
    minWidth: 12,
  },
  stepLineDone: { backgroundColor: colors.brandPrimary },
  testSummary: {
    padding: spacing.lg,
    backgroundColor: colors.brandLight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.brandLight,
    marginBottom: spacing.lg,
  },
  testName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  testMeta: {
    fontSize: 13,
    color: colors.neutral500,
    marginTop: 4,
  },
  warning: {
    fontSize: 12,
    color: colors.statusWarning,
    marginTop: spacing.sm,
  },
  prep: { fontSize: 12, color: colors.neutral600, marginTop: spacing.sm },
  desc: { fontSize: 13, color: colors.neutral600, marginTop: spacing.sm, lineHeight: 18 },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.brandPrimary,
    marginTop: spacing.md,
  },
  field: { marginBottom: spacing.md },
  locationBtn: { marginBottom: spacing.md },
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
  textArea: { height: 88, paddingTop: spacing.md, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  collectionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  collectionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    backgroundColor: colors.white,
  },
  collectionBtnActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandLight,
  },
  collectionText: { fontSize: 13, fontWeight: '600', color: colors.inkHeadline },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: spacing.md,
  },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  slotBtn: {
    width: '48%',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  slotBtnActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandLight,
  },
  slotText: { fontSize: 13, fontWeight: '600', color: colors.neutral800 },
  slotTextActive: { color: colors.brandPrimary },
  summary: {
    padding: spacing.md,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: { fontSize: 13, color: colors.neutral600, flex: 1 },
  summaryValue: { fontSize: 13, color: colors.neutral600 },
  summaryValueBold: { fontWeight: '700', color: colors.inkHeadline },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  secureText: { fontSize: 12, color: colors.neutral500 },
  primaryBtn: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
  secondaryBtn: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: colors.brandPrimary },
  successWrap: { alignItems: 'center', paddingVertical: spacing.xxxl },
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
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
});
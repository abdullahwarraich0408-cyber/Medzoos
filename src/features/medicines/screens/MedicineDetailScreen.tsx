import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import type { HealthStackParamList } from '../../../navigation/types';
import {
  getMedicineById,
  getPrescriptionById,
  getSourceLabel,
  getRefillLabel,
} from '../data/medicineModel';
import { DEMO_PATIENT_MEDICINES, DEMO_PRESCRIPTIONS } from '../data/medicineModel';
import { colors, spacing, radius, TAB_BAR_CLEARANCE, cardStyles } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';
import { calmLayout } from '../../../theme/calmLayout';

type Route = RouteProp<HealthStackParamList, 'MedicineDetail'>;
type Nav = NativeStackNavigationProp<HealthStackParamList>;

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function MedicineDetailContent() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const medicine = useMemo(
    () => getMedicineById(DEMO_PATIENT_MEDICINES, route.params.medicineId),
    [route.params.medicineId],
  );

  const linkedPrescription = useMemo(() => {
    if (!medicine?.prescriptionId) return null;
    return getPrescriptionById(DEMO_PRESCRIPTIONS, medicine.prescriptionId);
  }, [medicine?.prescriptionId]);

  if (!medicine) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Medicine not found.</Text>
      </View>
    );
  }

  const needsRefill = getRefillLabel(medicine) !== 'No refill needed';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) + spacing.lg },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Icon name="pill" size={28} color={colors.brandPrimary} />
        </View>
        <Text style={styles.heroTitle}>{medicine.medicineName}</Text>
        <Text style={styles.heroGeneric}>{medicine.genericName}</Text>
        <Text style={styles.heroSource}>{getSourceLabel(medicine)}</Text>
      </View>

      <View style={styles.card}>
        <DetailRow label="Strength" value={medicine.strength} />
        <DetailRow label="Dosage" value={medicine.dosage} />
        <DetailRow label="Timing" value={medicine.timing} />
        <DetailRow label="Frequency" value={medicine.frequency} />
        <DetailRow label="Duration" value={medicine.duration} />
        <DetailRow label="Instructions" value={medicine.instructions} />
        <DetailRow label="Refill status" value={getRefillLabel(medicine)} />
        <DetailRow
          label="Reminders"
          value={medicine.reminderEnabled ? `Next at ${medicine.nextReminderTime}` : 'Off'}
        />
      </View>

      {linkedPrescription ? (
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() =>
            navigation.navigate('PrescriptionDetail', {
              prescriptionId: linkedPrescription.prescriptionId,
            })
          }>
          <Icon name="file-document-outline" size={20} color={colors.brandPrimary} />
          <View style={styles.linkBody}>
            <Text style={styles.linkTitle}>Linked prescription</Text>
            <Text style={styles.linkSub}>{linkedPrescription.title}</Text>
          </View>
          <Icon name="chevron-right" size={18} color={colors.neutral500} />
        </TouchableOpacity>
      ) : null}

      {medicine.doctorId ? (
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() =>
            navigation.navigate('DoctorRecordsDetail', { doctorId: medicine.doctorId! })
          }>
          <Icon name="stethoscope" size={20} color={colors.brandPrimary} />
          <View style={styles.linkBody}>
            <Text style={styles.linkTitle}>Doctor records</Text>
            <Text style={styles.linkSub}>{medicine.doctorName}</Text>
          </View>
          <Icon name="chevron-right" size={18} color={colors.neutral500} />
        </TouchableOpacity>
      ) : null}

      <View style={styles.actions}>
        {needsRefill ? (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.primaryBtnText}>Refill medicine</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => Alert.alert('Reminders', 'Reminder settings coming soon.')}>
          <Text style={styles.secondaryBtnText}>Reminder settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => Alert.alert('Order history', 'No previous orders yet.')}>
          <Text style={styles.secondaryBtnText}>Order history</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export function MedicineDetailScreen() {
  const route = useRoute<Route>();
  const medicine = getMedicineById(DEMO_PATIENT_MEDICINES, route.params.medicineId);

  return (
    <ScreenLayout
      headerMode="stack"
      title={medicine?.medicineName || 'Medicine'}
      showSearch={false}
      showCart>
      <MedicineDetailContent />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: {
    padding: calmLayout.screenPadding,
    gap: calmLayout.sectionGap,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  heroTitle: {
    ...healthOsTypography.greeting,
    fontSize: 22,
    textAlign: 'center',
  },
  heroGeneric: {
    fontSize: 14,
    color: colors.neutral500,
  },
  heroSource: {
    fontSize: 13,
    color: colors.brandPrimary,
    fontWeight: '600',
  },
  card: {
    ...cardStyles.grouped,
    padding: spacing.lg,
    gap: spacing.md,
  },
  detailRow: { gap: 2 },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral500,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 14,
    color: colors.ink900,
    lineHeight: 20,
  },
  linkCard: {
    ...cardStyles.premiumSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  linkBody: { flex: 1, gap: 2 },
  linkTitle: {
    ...healthOsTypography.messageTitle,
    fontSize: 14,
  },
  linkSub: {
    fontSize: 12,
    color: colors.neutral500,
  },
  actions: { gap: spacing.sm },
  primaryBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.buttonEnd,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
  },
  emptyText: { fontSize: 15, color: colors.neutral500 },
});

import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import type { HealthStackParamList } from '../../../navigation/types';
import { ActiveMedicineRow } from '../components/ActiveMedicineRow';
import {
  getPrescriptionById,
  getMedicinesForPrescription,
  getVerificationLabel,
  DEMO_PATIENT_MEDICINES,
  DEMO_PRESCRIPTIONS,
} from '../data/medicineModel';
import { colors, spacing, radius, TAB_BAR_CLEARANCE, cardStyles } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';
import { calmLayout } from '../../../theme/calmLayout';

type Route = RouteProp<HealthStackParamList, 'PrescriptionDetail'>;
type Nav = NativeStackNavigationProp<HealthStackParamList>;

function PrescriptionDetailContent() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const prescription = useMemo(
    () => getPrescriptionById(DEMO_PRESCRIPTIONS, route.params.prescriptionId),
    [route.params.prescriptionId],
  );

  const extractedMedicines = useMemo(() => {
    if (!prescription) return [];
    return getMedicinesForPrescription(DEMO_PATIENT_MEDICINES, prescription);
  }, [prescription]);

  if (!prescription) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Prescription not found.</Text>
      </View>
    );
  }

  const statusLabel = getVerificationLabel(prescription.verificationStatus);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) + spacing.lg },
      ]}
      showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        style={styles.previewCard}
        onPress={() => {
          if (prescription.fileUrl) {
            Linking.openURL(prescription.fileUrl).catch(() => {
              Alert.alert('Error', 'Could not open prescription file.');
            });
          } else {
            Alert.alert('Prescription', 'Image preview not available yet.');
          }
        }}>
        <Icon name="file-image-outline" size={40} color={colors.brandPrimary} />
        <Text style={styles.previewText}>View prescription image or PDF</Text>
      </TouchableOpacity>

      <View style={styles.metaCard}>
        {prescription.doctorName ? (
          <Text style={styles.doctor}>{prescription.doctorName}</Text>
        ) : null}
        <Text style={styles.date}>{prescription.date}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      </View>

      {extractedMedicines.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medicines from prescription</Text>
          <View style={styles.listCard}>
            {extractedMedicines.map((medicine, index) => (
              <React.Fragment key={medicine.medicineId}>
                {index > 0 ? <View style={cardStyles.rowDivider} /> : null}
                <ActiveMedicineRow
                  medicine={medicine}
                  onPress={() =>
                    navigation.navigate('MedicineDetail', {
                      medicineId: medicine.medicineId,
                    })
                  }
                />
              </React.Fragment>
            ))}
          </View>
        </View>
      ) : null}

      {prescription.doctorId ? (
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() =>
            navigation.navigate('DoctorRecordsDetail', {
              doctorId: prescription.doctorId!,
            })
          }>
          <Icon name="stethoscope" size={20} color={colors.brandPrimary} />
          <Text style={styles.linkText}>View doctor records</Text>
          <Icon name="chevron-right" size={18} color={colors.neutral500} />
        </TouchableOpacity>
      ) : null}

      {prescription.verificationStatus === 'verified' ? (
        <TouchableOpacity
          style={styles.orderBtn}
          onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.orderBtnText}>Order medicines</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

export function PrescriptionDetailScreen() {
  const route = useRoute<Route>();
  const prescription = getPrescriptionById(DEMO_PRESCRIPTIONS, route.params.prescriptionId);

  return (
    <ScreenLayout
      headerMode="stack"
      title={prescription?.title || 'Prescription'}
      showSearch={false}
      showCart>
      <PrescriptionDetailContent />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: {
    padding: calmLayout.screenPadding,
    gap: calmLayout.sectionGap,
  },
  previewCard: {
    ...cardStyles.premiumSoft,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.sm,
  },
  previewText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  metaCard: {
    ...cardStyles.grouped,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  doctor: {
    ...healthOsTypography.messageTitle,
    fontSize: 16,
  },
  date: {
    fontSize: 13,
    color: colors.neutral500,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.brandLight,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brandPrimary,
  },
  section: { gap: spacing.sm },
  sectionTitle: {
    ...healthOsTypography.sectionTitle,
    fontSize: 15,
  },
  listCard: {
    ...cardStyles.grouped,
  },
  linkCard: {
    ...cardStyles.premiumSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink900,
  },
  orderBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
  },
  orderBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
  },
  emptyText: { fontSize: 15, color: colors.neutral500 },
});

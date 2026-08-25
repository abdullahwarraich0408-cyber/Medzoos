import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
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
  getPrescriptionSourceLabel,
} from '../data/medicineModel';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';

type Route = RouteProp<HealthStackParamList, 'PrescriptionDetail'>;
type Nav = NativeStackNavigationProp<HealthStackParamList>;

function PrescriptionDetailContent() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const prescription = useMemo(
    () => getPrescriptionById([], route.params.prescriptionId),
    [route.params.prescriptionId],
  );

  const extractedMedicines = useMemo(() => {
    if (!prescription) return [];
    return getMedicinesForPrescription([], prescription);
  }, [prescription]);

  if (!prescription) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Prescription not found.</Text>
      </View>
    );
  }

  const statusLabel = getPrescriptionSourceLabel(prescription);
  const pending = prescription.uploadedByUser;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom:
            Math.max(insets.bottom, TAB_BAR_CLEARANCE) + spacing.lg,
        },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.meta}>
        {prescription.doctorName ? (
          <Text style={styles.doctor}>{prescription.doctorName}</Text>
        ) : null}
        <Text style={styles.date}>{prescription.date}</Text>
        <View style={[styles.statusBadge, pending && styles.statusPending]}>
          <Text
            style={[styles.statusText, pending && styles.statusTextPending]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.previewRow, pressed && styles.pressed]}
        onPress={() => {
          if (prescription.fileUrl) {
            Linking.openURL(prescription.fileUrl).catch(() => {
              Alert.alert('Error', 'Could not open prescription file.');
            });
          } else {
            Alert.alert('Prescription', 'Image preview not available yet.');
          }
        }}>
        <Icon name="file-image-outline" size={20} color={colors.primary700} />
        <Text style={styles.previewText}>View prescription file</Text>
        <Icon name="chevron-right" size={18} color={colors.textMuted} />
      </Pressable>

      {extractedMedicines.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medicines</Text>
          <View style={styles.list}>
            {extractedMedicines.map(medicine => (
              <ActiveMedicineRow
                key={medicine.medicineId}
                medicine={medicine}
                onPress={() =>
                  navigation.navigate('MedicineDetail', {
                    medicineId: medicine.medicineId,
                  })
                }
              />
            ))}
          </View>
        </View>
      ) : null}

      {prescription.doctorId ? (
        <Pressable
          style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
          onPress={() =>
            navigation.navigate('DoctorRecordsDetail', {
              doctorId: prescription.doctorId!,
            })
          }>
          <Icon name="stethoscope" size={18} color={colors.primary700} />
          <Text style={styles.linkText}>Doctor records</Text>
          <Icon name="chevron-right" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}

      {prescription.uploadedByUser ? (
        <Text style={styles.hint}>
          This prescription was uploaded by you. It is not issued by a Medzoos doctor.
        </Text>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.orderBtn,
            pressed && styles.orderPressed,
          ]}
          onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.orderBtnText}>Order medicines</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

export function PrescriptionDetailScreen() {
  const route = useRoute<Route>();
  const prescription = getPrescriptionById([], route.params.prescriptionId);

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
    gap: 20,
  },
  meta: { gap: 6 },
  doctor: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary900,
    letterSpacing: -0.2,
  },
  date: {
    fontSize: 13,
    color: colors.textMuted,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.successBg,
  },
  statusPending: {
    backgroundColor: colors.warningBg,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.successText,
  },
  statusTextPending: {
    color: '#9A6B12',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  previewText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  section: { gap: spacing.md },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  list: { gap: spacing.sm },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pressed: { backgroundColor: colors.primary100 },
  orderBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.primary700,
  },
  orderPressed: { opacity: 0.9 },
  orderBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 15, color: colors.textMuted },
});

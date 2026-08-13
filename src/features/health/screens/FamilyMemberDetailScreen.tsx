import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import { MemberDetailSections } from '../components/family/MemberDetailSections';
import { VitalsTrendSection } from '../components/family/VitalsTrendSection';
import {
  ExtractedMedicinesBlock,
  SavedMedicinesList,
} from '../components/family/MedicineListCard';
import { PrimaryAction } from '../../../design-system';
import {
  useFamilyMember,
  useAddMemberVital,
  useAddMemberPrescription,
  useDeleteMemberPrescription,
} from '../../../lib/hooks/useApi';
import {
  pickPrescriptionImage,
  uploadPrescriptionFile,
} from '../../../lib/familyVault/uploadPrescription';
import { VITAL_TYPES, formatVaultDate } from '../lib/familyVaultConstants';
import { navigateToTabScreen } from '../../../lib/auth/navigation';
import type { HealthStackParamList } from '../../../navigation/types';
import { calmLayout } from '../../../theme/calmLayout';

type Nav = NativeStackNavigationProp<HealthStackParamList, 'FamilyMemberDetail'>;
type Route = RouteProp<HealthStackParamList, 'FamilyMemberDetail'>;

type DetailPanel = 'medicines' | 'reports' | 'appointments' | 'records' | null;

function MemberDetailContent() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const memberId = route.params.memberId;

  const { data: member, isLoading, refetch, isFetching } = useFamilyMember(memberId);
  const addVital = useAddMemberVital();
  const addPrescription = useAddMemberPrescription();
  const deletePrescription = useDeleteMemberPrescription();

  const [panel, setPanel] = useState<DetailPanel>(null);
  const [vitalType, setVitalType] = useState('blood_pressure');
  const [vitalValue, setVitalValue] = useState('');
  const [uploading, setUploading] = useState(false);

  const medicineCount = member?.medicines?.length ?? 0;
  const reportCount = member?.prescriptions?.length ?? 0;

  const handleUploadPrescription = async () => {
    try {
      const picked = await pickPrescriptionImage();
      if (!picked) return;
      setUploading(true);
      const fileUrl = await uploadPrescriptionFile(picked);
      await addPrescription.mutateAsync({
        memberId,
        file_url: fileUrl,
        file_type: 'photo',
      });
      Alert.alert('Prescription uploaded', 'Medicines were extracted when possible.');
      refetch();
      setPanel('reports');
    } catch (err) {
      Alert.alert(
        'Upload failed',
        err instanceof Error ? err.message : 'Please try again.',
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePrescription = (prescriptionId: string) => {
    Alert.alert('Delete prescription?', 'This removes the uploaded file.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePrescription.mutateAsync({ memberId, prescriptionId });
            refetch();
          } catch (err) {
            Alert.alert(
              'Could not delete',
              err instanceof Error ? err.message : 'Please try again.',
            );
          }
        },
      },
    ]);
  };

  const handleAddVital = async () => {
    if (!vitalValue.trim()) {
      Alert.alert('Required', 'Enter a vital reading value.');
      return;
    }
    try {
      await addVital.mutateAsync({
        memberId,
        vital_type: vitalType,
        value: vitalValue.trim(),
        recorded_at: new Date().toISOString(),
      });
      setVitalValue('');
      refetch();
    } catch (err) {
      Alert.alert(
        'Could not save',
        err instanceof Error ? err.message : 'Please try again.',
      );
    }
  };

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.brandPrimary}
        style={styles.loader}
      />
    );
  }

  if (!member) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Member not found</Text>
        <PrimaryAction icon="arrow-left" title="Go back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const ageText = member.date_of_birth
    ? `DOB ${formatVaultDate(member.date_of_birth)}`
    : null;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.name}>{member.full_name}</Text>
          <Text style={styles.meta}>
            {member.relationship}
            {member.blood_group ? ` · ${member.blood_group}` : ''}
            {ageText ? ` · ${ageText}` : ''}
          </Text>
        </View>

        <MemberDetailSections
          todayStatus="No urgent items"
          medicineCount={medicineCount}
          reportCount={reportCount}
          appointmentText="No upcoming visit"
          quickActions={[
            {
              id: 'record',
              label: 'Add record',
              icon: 'file-upload-outline',
              onPress: handleUploadPrescription,
            },
            {
              id: 'medicine',
              label: 'Add medicine',
              icon: 'pill',
              onPress: () => setPanel('medicines'),
            },
            {
              id: 'appointment',
              label: 'Book appointment',
              icon: 'calendar-plus',
              onPress: () =>
                navigateToTabScreen(navigation, 'Home', 'Services', {
                  screen: 'DoctorsList',
                }),
            },
          ]}
          recordLinks={[
            {
              label: 'Lab reports',
              value: reportCount > 0 ? `${reportCount} uploaded` : 'None yet',
              icon: 'flask-outline',
              onPress: () => setPanel('reports'),
            },
            {
              label: 'Prescriptions',
              value: reportCount > 0 ? `${reportCount} saved` : 'None yet',
              icon: 'file-document-outline',
              onPress: () => setPanel('reports'),
            },
            {
              label: 'Doctor visits',
              value: 'View history',
              icon: 'stethoscope',
              onPress: () => setPanel('records'),
            },
            {
              label: 'Uploads',
              value: 'Add prescription photo',
              icon: 'camera-outline',
              onPress: handleUploadPrescription,
            },
          ]}
          onMedicinesPress={() => setPanel('medicines')}
          onReportsPress={() => setPanel('reports')}
          onAppointmentsPress={() => setPanel('appointments')}
        />

        {panel === 'medicines' ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Medicines</Text>
            <Text style={styles.panelDesc}>
              Medicines saved to this profile, including items from prescription OCR.
            </Text>
            <SavedMedicinesList medicines={member.medicines || []} />
          </View>
        ) : null}

        {panel === 'reports' ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Reports & prescriptions</Text>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={handleUploadPrescription}
              disabled={uploading || addPrescription.isPending}>
              {uploading || addPrescription.isPending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Icon name="camera-outline" size={20} color={colors.white} />
                  <Text style={styles.uploadBtnText}>Upload prescription</Text>
                </>
              )}
            </TouchableOpacity>
            {(member.prescriptions || []).length === 0 ? (
              <Text style={styles.hint}>No prescriptions uploaded yet.</Text>
            ) : (
              (member.prescriptions || []).map(rx => (
                <View key={rx.id} style={styles.listCard}>
                  <Icon name="file-document-outline" size={22} color={colors.brandPrimary} />
                  <View style={styles.listBody}>
                    <Text style={styles.listTitle}>
                      {rx.file_type === 'pdf' ? 'PDF prescription' : 'Prescription photo'}
                    </Text>
                    <Text style={styles.listSub}>{formatVaultDate(rx.uploaded_at)}</Text>
                    <ExtractedMedicinesBlock
                      medicines={rx.ocr_data?.medicines || []}
                      doctor={rx.ocr_data?.doctor}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeletePrescription(rx.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Icon name="trash-can-outline" size={20} color={colors.statusDanger} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        ) : null}

        {panel === 'appointments' ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Appointments</Text>
            <Text style={styles.hint}>No upcoming visits for this member.</Text>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() =>
                navigateToTabScreen(navigation, 'Home', 'Services', {
                  screen: 'DoctorsList',
                })
              }>
              <Text style={styles.uploadBtnText}>Book appointment</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {panel === 'records' ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Health records</Text>
            <Text style={styles.panelDesc}>Log vitals and review trends.</Text>
            <View style={styles.formCard}>
              <Text style={styles.fieldLabel}>Vital type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {VITAL_TYPES.map(v => (
                  <TouchableOpacity
                    key={v.value}
                    style={[styles.chip, vitalType === v.value && styles.chipActive]}
                    onPress={() => setVitalType(v.value)}>
                    <Text
                      style={[
                        styles.chipText,
                        vitalType === v.value && styles.chipTextActive,
                      ]}>
                      {v.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.fieldLabel}>Value</Text>
              <TextInput
                style={styles.input}
                value={vitalValue}
                onChangeText={setVitalValue}
                placeholder="e.g. 120/80"
                placeholderTextColor={colors.neutral300}
              />
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleAddVital}
                disabled={addVital.isPending}>
                {addVital.isPending ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.saveBtnText}>Add reading</Text>
                )}
              </TouchableOpacity>
            </View>
            <VitalsTrendSection vitals={member.vitals || []} />
          </View>
        ) : null}

        {isFetching ? (
          <ActivityIndicator
            size="small"
            color={colors.brandPrimary}
            style={styles.refreshHint}
          />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function FamilyMemberDetailScreen() {
  const route = useRoute<Route>();
  const memberId = route.params?.memberId;

  return (
    <ScreenLayout
      headerMode="stack"
      title="Member health"
      showSearch={false}
      showCart>
      <RequireAuthGate
        title="Sign in to view member"
        subtitle="Family member details require an account."
        icon="account-outline">
        <MemberDetailContent key={memberId} />
      </RequireAuthGate>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    padding: calmLayout.screenPadding,
    gap: calmLayout.sectionGap,
  },
  loader: { marginVertical: spacing.xxxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginBottom: spacing.md },
  header: { gap: spacing.xs },
  name: { fontSize: 22, fontWeight: '800', color: colors.inkHeadline },
  meta: { fontSize: 14, color: colors.neutral500, lineHeight: 20 },
  panel: { gap: spacing.md },
  panelTitle: { fontSize: 16, fontWeight: '700', color: colors.inkHeadline },
  panelDesc: { fontSize: 13, color: colors.neutral600, lineHeight: 18 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brandPrimary,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  uploadBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  hint: { fontSize: 13, color: colors.neutral500, textAlign: 'center' },
  listCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.md,
  },
  listBody: { flex: 1 },
  listTitle: { fontSize: 14, fontWeight: '600', color: colors.inkHeadline },
  listSub: { fontSize: 12, color: colors.neutral500, marginTop: 2 },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral600,
    marginBottom: spacing.xs,
  },
  chipRow: { marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  chipText: { fontSize: 12, color: colors.neutral600 },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.ink900,
    marginBottom: spacing.md,
  },
  saveBtn: {
    backgroundColor: colors.brandPrimary,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  saveBtnText: { color: colors.white, fontWeight: '700' },
  refreshHint: { marginTop: spacing.md },
});

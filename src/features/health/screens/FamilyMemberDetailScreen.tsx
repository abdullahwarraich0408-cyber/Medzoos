import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { KeyboardAwareScrollView } from '../../../components/keyboard';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import {
  MemberHero,
  MemberPanelTabs,
  type MemberPanelId,
} from '../components/family/MemberDetailSections';
import { VitalsTrendSection } from '../components/family/VitalsTrendSection';
import {
  ExtractedMedicinesBlock,
  SavedMedicinesList,
} from '../components/family/MedicineListCard';
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
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';

type Nav = NativeStackNavigationProp<HealthStackParamList, 'FamilyMemberDetail'>;
type Route = RouteProp<HealthStackParamList, 'FamilyMemberDetail'>;

function MemberDetailContent() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const memberId = route.params.memberId;

  const { data: member, isLoading, refetch, isFetching } = useFamilyMember(memberId);
  const addVital = useAddMemberVital();
  const addPrescription = useAddMemberPrescription();
  const deletePrescription = useDeleteMemberPrescription();

  const [panel, setPanel] = useState<MemberPanelId>('medicines');
  const [vitalType, setVitalType] = useState('blood_pressure');
  const [vitalValue, setVitalValue] = useState('');
  const [uploading, setUploading] = useState(false);

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
      Alert.alert('Uploaded', 'Prescription saved for this member.');
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
        color={colors.primary700}
        style={styles.loader}
      />
    );
  }

  if (!member) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Member not found</Text>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.primaryBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const dobLabel = member.date_of_birth
    ? formatVaultDate(member.date_of_birth)
    : null;

  return (
    <KeyboardAwareScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom:
            Math.max(insets.bottom, TAB_BAR_CLEARANCE) +
            calmLayout.contentBottom,
        },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
        <MemberHero
          name={member.full_name}
          relationship={member.relationship}
          bloodGroup={member.blood_group}
          dobLabel={dobLabel}
          healthScore={member.health_score}
        />

        <Pressable
          style={({ pressed }) => [
            styles.uploadCard,
            pressed && styles.uploadPressed,
          ]}
          onPress={handleUploadPrescription}
          disabled={uploading || addPrescription.isPending}>
          <View style={styles.uploadIcon}>
            {uploading || addPrescription.isPending ? (
              <ActivityIndicator size="small" color={colors.primary700} />
            ) : (
              <Icon
                name="file-plus-outline"
                size={20}
                color={colors.primary700}
              />
            )}
          </View>
          <View style={styles.uploadCopy}>
            <Text style={styles.uploadTitle}>Upload prescription</Text>
            <Text style={styles.uploadHint}>Add Rx for this member</Text>
          </View>
          <Icon name="arrow-right" size={16} color={colors.primary700} />
        </Pressable>

        <MemberPanelTabs active={panel} onChange={setPanel} />

        {panel === 'medicines' ? (
          <View style={styles.panel}>
            <SavedMedicinesList medicines={member.medicines || []} />
          </View>
        ) : null}

        {panel === 'reports' ? (
          <View style={styles.panel}>
            {(member.prescriptions || []).length === 0 ? (
              <Text style={styles.hint}>No prescriptions uploaded yet.</Text>
            ) : (
              (member.prescriptions || []).map(rx => (
                <View key={rx.id} style={styles.listCard}>
                  <View style={styles.listIcon}>
                    <Icon
                      name="file-document-outline"
                      size={18}
                      color={colors.primary700}
                    />
                  </View>
                  <View style={styles.listBody}>
                    <Text style={styles.listTitle}>
                      {rx.file_type === 'pdf'
                        ? 'PDF prescription'
                        : 'Prescription photo'}
                    </Text>
                    <Text style={styles.listSub}>
                      {formatVaultDate(rx.uploaded_at)}
                    </Text>
                    <ExtractedMedicinesBlock
                      medicines={rx.ocr_data?.medicines || []}
                      doctor={rx.ocr_data?.doctor}
                    />
                  </View>
                  <Pressable
                    onPress={() => handleDeletePrescription(rx.id)}
                    hitSlop={8}
                    style={styles.deleteBtn}>
                    <Icon
                      name="trash-can-outline"
                      size={18}
                      color={colors.error}
                    />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        ) : null}

        {panel === 'appointments' ? (
          <View style={styles.panel}>
            <Text style={styles.hint}>No upcoming visits for this member.</Text>
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={() =>
                navigateToTabScreen(navigation, 'Home', 'Services', {
                  screen: 'DoctorsList',
                })
              }>
              <Text style={styles.primaryBtnText}>Book appointment</Text>
            </Pressable>
          </View>
        ) : null}

        {panel === 'vitals' ? (
          <View style={styles.panel}>
            <View style={styles.formCard}>
              <Text style={styles.fieldLabel}>Vital type</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}>
                {VITAL_TYPES.map(v => {
                  const active = vitalType === v.value;
                  return (
                    <Pressable
                      key={v.value}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setVitalType(v.value)}>
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}>
                        {v.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Text style={styles.fieldLabel}>Value</Text>
              <TextInput
                style={styles.input}
                value={vitalValue}
                onChangeText={setVitalValue}
                placeholder="e.g. 120/80"
                placeholderTextColor={colors.textDisabled}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.saveBtn,
                  pressed && styles.btnPressed,
                ]}
                onPress={handleAddVital}
                disabled={addVital.isPending}>
                {addVital.isPending ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.saveBtnText}>Add reading</Text>
                )}
              </Pressable>
            </View>
            <VitalsTrendSection vitals={member.vitals || []} />
          </View>
        ) : null}

        {isFetching ? (
          <ActivityIndicator
            size="small"
            color={colors.primary700}
            style={styles.refreshHint}
          />
        ) : null}
    </KeyboardAwareScrollView>
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
      showCart={false}>
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
    gap: 20,
  },
  loader: { marginVertical: spacing.xxxl },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  uploadPressed: { backgroundColor: colors.primary100 },
  uploadIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadCopy: { flex: 1, gap: 2 },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  uploadHint: {
    fontSize: 12,
    color: colors.textMuted,
  },
  panel: { gap: spacing.sm },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  listCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listBody: { flex: 1, gap: 2, minWidth: 0 },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  listSub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  deleteBtn: {
    paddingTop: 2,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipRow: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.primary100,
    borderColor: colors.primary300,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.primary800,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  saveBtn: {
    backgroundColor: colors.primary700,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  saveBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  primaryBtn: {
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.xl,
    backgroundColor: colors.primary700,
  },
  primaryBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  btnPressed: { opacity: 0.9 },
  refreshHint: { marginTop: spacing.sm },
});

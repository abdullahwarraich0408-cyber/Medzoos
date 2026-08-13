import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../../lib/auth/AuthContext';
import type { PrescriptionOcrData } from '../../../lib/api';
import {
  pickPrescriptionImage,
  uploadPrescriptionFile,
} from '../../../lib/familyVault/uploadPrescription';
import type { PickedPrescription } from '../../../lib/familyVault/uploadPrescription';
import { useReadPrescription } from '../../../lib/hooks/useApi';
import { ExtractedMedicinesBlock } from '../../health/components/family/MedicineListCard';


type ReadPrescriptionSectionProps = {
  prescriptionUrl: string;
  onPrescriptionUrlChange: (url: string) => void;
  onSignInRequired?: () => void;
  onFilePicked?: (file: PickedPrescription | null) => void;
  onOcrDataChange?: (data: PrescriptionOcrData | null) => void;
  label?: string;
  hint?: string;
  submitLabel?: string;
};

export function ReadPrescriptionSection({
  prescriptionUrl,
  onPrescriptionUrlChange,
  onSignInRequired,
  onFilePicked,
  onOcrDataChange,
  label = 'Prescription (optional)',
  hint = 'Upload a prescription photo to attach it to your booking. We read medicines and lab tests when possible.',
  submitLabel = 'Read Prescription',
}: ReadPrescriptionSectionProps) {
  const { isAuthenticated } = useAuth();
  const readPrescription = useReadPrescription();
  const [ocrData, setOcrData] = useState<PrescriptionOcrData | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleReadPrescription = async () => {
    if (!isAuthenticated) {
      Alert.alert('Sign in required', 'Please sign in to upload and read a prescription.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: onSignInRequired },
      ]);
      return;
    }

    try {
      const picked = await pickPrescriptionImage();
      if (!picked) return;

      setUploading(true);
      onFilePicked?.(picked);
      const fileUrl = await uploadPrescriptionFile(picked);
      onPrescriptionUrlChange(fileUrl);

      const result = await readPrescription.mutateAsync({ file_url: fileUrl });
      const data = result.ocr_data || null;
      setOcrData(data);
      onOcrDataChange?.(data);

      if (!data?.medicines?.length && !data?.lab_tests?.length) {
        Alert.alert(
          'Prescription uploaded',
          data?.note ||
            'Photo saved. OCR could not read details clearly — the lab will still receive your prescription.',
        );
      }
    } catch (error) {
      Alert.alert(
        'Could not read prescription',
        error instanceof Error ? error.message : 'Please try again with a clearer photo.',
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    onPrescriptionUrlChange('');
    onFilePicked?.(null);
    setOcrData(null);
    onOcrDataChange?.(null);
  };

  const busy = uploading || readPrescription.isPending;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.hint}>{hint}</Text>

      {!prescriptionUrl ? (
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={handleReadPrescription}
          disabled={busy}
          activeOpacity={0.85}>
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Icon name="file-document-outline" size={20} color={colors.white} />
              <Text style={styles.uploadBtnText}>{submitLabel}</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={styles.resultTitleRow}>
              <Icon name="check-circle" size={18} color={colors.statusSuccess} />
              <Text style={styles.resultTitle}>Prescription attached</Text>
            </View>
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearText}>Remove</Text>
            </TouchableOpacity>
          </View>

          {ocrData?.doctor ? (
            <Text style={styles.meta}>Dr. {ocrData.doctor}</Text>
          ) : null}
          {ocrData?.diagnosis ? (
            <Text style={styles.diagnosis}>Diagnosis: {ocrData.diagnosis}</Text>
          ) : null}
          {ocrData?.note ? <Text style={styles.note}>{ocrData.note}</Text> : null}

          {(ocrData?.lab_tests || []).length > 0 ? (
            <View style={styles.labTestsWrap}>
              <Text style={styles.labTestsLabel}>Lab tests on prescription</Text>
              {(ocrData?.lab_tests || []).map(test => (
                <View key={test} style={styles.labTestRow}>
                  <Icon name="flask-outline" size={14} color={colors.brandPrimary} />
                  <Text style={styles.labTestText}>{test}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <ExtractedMedicinesBlock
            medicines={ocrData?.medicines || []}
            doctor={ocrData?.doctor}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.inkHeadline,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: 12,
    color: colors.neutral500,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  uploadBtn: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  uploadBtnText: { fontSize: 14, fontWeight: '700', color: colors.white },
  resultCard: {
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    gap: spacing.xs,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  resultTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  resultTitle: { fontSize: 14, fontWeight: '700', color: colors.inkHeadline },
  clearText: { fontSize: 13, fontWeight: '600', color: colors.statusDanger },
  meta: { fontSize: 12, fontWeight: '600', color: colors.inkHeadline },
  diagnosis: { fontSize: 12, fontWeight: '600', color: colors.brandDark },
  note: { fontSize: 12, color: colors.neutral600, lineHeight: 16 },
  labTestsWrap: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral200,
    gap: spacing.xs,
  },
  labTestsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brandPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  labTestRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  labTestText: { fontSize: 13, color: colors.inkHeadline, fontWeight: '600' },
});
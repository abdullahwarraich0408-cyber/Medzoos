import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import {
  pickPrescriptionImage,
  uploadPrescriptionFile,
} from '../../../lib/familyVault/uploadPrescription';
import { healthRecordsApi } from '../../../lib/api';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';

const DOCUMENT_TYPES = [
  { id: 'prescription', label: 'Prescription' },
  { id: 'lab_report', label: 'Lab report' },
  { id: 'medical_document', label: 'Medical document' },
  { id: 'medical_image', label: 'Medical image' },
  { id: 'discharge_summary', label: 'Discharge summary' },
  { id: 'other', label: 'Other' },
];

function UploadMedicalDocumentContent() {
  const navigation = useNavigation();
  const [documentType, setDocumentType] = useState('prescription');
  const [doctorName, setDoctorName] = useState('');
  const [hospital, setHospital] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickFile = async () => {
    try {
      const picked = await pickPrescriptionImage();
      if (!picked) return;
      setUploading(true);
      const url = await uploadPrescriptionFile(picked);
      setFileUrl(url);
      setFileName(picked.name);
    } catch (err) {
      Alert.alert(
        'Upload failed',
        err instanceof Error ? err.message : 'Could not upload file.',
      );
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!fileUrl) {
      Alert.alert('Add a file', 'Upload a PDF or image of this record.');
      return;
    }
    try {
      setSaving(true);
      await healthRecordsApi.createDocument({
        document_type: documentType,
        title:
          documentType === 'prescription'
            ? doctorName
              ? `Prescription · ${doctorName}`
              : 'Uploaded prescription'
            : DOCUMENT_TYPES.find(item => item.id === documentType)?.label,
        doctor_name: doctorName || undefined,
        hospital_name: hospital || undefined,
        document_date: date,
        file_url: fileUrl,
        notes: notes || undefined,
      });
      Alert.alert(
        'Saved to health record',
        'This is labelled Uploaded by patient. It is not issued by a Medzoos doctor.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err) {
      Alert.alert(
        'Could not save',
        err instanceof Error ? err.message : 'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        Add a record from outside Medzoos. It stays in your health record and is
        clearly marked as uploaded by you.
      </Text>

      <Text style={styles.label}>Document type</Text>
      <View style={styles.types}>
        {DOCUMENT_TYPES.map(item => (
          <Pressable
            key={item.id}
            style={[styles.typeChip, documentType === item.id && styles.typeChipOn]}
            onPress={() => setDocumentType(item.id)}>
            <Text
              style={[
                styles.typeText,
                documentType === item.id && styles.typeTextOn,
              ]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Doctor name</Text>
      <TextInput
        style={styles.input}
        value={doctorName}
        onChangeText={setDoctorName}
        placeholder="Dr. Ahmed"
        placeholderTextColor={colors.textDisabled}
      />

      <Text style={styles.label}>Hospital / clinic</Text>
      <TextInput
        style={styles.input}
        value={hospital}
        onChangeText={setHospital}
        placeholder="ABC Hospital"
        placeholderTextColor={colors.textDisabled}
      />

      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.textDisabled}
      />

      <Text style={styles.label}>File</Text>
      <Pressable style={styles.upload} onPress={pickFile} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color={colors.primary700} />
        ) : (
          <>
            <Icon name="file-upload-outline" size={20} color={colors.primary700} />
            <Text style={styles.uploadText}>
              {fileName || 'Upload image or PDF'}
            </Text>
          </>
        )}
      </Pressable>

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.notes]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Previous diabetes prescription"
        placeholderTextColor={colors.textDisabled}
        multiline
      />

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Uploaded by patient</Text>
        <Text style={styles.noticeText}>
          This will not be shown as issued by a Medzoos doctor.
        </Text>
      </View>

      <Pressable
        style={[styles.save, (!fileUrl || saving) && styles.saveDisabled]}
        onPress={save}
        disabled={!fileUrl || saving}>
        {saving ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.saveText}>Save to health record</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

export function UploadMedicalDocumentScreen() {
  return (
    <ScreenLayout title="Upload record" showSearch={false} showCart={false}>
      <RequireAuthGate
        title="Sign in to upload records"
        subtitle="Your uploads stay in My Health and are labelled as uploaded by you.">
        <UploadMedicalDocumentContent />
      </RequireAuthGate>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: calmLayout.screenPadding,
    paddingBottom: TAB_BAR_CLEARANCE + 40,
    gap: spacing.sm,
  },
  lead: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipOn: {
    backgroundColor: colors.primary700,
    borderColor: colors.primary700,
  },
  typeText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  typeTextOn: { color: colors.white },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    color: colors.textPrimary,
  },
  notes: { minHeight: 90, textAlignVertical: 'top', paddingVertical: spacing.md },
  upload: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary200,
    backgroundColor: colors.primary100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  uploadText: { color: colors.primary800, fontWeight: '600' },
  notice: {
    backgroundColor: colors.warningBg || '#FFFBEB',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
    marginTop: spacing.sm,
  },
  noticeTitle: { fontWeight: '800', color: colors.textPrimary, fontSize: 13 },
  noticeText: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  save: {
    marginTop: spacing.md,
    minHeight: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primary700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDisabled: { opacity: 0.6 },
  saveText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});

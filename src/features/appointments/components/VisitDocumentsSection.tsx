import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { visitDocumentsApi } from '../../../lib/api';
import {
  pickPrescriptionImage,
  uploadPrescriptionFile,
} from '../../../lib/familyVault/uploadPrescription';
import { colors, spacing, radius } from '../../../theme';

const DOC_TYPES = [
  { id: 'lab_report', label: 'Lab report' },
  { id: 'imaging', label: 'Imaging / scan' },
  { id: 'previous_prescription', label: 'Previous prescription' },
  { id: 'referral', label: 'Referral' },
  { id: 'medical_report', label: 'Medical report' },
  { id: 'other', label: 'Other' },
];

type Props = {
  appointmentId: string;
  compact?: boolean;
};

export function VisitDocumentsSection({
  appointmentId,
  compact = false,
}: Props) {
  const queryClient = useQueryClient();
  const [documentType, setDocumentType] = useState('lab_report');
  const [uploading, setUploading] = useState(false);

  const docsQuery = useQuery({
    queryKey: ['visit-documents', appointmentId],
    enabled: Boolean(appointmentId),
    queryFn: async () => {
      const data = await visitDocumentsApi.list(appointmentId);
      return (data.documents || []) as Array<Record<string, unknown>>;
    },
  });

  const removeMut = useMutation({
    mutationFn: (documentId: string) =>
      visitDocumentsApi.remove(appointmentId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['visit-documents', appointmentId],
      });
    },
    onError: (err: Error) => {
      Alert.alert('Could not remove', err.message || 'Try again.');
    },
  });

  const documents = docsQuery.data || [];
  const typeLabel = useMemo(
    () => DOC_TYPES.find(t => t.id === documentType)?.label || 'Document',
    [documentType],
  );

  const handleUpload = async () => {
    try {
      const file = await pickPrescriptionImage();
      if (!file) return;
      setUploading(true);
      const url = await uploadPrescriptionFile(file);
      await visitDocumentsApi.create(appointmentId, {
        document_type: documentType,
        title: file.name,
        file_name: file.name,
        file_url: url,
        mime_type: file.type || null,
        file_size: null,
      });
      queryClient.invalidateQueries({
        queryKey: ['visit-documents', appointmentId],
      });
    } catch (error) {
      Alert.alert(
        'Upload failed',
        error instanceof Error ? error.message : 'Could not upload document.',
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="paperclip" size={16} color={colors.brandPrimary} />
          <Text style={styles.title}>Visit documents</Text>
        </View>
        <Pressable
          style={styles.typeChip}
          onPress={() => {
            const idx = DOC_TYPES.findIndex(t => t.id === documentType);
            const next = DOC_TYPES[(idx + 1) % DOC_TYPES.length];
            setDocumentType(next.id);
          }}>
          <Text style={styles.typeChipText}>{typeLabel}</Text>
          <Icon name="chevron-down" size={14} color={colors.textMuted} />
        </Pressable>
      </View>

      {docsQuery.isLoading ? (
        <ActivityIndicator color={colors.brandPrimary} />
      ) : documents.length === 0 ? (
        <Text style={styles.hint}>
          Upload labs, scans, or previous prescriptions for your doctor.
        </Text>
      ) : (
        <View style={styles.list}>
          {documents.map(doc => {
            const id = String(doc.id);
            const title = String(doc.title || doc.file_name || 'Document');
            const url = String(doc.file_url || '');
            const canRemove =
              doc.source !== 'chat' && doc.uploaded_by_type === 'patient';
            return (
              <View key={id} style={styles.docRow}>
                <Pressable
                  style={styles.docLink}
                  onPress={() => url && Linking.openURL(url)}>
                  <Icon name="file-document-outline" size={16} color={colors.brandPrimary} />
                  <Text style={styles.docTitle} numberOfLines={1}>
                    {title}
                  </Text>
                </Pressable>
                {canRemove ? (
                  <Pressable onPress={() => removeMut.mutate(id)} hitSlop={8}>
                    <Icon name="trash-can-outline" size={16} color="#94A3B8" />
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      <Pressable
        style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
        disabled={uploading}
        onPress={handleUpload}>
        {uploading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Icon name="upload" size={16} color={colors.white} />
            <Text style={styles.uploadText}>Upload document</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  compact: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: radius.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.white,
  },
  typeChipText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  hint: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
  list: { gap: spacing.xs },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  docLink: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  docTitle: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.brandPrimary },
  uploadBtn: {
    marginTop: spacing.xs,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadBtnDisabled: { opacity: 0.7 },
  uploadText: { color: colors.white, fontWeight: '700', fontSize: 13 },
});

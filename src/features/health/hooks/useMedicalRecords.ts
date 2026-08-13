import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import {
  useAllOrders,
  useLabReports,
  useProfileData,
  useUpdateProfileData,
} from '../../../lib/hooks/useApi';
import {
  pickPrescriptionImage,
  uploadPrescriptionFile,
} from '../../../lib/familyVault/uploadPrescription';
import type { MedicalRecord } from '../../../lib/profile/profileData';
import {
  buildMedicalRecordItems,
  buildDoctorFolders,
  buildLabFolders,
  getReportRecords,
  getUploadRecords,
  searchMedicalRecords,
  type MedicalRecordItem,
} from '../lib/medicalRecordModel';
import type { MedicalRecordTabId } from '../data/healthData';

const UPLOAD_TYPE_OPTIONS: { label: string; type: string }[] = [
  { label: 'Prescription', type: 'prescription' },
  { label: 'Doctor note', type: 'doctor note' },
  { label: 'Lab report', type: 'lab report' },
  { label: 'Other document', type: 'medical document' },
];

function createManualId() {
  return `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useMedicalRecords() {
  const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } =
    useProfileData();
  const { data: labReports = [], isLoading: labsLoading, refetch: refetchLabs } =
    useLabReports();
  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } =
    useAllOrders();
  const updateProfileData = useUpdateProfileData();
  const [uploading, setUploading] = useState(false);

  const records = useMemo(
    () =>
      buildMedicalRecordItems({
        manualRecords: profileData.medicalRecords,
        labReports,
        orders,
      }),
    [profileData.medicalRecords, labReports, orders],
  );

  const doctorFolders = useMemo(() => buildDoctorFolders(records), [records]);
  const labFolders = useMemo(() => buildLabFolders(records), [records]);

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchProfile(), refetchLabs(), refetchOrders()]);
  }, [refetchProfile, refetchLabs, refetchOrders]);

  const saveManualRecord = useCallback(
    async (record: MedicalRecord) => {
      const nextRecords = [record, ...(profileData.medicalRecords || [])];
      await updateProfileData.mutateAsync({
        ...profileData,
        medicalRecords: nextRecords,
      });
    },
    [profileData, updateProfileData],
  );

  const uploadRecord = useCallback(async () => {
    try {
      const picked = await pickPrescriptionImage();
      if (!picked) return;

      setUploading(true);
      const fileUrl = await uploadPrescriptionFile(picked);

      Alert.alert(
        'Save record as',
        'Choose a category for this document.',
        [
          ...UPLOAD_TYPE_OPTIONS.map(opt => ({
            text: opt.label,
            onPress: () => {
              void saveManualRecord({
                id: createManualId(),
                type: opt.type,
                title: opt.label,
                date: new Date().toISOString().slice(0, 10),
                lab: 'Your upload',
                fileUrl,
                source: 'manual',
              }).then(() => {
                Alert.alert('Saved', 'Your document was added to Medical Records.');
              });
            },
          })),
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true },
      );
    } catch (err) {
      Alert.alert(
        'Upload failed',
        err instanceof Error ? err.message : 'Could not upload document.',
      );
    } finally {
      setUploading(false);
    }
  }, [saveManualRecord]);

  const deleteManualRecord = useCallback(
    async (record: MedicalRecordItem) => {
      if (!record.uploadedByUser) return;
      const manualId = record.recordId.replace(/^manual-/, '');
      const nextRecords = (profileData.medicalRecords || []).filter(
        r => r.id !== manualId,
      );
      await updateProfileData.mutateAsync({
        ...profileData,
        medicalRecords: nextRecords,
      });
    },
    [profileData, updateProfileData],
  );

  const searchRecords = useCallback(
    (query: string) => searchMedicalRecords(records, query),
    [records],
  );

  const getTabData = useCallback(
    (tab: MedicalRecordTabId, query: string) => {
      const searched = searchMedicalRecords(records, query);

      switch (tab) {
        case 'doctors':
          return {
            doctorFolders: buildDoctorFolders(searched),
            labFolders: [],
            reports: [],
            uploads: [],
          };
        case 'labs':
          return {
            doctorFolders: [],
            labFolders: buildLabFolders(searched),
            reports: [],
            uploads: [],
          };
        case 'reports':
          return {
            doctorFolders: [],
            labFolders: [],
            reports: getReportRecords(searched),
            uploads: [],
          };
        case 'uploads':
          return {
            doctorFolders: [],
            labFolders: [],
            reports: [],
            uploads: getUploadRecords(searched),
          };
        default:
          return {
            doctorFolders: buildDoctorFolders(searched),
            labFolders: buildLabFolders(searched),
            reports: getReportRecords(searched).slice(0, 3),
            uploads: getUploadRecords(searched).slice(0, 3),
          };
      }
    },
    [records],
  );

  return {
    records,
    doctorFolders,
    labFolders,
    isLoading: profileLoading || labsLoading || ordersLoading,
    uploading,
    refetchAll,
    uploadRecord,
    deleteManualRecord,
    searchRecords,
    getTabData,
  };
}

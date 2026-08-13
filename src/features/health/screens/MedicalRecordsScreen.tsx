import React, { useMemo, useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import type { HealthStackParamList } from '../../../navigation/types';
import { HealthEmptyState } from '../components/shared/HealthEmptyState';
import { HealthSearchBar } from '../components/shared/HealthSearchBar';
import { MedicalRecordTabs } from '../components/records/MedicalRecordTabs';
import { DoctorFolderCard } from '../components/records/DoctorFolderCard';
import { LabFolderCard } from '../components/records/LabFolderCard';
import { LinkedRecordRow } from '../components/records/LinkedRecordRow';
import {
  RecordFolderSection,
  RecordListDivider,
} from '../components/records/RecordFolderSection';
import { useMedicalRecords } from '../hooks/useMedicalRecords';
import { useMedicalRecordActions } from '../hooks/useMedicalRecordActions';
import type { MedicalRecordTabId } from '../data/healthData';
import {
  RECORD_ALL_SECTIONS,
  RECORD_ALL_SECTION_META,
} from '../data/healthData';
import { getReportSourceLabel } from '../lib/medicalRecordModel';
import { colors, spacing, TAB_BAR_CLEARANCE, radius, shadows } from '../../../theme';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';
import { calmLayout } from '../../../theme/calmLayout';

type Nav = NativeStackNavigationProp<HealthStackParamList>;

const UPLOAD_FOOTER_HEIGHT = 72;
const FOLDER_PREVIEW_LIMIT = 2;
const REPORT_PREVIEW_LIMIT = 2;

function MedicalRecordsContent() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<MedicalRecordTabId>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const {
    isLoading,
    uploading,
    refetchAll,
    uploadRecord,
    deleteManualRecord,
    getTabData,
  } = useMedicalRecords();

  const { openRecord } = useMedicalRecordActions(deleteManualRecord);

  const tabData = useMemo(() => getTabData(tab, search), [getTabData, tab, search]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchAll();
    setRefreshing(false);
  }, [refetchAll]);

  const bottomPadding =
    UPLOAD_FOOTER_HEIGHT + Math.max(insets.bottom, TAB_BAR_CLEARANCE) + spacing.md;

  const hasAllContent =
    tabData.doctorFolders.length > 0 ||
    tabData.labFolders.length > 0 ||
    tabData.reports.length > 0 ||
    tabData.uploads.length > 0;

  const renderAllTab = () => {
    const sections = {
      doctors: tabData.doctorFolders.slice(0, FOLDER_PREVIEW_LIMIT),
      labs: tabData.labFolders.slice(0, FOLDER_PREVIEW_LIMIT),
      reports: tabData.reports.slice(0, REPORT_PREVIEW_LIMIT),
      uploads: tabData.uploads.slice(0, REPORT_PREVIEW_LIMIT),
    };

    if (!hasAllContent) {
      return (
        <HealthEmptyState
          icon="folder-lock-outline"
          title="No records yet"
          subtitle="Upload a document or book a visit to get started."
        />
      );
    }

    return (
      <View style={styles.sections}>
        {RECORD_ALL_SECTIONS.map(sectionId => {
          const meta = RECORD_ALL_SECTION_META[sectionId];
          const doctors = sectionId === 'doctors' ? sections.doctors : [];
          const labs = sectionId === 'labs' ? sections.labs : [];
          const reports = sectionId === 'reports' ? sections.reports : [];
          const uploads = sectionId === 'uploads' ? sections.uploads : [];

          const hasSection =
            doctors.length > 0 ||
            labs.length > 0 ||
            reports.length > 0 ||
            uploads.length > 0;

          if (!hasSection) return null;

          return (
            <RecordFolderSection
              key={sectionId}
              title={meta.title}
              icon={meta.icon}
              onSeeAll={() => setTab(meta.seeAllTab)}>
              {doctors.map((folder, index) => (
                <React.Fragment key={folder.doctorId}>
                  {index > 0 ? <RecordListDivider /> : null}
                  <DoctorFolderCard
                    folder={folder}
                    onPress={() =>
                      navigation.navigate('DoctorRecordsDetail', {
                        doctorId: folder.doctorId,
                      })
                    }
                  />
                </React.Fragment>
              ))}
              {labs.map((folder, index) => (
                <React.Fragment key={folder.labId}>
                  {index > 0 || doctors.length > 0 ? <RecordListDivider /> : null}
                  <LabFolderCard
                    folder={folder}
                    onPress={() =>
                      navigation.navigate('LabRecordsDetail', { labId: folder.labId })
                    }
                  />
                </React.Fragment>
              ))}
              {reports.map((record, index) => (
                <React.Fragment key={record.recordId}>
                  {index > 0 || doctors.length > 0 || labs.length > 0 ? (
                    <RecordListDivider />
                  ) : null}
                  <LinkedRecordRow
                    record={{
                      ...record,
                      description: getReportSourceLabel(record),
                    }}
                    onPress={() => openRecord(record)}
                    showNewBadge
                  />
                </React.Fragment>
              ))}
              {uploads.map((record, index) => (
                <React.Fragment key={record.recordId}>
                  {index > 0 || doctors.length > 0 || labs.length > 0 || reports.length > 0 ? (
                    <RecordListDivider />
                  ) : null}
                  <LinkedRecordRow record={record} onPress={() => openRecord(record)} />
                </React.Fragment>
              ))}
            </RecordFolderSection>
          );
        })}
      </View>
    );
  };

  const renderDoctorsTab = () => {
    if (tabData.doctorFolders.length === 0) {
      return (
        <HealthEmptyState
          icon="stethoscope"
          title="No doctor folders"
          subtitle="Doctor visits will appear here automatically."
        />
      );
    }

    return (
      <View style={styles.listCard}>
        {tabData.doctorFolders.map((folder, index) => (
          <React.Fragment key={folder.doctorId}>
            {index > 0 ? <RecordListDivider /> : null}
            <DoctorFolderCard
              folder={folder}
              onPress={() =>
                navigation.navigate('DoctorRecordsDetail', { doctorId: folder.doctorId })
              }
            />
          </React.Fragment>
        ))}
      </View>
    );
  };

  const renderLabsTab = () => {
    if (tabData.labFolders.length === 0) {
      return (
        <HealthEmptyState
          icon="flask-outline"
          title="No lab folders"
          subtitle="Lab bookings and reports will appear here."
        />
      );
    }

    return (
      <View style={styles.listCard}>
        {tabData.labFolders.map((folder, index) => (
          <React.Fragment key={folder.labId}>
            {index > 0 ? <RecordListDivider /> : null}
            <LabFolderCard
              folder={folder}
              onPress={() =>
                navigation.navigate('LabRecordsDetail', { labId: folder.labId })
              }
            />
          </React.Fragment>
        ))}
      </View>
    );
  };

  const renderReportsTab = () => {
    if (tabData.reports.length === 0) {
      return (
        <HealthEmptyState
          icon="file-chart-outline"
          title="No reports"
          subtitle="Completed lab and medical reports will show here."
        />
      );
    }

    return (
      <View style={styles.listCard}>
        {tabData.reports.map((record, index) => (
          <React.Fragment key={record.recordId}>
            {index > 0 ? <RecordListDivider /> : null}
            <LinkedRecordRow
              record={{
                ...record,
                description: getReportSourceLabel(record),
              }}
              onPress={() => openRecord(record)}
              showNewBadge
            />
          </React.Fragment>
        ))}
      </View>
    );
  };

  const renderUploadsTab = () => {
    if (tabData.uploads.length === 0) {
      return (
        <HealthEmptyState
          icon="cloud-upload-outline"
          title="No uploads"
          subtitle="Tap Upload document to add prescriptions or reports."
        />
      );
    }

    return (
      <View style={styles.listCard}>
        {tabData.uploads.map((record, index) => (
          <React.Fragment key={record.recordId}>
            {index > 0 ? <RecordListDivider /> : null}
            <LinkedRecordRow record={record} onPress={() => openRecord(record)} />
          </React.Fragment>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brandPrimary}
          />
        }>
        <Text style={styles.subtitle}>
          All your visits, labs, reports, and prescriptions in one place.
        </Text>

        <HealthSearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search doctor, lab, report, or prescription..."
          large
        />

        <MedicalRecordTabs active={tab} onChange={setTab} />

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.brandPrimary}
            style={styles.loader}
          />
        ) : tab === 'all' ? (
          renderAllTab()
        ) : tab === 'doctors' ? (
          renderDoctorsTab()
        ) : tab === 'labs' ? (
          renderLabsTab()
        ) : tab === 'reports' ? (
          renderReportsTab()
        ) : (
          renderUploadsTab()
        )}
      </ScrollView>

      <View
        style={[
          styles.uploadFooter,
          { paddingBottom: Math.max(insets.bottom, spacing.md) + TAB_BAR_CLEARANCE * 0.35 },
        ]}>
        <TouchableOpacity
          style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
          onPress={uploadRecord}
          disabled={uploading}
          activeOpacity={0.85}>
          {uploading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Icon name="cloud-upload-outline" size={20} color={colors.white} />
              <Text style={styles.uploadBtnText}>Upload document</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function MedicalRecordsScreen() {
  return (
    <ScreenLayout
      headerMode="stack"
      title="Medical Records"
      showSearch={false}
      showCart>
      <RequireAuthGate
        title="Sign in to view records"
        subtitle="Access prescriptions, lab reports, and doctor visit history."
        icon="folder-outline">
        <MedicalRecordsContent />
      </RequireAuthGate>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: calmLayout.screenPadding,
    gap: calmLayout.sectionGap,
  },
  subtitle: {
    ...healthOsTypography.sectionHint,
    fontSize: 14,
    lineHeight: 21,
  },
  sections: {
    gap: calmLayout.sectionGap,
  },
  listCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    ...shadows.cardElevated,
  },
  loader: { marginVertical: spacing.xxxl },
  uploadFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: calmLayout.screenPadding,
    paddingTop: spacing.sm,
    backgroundColor: colors.surfaceSubtle,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: healthOs.cardBorder,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    minHeight: UPLOAD_FOOTER_HEIGHT - spacing.sm,
    ...shadows.cardElevated,
  },
  uploadBtnDisabled: { opacity: 0.7 },
  uploadBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});

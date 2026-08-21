import React, { useMemo, useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
  View,
  Pressable,
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
import { RecordFolderSection } from '../components/records/RecordFolderSection';
import { useMedicalRecords } from '../hooks/useMedicalRecords';
import { useMedicalRecordActions } from '../hooks/useMedicalRecordActions';
import type { MedicalRecordTabId } from '../data/healthData';
import {
  RECORD_ALL_SECTIONS,
  RECORD_ALL_SECTION_META,
} from '../data/healthData';
import { getReportSourceLabel } from '../lib/medicalRecordModel';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';

type Nav = NativeStackNavigationProp<HealthStackParamList>;

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
    refetchAll,
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
          icon="folder-outline"
          title="No records yet"
          subtitle="Upload a document or book a visit."
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
              {doctors.map(folder => (
                <DoctorFolderCard
                  key={folder.doctorId}
                  folder={folder}
                  onPress={() =>
                    navigation.navigate('DoctorRecordsDetail', {
                      doctorId: folder.doctorId,
                    })
                  }
                />
              ))}
              {labs.map(folder => (
                <LabFolderCard
                  key={folder.labId}
                  folder={folder}
                  onPress={() =>
                    navigation.navigate('LabRecordsDetail', {
                      labId: folder.labId,
                    })
                  }
                />
              ))}
              {reports.map(record => (
                <LinkedRecordRow
                  key={record.recordId}
                  record={{
                    ...record,
                    description: getReportSourceLabel(record),
                  }}
                  onPress={() => openRecord(record)}
                  showNewBadge
                />
              ))}
              {uploads.map(record => (
                <LinkedRecordRow
                  key={record.recordId}
                  record={record}
                  onPress={() => openRecord(record)}
                />
              ))}
            </RecordFolderSection>
          );
        })}
      </View>
    );
  };

  const renderList = (
    empty: { icon: string; title: string; subtitle: string },
    content: React.ReactNode,
    isEmpty: boolean,
  ) => {
    if (isEmpty) {
      return (
        <HealthEmptyState
          icon={empty.icon}
          title={empty.title}
          subtitle={empty.subtitle}
        />
      );
    }
    return <View style={styles.list}>{content}</View>;
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom:
            Math.max(insets.bottom, TAB_BAR_CLEARANCE) + calmLayout.contentBottom,
        },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary700}
          colors={[colors.primary700]}
        />
      }>
      <Pressable
        style={({ pressed }) => [styles.uploadCard, pressed && styles.uploadPressed]}
        onPress={() => navigation.navigate('UploadMedicalDocument')}>
        <View style={styles.uploadIcon}>
          <Icon name="cloud-upload-outline" size={20} color={colors.primary700} />
        </View>
        <View style={styles.uploadCopy}>
          <Text style={styles.uploadTitle}>Upload document</Text>
          <Text style={styles.uploadHint}>Saved as uploaded by patient</Text>
        </View>
        <Icon name="arrow-right" size={16} color={colors.primary700} />
      </Pressable>

      <HealthSearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search records"
      />

      <MedicalRecordTabs active={tab} onChange={setTab} />

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary700}
          style={styles.loader}
        />
      ) : tab === 'all' ? (
        renderAllTab()
      ) : tab === 'doctors' ? (
        renderList(
          {
            icon: 'stethoscope',
            title: 'No doctor folders',
            subtitle: 'Visits will appear here.',
          },
          tabData.doctorFolders.map(folder => (
            <DoctorFolderCard
              key={folder.doctorId}
              folder={folder}
              onPress={() =>
                navigation.navigate('DoctorRecordsDetail', {
                  doctorId: folder.doctorId,
                })
              }
            />
          )),
          tabData.doctorFolders.length === 0,
        )
      ) : tab === 'labs' ? (
        renderList(
          {
            icon: 'flask-outline',
            title: 'No lab folders',
            subtitle: 'Lab bookings will appear here.',
          },
          tabData.labFolders.map(folder => (
            <LabFolderCard
              key={folder.labId}
              folder={folder}
              onPress={() =>
                navigation.navigate('LabRecordsDetail', {
                  labId: folder.labId,
                })
              }
            />
          )),
          tabData.labFolders.length === 0,
        )
      ) : tab === 'reports' ? (
        renderList(
          {
            icon: 'file-chart-outline',
            title: 'No reports',
            subtitle: 'Completed reports will show here.',
          },
          tabData.reports.map(record => (
            <LinkedRecordRow
              key={record.recordId}
              record={{
                ...record,
                description: getReportSourceLabel(record),
              }}
              onPress={() => openRecord(record)}
              showNewBadge
            />
          )),
          tabData.reports.length === 0,
        )
      ) : (
        renderList(
          {
            icon: 'cloud-upload-outline',
            title: 'No uploads',
            subtitle: 'Upload a document to get started.',
          },
          tabData.uploads.map(record => (
            <LinkedRecordRow
              key={record.recordId}
              record={record}
              onPress={() => openRecord(record)}
            />
          )),
          tabData.uploads.length === 0,
        )
      )}
    </ScrollView>
  );
}

export function MedicalRecordsScreen() {
  return (
    <ScreenLayout
      headerMode="stack"
      title="Medical Records"
      showSearch={false}
      showCart={false}>
      <RequireAuthGate
        title="Sign in to view records"
        subtitle="Access prescriptions, reports, and visit history."
        icon="folder-outline">
        <MedicalRecordsContent />
      </RequireAuthGate>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    padding: calmLayout.screenPadding,
    gap: 20,
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary100,
    borderRadius: radius.xxl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(23, 97, 142, 0.12)',
  },
  uploadPressed: { opacity: 0.92 },
  uploadIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadCopy: { flex: 1, gap: 2 },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary900,
  },
  uploadHint: {
    fontSize: 12,
    color: colors.primary600,
  },
  sections: { gap: 24 },
  list: { gap: spacing.sm },
  loader: { marginVertical: spacing.xxxl },
});

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import { navigateToServices } from '../../../lib/auth/navigation';
import type { HealthStackParamList } from '../../../navigation/types';
import { LinkedRecordRow } from '../components/records/LinkedRecordRow';
import {
  RecordFolderSection,
  RecordListDivider,
} from '../components/records/RecordFolderSection';
import {
  RecordQuickActions,
  RecordSummaryStrip,
} from '../components/records/RecordDetailBlocks';
import { useMedicalRecords } from '../hooks/useMedicalRecords';
import { useMedicalRecordActions } from '../hooks/useMedicalRecordActions';
import {
  DOCTOR_DETAIL_GROUPS,
  getDoctorById,
  getRecordsForDoctor,
  groupRecordsByTypes,
} from '../lib/medicalRecordModel';
import { colors, spacing, TAB_BAR_CLEARANCE } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';
import { calmLayout } from '../../../theme/calmLayout';

type Route = RouteProp<HealthStackParamList, 'DoctorRecordsDetail'>;
type Nav = NativeStackNavigationProp<HealthStackParamList>;

function DoctorRecordsDetailContent() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { records, deleteManualRecord } = useMedicalRecords();
  const { openRecord } = useMedicalRecordActions(deleteManualRecord);

  const doctor = useMemo(
    () => getDoctorById(route.params.doctorId, records),
    [route.params.doctorId, records],
  );

  const relatedRecords = useMemo(
    () => getRecordsForDoctor(route.params.doctorId, records),
    [route.params.doctorId, records],
  );

  const grouped = useMemo(
    () => groupRecordsByTypes(relatedRecords, DOCTOR_DETAIL_GROUPS),
    [relatedRecords],
  );

  if (!doctor) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Doctor records not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{doctor.name}</Text>
        <Text style={styles.heroSubtitle}>{doctor.specialty}</Text>
        <Text style={styles.heroMeta}>Last visit {doctor.lastVisitDate}</Text>
      </View>

      <RecordQuickActions
        actions={[
          {
            id: 'chat',
            label: 'Chat',
            icon: 'chat-outline',
            onPress: () => {
              const chat = relatedRecords.find(r => r.recordType === 'chat');
              if (chat) openRecord(chat);
              else Alert.alert('Chat', 'No chat history yet for this doctor.');
            },
          },
          {
            id: 'book',
            label: 'Book follow-up',
            icon: 'calendar-plus',
            onPress: () => navigateToServices(navigation, 'DoctorsList'),
          },
        ]}
      />

      <RecordSummaryStrip
        items={[
          { label: 'visits', value: doctor.visitCount },
          { label: 'reports', value: doctor.reportCount },
          { label: 'prescriptions', value: doctor.prescriptionCount },
          { label: 'tests', value: doctor.testCount },
        ]}
      />

      <View style={styles.groups}>
        {grouped.map(group => (
          <RecordFolderSection key={group.id} title={group.title} icon="folder-outline">
            {group.items.map((record, index) => (
              <React.Fragment key={record.recordId}>
                {index > 0 ? <RecordListDivider /> : null}
                <LinkedRecordRow
                  record={record}
                  onPress={() => openRecord(record)}
                  showStatus={Boolean(record.status)}
                />
              </React.Fragment>
            ))}
          </RecordFolderSection>
        ))}
      </View>
    </ScrollView>
  );
}

export function DoctorRecordsDetailScreen() {
  const route = useRoute<Route>();
  const { records } = useMedicalRecords();
  const doctor = getDoctorById(route.params.doctorId, records);
  const title = doctor?.name || 'Doctor Records';

  return (
    <ScreenLayout headerMode="stack" title={title} showSearch={false} showCart>
      <RequireAuthGate
        title="Sign in to view records"
        subtitle="Access doctor visit history and related records."
        icon="stethoscope">
        <DoctorRecordsDetailContent />
      </RequireAuthGate>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: {
    padding: calmLayout.screenPadding,
    gap: calmLayout.sectionGap,
  },
  hero: { gap: spacing.xs },
  heroTitle: {
    ...healthOsTypography.greeting,
    fontSize: 22,
    color: colors.ink900,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.neutral500,
  },
  heroMeta: {
    fontSize: 13,
    color: colors.neutral500,
  },
  groups: { gap: calmLayout.sectionGap },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
  },
  emptyText: {
    fontSize: 15,
    color: colors.neutral500,
  },
});

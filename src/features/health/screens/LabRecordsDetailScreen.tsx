import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
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
  LAB_DETAIL_GROUPS,
  getLabById,
  getRecordsForLab,
  groupRecordsByTypes,
} from '../lib/medicalRecordModel';
import { colors, spacing, TAB_BAR_CLEARANCE } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';
import { calmLayout } from '../../../theme/calmLayout';

type Route = RouteProp<HealthStackParamList, 'LabRecordsDetail'>;

function LabRecordsDetailContent() {
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { records, deleteManualRecord } = useMedicalRecords();
  const { openRecord } = useMedicalRecordActions(deleteManualRecord);

  const lab = useMemo(
    () => getLabById(route.params.labId, records),
    [route.params.labId, records],
  );

  const relatedRecords = useMemo(
    () => getRecordsForLab(route.params.labId, records),
    [route.params.labId, records],
  );

  const grouped = useMemo(
    () => groupRecordsByTypes(relatedRecords, LAB_DETAIL_GROUPS),
    [relatedRecords],
  );

  if (!lab) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Lab records not found.</Text>
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
        <Text style={styles.heroTitle}>{lab.name}</Text>
        <Text style={styles.heroSubtitle}>{lab.subtitle}</Text>
        <Text style={styles.heroMeta}>Last test {lab.lastTestDate}</Text>
      </View>

      <RecordQuickActions
        actions={[
          {
            id: 'book',
            label: 'Book test',
            icon: 'flask-outline',
            onPress: () => Alert.alert('Book test', 'Opening lab tests...'),
          },
          {
            id: 'contact',
            label: 'Contact lab',
            icon: 'phone-outline',
            onPress: () => Alert.alert('Contact lab', `Reach ${lab.name} support.`),
          },
        ]}
      />

      <RecordSummaryStrip
        items={[
          { label: 'tests', value: lab.testCount },
          { label: 'reports', value: lab.reportCount },
          { label: 'invoices', value: lab.invoiceCount },
          { label: 'home samples', value: lab.homeSampleCount },
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

export function LabRecordsDetailScreen() {
  const route = useRoute<Route>();
  const { records } = useMedicalRecords();
  const lab = getLabById(route.params.labId, records);
  const title = lab?.name || 'Lab Records';

  return (
    <ScreenLayout headerMode="stack" title={title} showSearch={false} showCart>
      <RequireAuthGate
        title="Sign in to view records"
        subtitle="Access lab bookings, reports, and invoices."
        icon="flask-outline">
        <LabRecordsDetailContent />
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

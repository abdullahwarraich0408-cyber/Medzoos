import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../components/layout/ScreenLayout';
import { HealthPageHeader } from './components/hub/HealthPageHeader';
import { HealthSummaryStrip } from './components/hub/HealthSummaryStrip';
import { HealthAttentionSection } from './components/hub/HealthAttentionSection';
import { HealthQuickActionGrid } from './components/hub/HealthQuickActionGrid';
import { HealthActiveMedsStrip } from './components/hub/HealthActiveMedsStrip';
import { HealthRecentReportsSection } from './components/hub/HealthRecentReportsSection';
import { HealthFamilyPreview } from './components/hub/HealthFamilyPreview';
import { HealthActivityTimeline } from './components/hub/HealthActivityTimeline';
import { useHealthHubOverview } from './hooks/useHealthHubOverview';
import type { HealthStackParamList } from '../../navigation/types';
import { colors, TAB_BAR_CLEARANCE } from '../../theme';
import { calmLayout } from '../../theme/calmLayout';

type HealthNav = NativeStackNavigationProp<HealthStackParamList>;

export function HealthHomePage() {
  const navigation = useNavigation<HealthNav>();
  const overview = useHealthHubOverview();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await overview.refetchAll?.();
    } finally {
      setRefreshing(false);
    }
  }, [overview.refetchAll]);

  return (
    <ScreenLayout title="Health" showSearch={false} showCart={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary700}
            colors={[colors.primary700]}
          />
        }>
        <HealthPageHeader subtitle="Your medicines, reports, and records" />

        <HealthSummaryStrip
          activeMedicines={overview.activePrescriptions}
          newReports={overview.reportsReady}
          nextVisit={overview.upcomingVisit}
        />

        <HealthAttentionSection
          items={overview.attention}
          navigation={navigation}
        />

        <HealthQuickActionGrid
          navigation={navigation}
          badges={overview.badges}
        />

        <HealthActiveMedsStrip
          medicines={overview.activeMedicines}
          onSeeAll={() => navigation.navigate('MedicinesList')}
          onMedicinePress={medicineId =>
            navigation.navigate('MedicineDetail', { medicineId })
          }
        />

        <HealthRecentReportsSection
          reports={overview.recentReports}
          onSeeAll={() => navigation.navigate('LabReports')}
        />

        <HealthFamilyPreview
          members={overview.familyMembers}
          onViewAll={() => navigation.navigate('FamilyProfiles')}
          onMemberPress={memberId => {
            if (!memberId || memberId === 'self') {
              navigation.navigate('FamilyProfiles');
              return;
            }
            navigation.navigate('FamilyMemberDetail', { memberId });
          }}
        />

        <HealthActivityTimeline
          items={overview.activity}
          onViewHistory={() => navigation.navigate('HealthHistory')}
        />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    padding: calmLayout.screenPadding,
    paddingBottom: TAB_BAR_CLEARANCE + calmLayout.contentBottom,
    gap: calmLayout.sectionGap,
  },
});

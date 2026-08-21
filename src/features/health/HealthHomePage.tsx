import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../components/layout/ScreenLayout';
import { HealthPageHeader } from './components/hub/HealthPageHeader';
import { HealthAttentionSection } from './components/hub/HealthAttentionSection';
import { HealthQuickActionGrid } from './components/hub/HealthQuickActionGrid';
import { HealthActiveMedsStrip } from './components/hub/HealthActiveMedsStrip';
import { HealthActivityTimeline } from './components/hub/HealthActivityTimeline';
import { useHealthHubOverview } from './hooks/useHealthHubOverview';
import { useAuth } from '../../lib/auth/AuthContext';
import type { HealthStackParamList } from '../../navigation/types';
import { colors, TAB_BAR_CLEARANCE } from '../../theme';
import { calmLayout } from '../../theme/calmLayout';

type HealthNav = NativeStackNavigationProp<HealthStackParamList>;

export function HealthHomePage() {
  const navigation = useNavigation<HealthNav>();
  const { user } = useAuth();
  const overview = useHealthHubOverview();
  const [refreshing, setRefreshing] = useState(false);

  const firstName = useMemo(() => {
    const name = user?.name?.trim();
    if (!name) return undefined;
    return name.split(/\s+/)[0];
  }, [user?.name]);

  const attention = useMemo(
    () =>
      overview.attention
        .filter(item => item.id !== 'all-clear' && item.id !== 'demo-report')
        .slice(0, 2),
    [overview.attention],
  );

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
        <HealthPageHeader
          title={firstName ? `Hi, ${firstName}` : 'Health'}
          subtitle="Medicines, reports, and records"
        />

        <HealthAttentionSection items={attention} navigation={navigation} />

        <HealthQuickActionGrid
          navigation={navigation}
          badges={overview.badges}
        />

        {overview.activeMedicines.length > 0 ? (
          <HealthActiveMedsStrip
            medicines={overview.activeMedicines.slice(0, 2)}
            onSeeAll={() => navigation.navigate('MedicinesList')}
            onMedicinePress={medicineId =>
              navigation.navigate('MedicineDetail', { medicineId })
            }
          />
        ) : null}

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
    gap: 28,
  },
});

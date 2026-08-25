import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import {
  useLabTests,
} from '../../../lib/hooks/useApi';
import type { LabTest } from '../../../lib/mappers/labTest';
import type { DoctorsStackParamList } from '../../../navigation/types';
import { HealthSection } from '../components/shared/HealthSection';
import { HealthPackageCard } from '../components/packages/HealthPackageCard';
import { HEALTH_PACKAGES, type HealthPackageDef } from '../data/healthData';


function findTestForPackage(pkg: HealthPackageDef, tests: LabTest[]) {
  const match = tests.find(t =>
    pkg.searchTerms.some(term =>
      t.name.toLowerCase().includes(term.toLowerCase()),
    ),
  );
  if (match) return match;
  if (pkg.category === 'full-body') {
    return tests.find(t => t.category === 'full-body') || tests[0];
  }
  return tests.find(t => Number(t.testsIncluded) >= 5) || tests[0];
}

function HealthPackagesContent() {
  const navigation =
    useNavigation<NativeStackNavigationProp<DoctorsStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  const [compareId, setCompareId] = useState<string | null>(null);

  const { data: apiTests = [], refetch } = useLabTests();
  const tests = apiTests;

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleBook = (pkg: HealthPackageDef) => {
    const test = findTestForPackage(pkg, tests);
    if (test) {
      navigation.navigate('LabTestBooking', { testId: test.id });
    }
  };

  const comparePkg = useMemo(
    () => HEALTH_PACKAGES.find(p => p.id === compareId),
    [compareId],
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Health Packages</Text>
        <Text style={styles.heroSub}>
          Bundled checkups with higher value — CBC alone is ~Rs. 800, but a
          full package saves thousands.
        </Text>
        <View style={styles.valueRow}>
          <View style={styles.valuePill}>
            <Text style={styles.valuePillText}>Up to 40% savings</Text>
          </View>
          <View style={styles.valuePill}>
            <Text style={styles.valuePillText}>Home collection</Text>
          </View>
        </View>
      </View>

      {comparePkg ? (
        <View style={styles.compareBanner}>
          <Text style={styles.compareTitle}>Comparing: {comparePkg.name}</Text>
          <Text style={styles.compareSub}>
            {comparePkg.testsIncluded} tests · PKR{' '}
            {comparePkg.price.toLocaleString()} vs individual PKR{' '}
            {comparePkg.individualPrice.toLocaleString()}
          </Text>
        </View>
      ) : null}

      <HealthSection
        title="Browse Packages"
        subtitle="Full body, cardiac, gender-specific & child wellness">
        {HEALTH_PACKAGES.map(pkg => (
          <HealthPackageCard
            key={pkg.id}
            pkg={pkg}
            selected={compareId === pkg.id}
            onBook={() => handleBook(pkg)}
            onCompare={() =>
              setCompareId(prev => (prev === pkg.id ? null : pkg.id))
            }
          />
        ))}
      </HealthSection>
    </ScrollView>
  );
}

export function HealthPackagesScreen() {
  return (
    <ScreenLayout headerMode="stack" title="Health Packages" showSearch={false}>
      <HealthPackagesContent />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  hero: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: spacing.xs,
  },
  heroSub: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.neutral600,
  },
  valueRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  valuePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.brandLight,
  },
  valuePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brandPrimary,
  },
  compareBanner: {
    backgroundColor: `${colors.brandPrimary}10`,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.brandPrimary}30`,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  compareTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  compareSub: {
    fontSize: 12,
    color: colors.neutral600,
    marginTop: 4,
  },
});
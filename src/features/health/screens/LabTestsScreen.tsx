import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { useAuth } from '../../../lib/auth/AuthContext';
import {
  useLabTests,
  usePopularLabTests,
  useLabTestCategories,
} from '../../../lib/hooks/useApi';
import { getLabCart } from '../../../lib/labCart';
import type { LabTest } from '../../../lib/mappers/labTest';
import type { LabFlowParamList } from '../../../navigation/types';
import { LabTestCard } from '../../lab-tests/components/LabTestCard';
import { CATEGORIES } from '../../lab-tests/data/mockLabTests';
import { HealthSearchBar } from '../components/shared/HealthSearchBar';
import { HealthSection } from '../components/shared/HealthSection';
import { HealthEmptyState } from '../components/shared/HealthEmptyState';
import { PopularTestChips } from '../components/lab/PopularTestChips';
import { UpcomingTestCard } from '../components/lab/UpcomingTestCard';
import { RecentReportRow } from '../components/lab/RecentReportRow';
import { HomeCollectionBanner } from '../components/lab/HomeCollectionBanner';
import { useHealthDashboard } from '../hooks/useHealthDashboard';
import { POPULAR_TEST_QUERIES } from '../data/healthData';


function LabTestsContent() {
  const navigation =
    useNavigation<NativeStackNavigationProp<LabFlowParamList>>();
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [activePopular, setActivePopular] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const { upcomingBookings, recentReports, refetchAll } = useHealthDashboard({
    enabled: isAuthenticated,
  });
  const apiParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (activeCategory) params.category = activeCategory;
    const query = search.trim() || (activePopular
      ? POPULAR_TEST_QUERIES.find(p => p.id === activePopular)?.query
      : '');
    if (query?.trim()) params.q = query.trim();
    return params;
  }, [activeCategory, search, activePopular]);

  const { data: apiTests = [], isLoading, isError, refetch, isFetching } =
    useLabTests(apiParams);
  const { data: apiPopular = [] } = usePopularLabTests();
  const { data: apiCategories = [] } = useLabTestCategories();

  const tests = apiTests;
  const popular = apiPopular;
  const categories = apiCategories.length > 0 ? apiCategories : CATEGORIES;

  const popularChips = useMemo(
    () =>
      POPULAR_TEST_QUERIES.map(item => ({
        id: item.id,
        label: item.label,
      })),
    [],
  );

  const filtered = useMemo(() => {
    let result = [...tests];
    const query = search.trim() || activePopular
      ? POPULAR_TEST_QUERIES.find(p => p.id === activePopular)?.query || search
      : search;

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        t =>
          t.name.toLowerCase().includes(q) ||
          t.lab.toLowerCase().includes(q) ||
          (t.category || '').toLowerCase().includes(q),
      );
    }

    if (activeCategory) {
      result = result.filter(t => t.category === activeCategory);
    }

    return result;
  }, [tests, search, activePopular, activeCategory]);

  const loadCartCount = useCallback(async () => {
    const cart = await getLabCart();
    setCartCount(cart.length);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCartCount();
      refetchAll();
    }, [loadCartCount, refetchAll]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      await refetchAll();
      await loadCartCount();
    } finally {
      setRefreshing(false);
    }
  }, [refetch, refetchAll, loadCartCount]);

  const handleBook = (test: LabTest) => {
    navigation.navigate('LabTestBooking', { testId: test.id });
  };

  const handlePopularSelect = (query: string, id: string) => {
    setActivePopular(prev => (prev === id ? null : id));
    setSearch(query);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing || (isFetching && !isLoading)}
          onRefresh={onRefresh}
          tintColor={colors.brandPrimary}
        />
      }>
      <HealthSearchBar
        value={search}
        onChangeText={text => {
          setSearch(text);
          if (!text) setActivePopular(null);
        }}
        placeholder="Search tests (CBC, HbA1c, Vitamin D...)"
      />

      <View style={styles.quickLinks}>
        <TouchableOpacity
          style={styles.quickLinkOutline}
          onPress={() => navigation.navigate('LabsList')}
          activeOpacity={0.85}>
          <Icon name="hospital-building" size={16} color={colors.brandPrimary} />
          <Text style={styles.quickLinkOutlineText}>Lab Partners</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickLinkOutline}
          onPress={() => navigation.navigate('LabCart')}
          activeOpacity={0.85}>
          <Icon name="cart-outline" size={16} color={colors.brandPrimary} />
          <Text style={styles.quickLinkOutlineText}>
            Lab Cart{cartCount > 0 ? ` (${cartCount})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickLinkPrimary}
          onPress={() => navigation.navigate('LabReports')}
          activeOpacity={0.85}>
          <Icon name="file-document-outline" size={16} color={colors.white} />
          <Text style={styles.quickLinkPrimaryText}>Reports</Text>
        </TouchableOpacity>
      </View>

      <HomeCollectionBanner />

      <HealthSection title="Popular Tests">
        <PopularTestChips
          tests={popularChips}
          activeId={activePopular}
          onSelect={handlePopularSelect}
        />
      </HealthSection>

      {upcomingBookings.length > 0 ? (
        <HealthSection
          title="Upcoming Tests"
          subtitle="Track sample collection"
          actionLabel="View all"
          onAction={() =>
            navigation.getParent()?.getParent()?.navigate('You' as never, {
              screen: 'OrdersList',
            } as never)
          }>
          {upcomingBookings.slice(0, 3).map(booking => (
            <UpcomingTestCard key={booking.id} booking={booking} />
          ))}
        </HealthSection>
      ) : null}

      {recentReports.length > 0 ? (
        <HealthSection
          title="Recent Reports"
          actionLabel="All reports"
          onAction={() => navigation.navigate('LabReports')}>
          {recentReports.slice(0, 3).map(report => (
            <RecentReportRow
              key={report.id}
              report={report}
              onDownload={
                report.reportUrl
                  ? () => Linking.openURL(report.reportUrl!)
                  : undefined
              }
            />
          ))}
        </HealthSection>
      ) : null}

      {!search && !activeCategory && popular.length > 0 ? (
        <HealthSection title="Popular Packages">
          {popular.slice(0, 2).map(test => (
            <LabTestCard
              key={test.id}
              test={test}
              compact
              onBook={handleBook}
              onCartUpdate={loadCartCount}
            />
          ))}
        </HealthSection>
      ) : null}

      <HealthSection title="Browse by Category">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}>
          <TouchableOpacity
            style={[styles.categoryChip, !activeCategory && styles.categoryChipActive]}
            onPress={() => setActiveCategory(null)}
            activeOpacity={0.85}>
            <Text
              style={[
                styles.categoryText,
                !activeCategory && styles.categoryTextActive,
              ]}>
              All Tests
            </Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                activeCategory === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat.id)}
              activeOpacity={0.85}>
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat.id && styles.categoryTextActive,
                ]}>
                {cat.icon} {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </HealthSection>

      <HealthSection title="All Lab Tests">
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brandPrimary} />
          </View>
        ) : filtered.length > 0 ? (
          <>
            <Text style={styles.countText}>
              <Text style={styles.countBold}>{filtered.length}</Text> tests
              available
            </Text>
            {filtered.map(test => (
              <LabTestCard
                key={test.id}
                test={test}
                onBook={handleBook}
                onCartUpdate={loadCartCount}
              />
            ))}
          </>
        ) : (
          <HealthEmptyState
            icon="flask-empty-outline"
            title={isError ? 'Could not load tests' : 'No tests found'}
            subtitle={
              isError
                ? 'Pull to refresh or try again in a moment.'
                : 'Try a different search or category.'
            }
          />
        )}
      </HealthSection>
    </ScrollView>
  );
}

export function LabTestsScreen() {
  return (
    <ScreenLayout headerMode="stack" title="Lab Tests" showSearch={false}>
      <LabTestsContent />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: TAB_BAR_CLEARANCE,
    gap: spacing.md,
  },
  quickLinks: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  quickLinkOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    backgroundColor: colors.white,
  },
  quickLinkOutlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  quickLinkPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
  },
  quickLinkPrimaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  categoriesRow: { gap: spacing.sm },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    backgroundColor: colors.white,
  },
  categoryChipActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral600,
  },
  categoryTextActive: { color: colors.white },
  countText: {
    fontSize: 13,
    color: colors.neutral500,
    marginBottom: spacing.md,
  },
  countBold: {
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  center: { paddingVertical: spacing.xxxl, alignItems: 'center' },
});
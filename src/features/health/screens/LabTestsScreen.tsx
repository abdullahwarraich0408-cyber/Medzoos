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
import { canPopCurrentStack } from '../../../lib/auth/navigation';
import {
  useLabTests,
  usePopularLabTests,
  useLabTestCategories,
} from '../../../lib/hooks/useApi';
import { getLabCart } from '../../../lib/labCart';
import type { LabTest } from '../../../lib/mappers/labTest';
import type { LabFlowParamList } from '../../../navigation/types';
import { LabTestCard } from '../../lab-tests/components/LabTestCard';
import { LabTestsHero } from '../../lab-tests/components/LabTestsHero';
import { LabTestsScreenHeader } from '../../lab-tests/components/LabTestsScreenHeader';
import { labTestsBrand } from '../../lab-tests/labTestsBrand';
import { CATEGORIES } from '../../lab-tests/data/mockLabTests';
import { HealthSection } from '../components/shared/HealthSection';
import { HealthEmptyState } from '../components/shared/HealthEmptyState';
import { PopularTestChips } from '../components/lab/PopularTestChips';
import { UpcomingTestCard } from '../components/lab/UpcomingTestCard';
import { RecentReportRow } from '../components/lab/RecentReportRow';
import { HomeCollectionBanner } from '../components/lab/HomeCollectionBanner';
import { useHealthDashboard } from '../hooks/useHealthDashboard';
import { POPULAR_TEST_QUERIES } from '../data/healthData';
import { spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';

const CATEGORY_ICONS: Record<string, string> = {
  blood: 'water',
  diabetes: 'needle',
  heart: 'heart-pulse',
  vitamin: 'pill',
  'full-body': 'human',
};

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
    const query =
      search.trim() ||
      (activePopular
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
    const query =
      search.trim() || activePopular
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

  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (!text) setActivePopular(null);
  };

  const handleBack = useCallback(() => {
    if (canPopCurrentStack(navigation)) {
      navigation.goBack();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  return (
    <>
      <LabTestsScreenHeader
        title="Lab Tests"
        onBackPress={handleBack}
        showBack={canPopCurrentStack(navigation) || navigation.canGoBack()}
      />
      <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing || (isFetching && !isLoading)}
          onRefresh={onRefresh}
          tintColor={labTestsBrand.accent}
          colors={[labTestsBrand.accent]}
        />
      }>
      <LabTestsHero search={search} onSearchChange={handleSearchChange} />

      <View style={styles.quickLinks}>
        <TouchableOpacity
          style={styles.quickLinkOutline}
          onPress={() => navigation.navigate('LabsList')}
          activeOpacity={0.85}>
          <Icon
            name="hospital-building"
            size={15}
            color={labTestsBrand.accent}
          />
          <Text style={styles.quickLinkOutlineText} numberOfLines={1}>
            Partners
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickLinkOutline}
          onPress={() => navigation.navigate('LabCart')}
          activeOpacity={0.85}>
          <Icon name="cart-outline" size={15} color={labTestsBrand.accent} />
          <Text style={styles.quickLinkOutlineText} numberOfLines={1}>
            Cart{cartCount > 0 ? ` (${cartCount})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickLinkPrimary}
          onPress={() => navigation.navigate('LabReports')}
          activeOpacity={0.85}>
          <Icon
            name="file-document-outline"
            size={15}
            color={labTestsBrand.onAccent}
          />
          <Text style={styles.quickLinkPrimaryText} numberOfLines={1}>
            Reports
          </Text>
        </TouchableOpacity>
      </View>

      <HomeCollectionBanner />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular tests</Text>
        <PopularTestChips
          tests={popularChips}
          activeId={activePopular}
          onSelect={handlePopularSelect}
        />
      </View>

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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular packages</Text>
          <View style={styles.list}>
            {popular.slice(0, 2).map(test => (
              <LabTestCard
                key={test.id}
                test={test}
                compact
                onBook={handleBook}
                onCartUpdate={loadCartCount}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse by category</Text>
        <View style={styles.categoryRail}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !activeCategory && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(null)}
              activeOpacity={0.85}>
              <View
                style={[
                  styles.categoryIcon,
                  !activeCategory && styles.categoryIconActive,
                ]}>
                <Icon
                  name="flask-outline"
                  size={13}
                  color={
                    !activeCategory
                      ? labTestsBrand.accent
                      : labTestsBrand.onAccent
                  }
                />
              </View>
              <Text
                style={[
                  styles.categoryText,
                  !activeCategory && styles.categoryTextActive,
                ]}>
                All
              </Text>
            </TouchableOpacity>
            {categories.map(cat => {
              const active = activeCategory === cat.id;
              const iconName = CATEGORY_ICONS[cat.id] || 'flask-outline';
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    active && styles.categoryChipActive,
                  ]}
                  onPress={() => setActiveCategory(cat.id)}
                  activeOpacity={0.85}>
                  <View
                    style={[
                      styles.categoryIcon,
                      active && styles.categoryIconActive,
                    ]}>
                    <Icon
                      name={iconName}
                      size={13}
                      color={
                        active
                          ? labTestsBrand.accent
                          : labTestsBrand.onAccent
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryText,
                      active && styles.categoryTextActive,
                    ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.summaryRow}>
          <Text style={styles.sectionTitle}>All lab tests</Text>
          {!isLoading ? (
            <Text style={styles.countText}>
              {filtered.length} available
            </Text>
          ) : null}
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={labTestsBrand.accent} />
          </View>
        ) : filtered.length > 0 ? (
          <View style={styles.list}>
            {filtered.map(test => (
              <LabTestCard
                key={test.id}
                test={test}
                onBook={handleBook}
                onCartUpdate={loadCartCount}
              />
            ))}
          </View>
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
      </View>
    </ScrollView>
    </>
  );
}

export function LabTestsScreen() {
  return (
    <ScreenLayout
      hideHeader
      embedSafeAreaInChildren
      showSearch={false}
      backgroundColor={labTestsBrand.page}>
      <LabTestsContent />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: TAB_BAR_CLEARANCE + spacing.xl,
    gap: spacing.xl,
  },
  quickLinks: {
    flexDirection: 'row',
    gap: 10,
  },
  quickLinkOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    backgroundColor: labTestsBrand.card,
    minWidth: 0,
  },
  quickLinkOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: labTestsBrand.accent,
  },
  quickLinkPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: labTestsBrand.accent,
    minWidth: 0,
  },
  quickLinkPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: labTestsBrand.onAccent,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    color: labTestsBrand.ink,
    marginBottom: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: labTestsBrand.muted,
  },
  categoriesRow: {
    gap: 8,
    alignItems: 'center',
    paddingRight: spacing.sm,
  },
  categoryRail: {
    backgroundColor: labTestsBrand.soft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingLeft: 6,
    paddingRight: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    backgroundColor: labTestsBrand.card,
  },
  categoryChipActive: {
    backgroundColor: labTestsBrand.accent,
    borderColor: labTestsBrand.accent,
  },
  categoryIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: labTestsBrand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconActive: {
    backgroundColor: labTestsBrand.card,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: labTestsBrand.ink,
  },
  categoryTextActive: { color: labTestsBrand.onAccent },
  list: {
    gap: spacing.md + 4,
  },
  center: { paddingVertical: spacing.xxxl, alignItems: 'center' },
});

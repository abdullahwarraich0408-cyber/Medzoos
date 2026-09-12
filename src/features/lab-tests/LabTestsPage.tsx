import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../components/layout/ScreenLayout';
import {
  useLabTests,
  usePopularLabTests,
  useLabTestCategories,
} from '../../lib/hooks/useApi';
import { getLabCart } from '../../lib/labCart';
import type { LabTest } from '../../lib/mappers/labTest';
import type { LabTestsStackParamList } from '../../navigation/types';
import { canPopCurrentStack } from '../../lib/auth/navigation';
import { LabTestsHero } from './components/LabTestsHero';
import { LabTestCard } from './components/LabTestCard';
import { LabTestsScreenHeader } from './components/LabTestsScreenHeader';
import { labTestsBrand } from './labTestsBrand';
import { CATEGORIES } from './data/mockLabTests';
import { HomeCollectionBanner } from '../health/components/lab/HomeCollectionBanner';
import { spacing, radius, TAB_BAR_CLEARANCE } from '../../theme';

const CATEGORY_ICONS: Record<string, string> = {
  blood: 'water',
  diabetes: 'needle',
  heart: 'heart-pulse',
  vitamin: 'pill',
  'full-body': 'human',
};

function LabTestSkeleton() {
  return <View style={styles.skeleton} />;
}

export function LabTestsPage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<LabTestsStackParamList>>();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const { data: apiTests = [], isLoading, isError, refetch, isFetching } =
    useLabTests();
  const { data: apiPopular = [] } = usePopularLabTests();
  const { data: apiCategories = [] } = useLabTestCategories();

  const tests = apiTests;
  const popular = apiPopular;
  const categories = apiCategories.length > 0 ? apiCategories : CATEGORIES;

  const filtered = useMemo(() => {
    let result = [...tests];

    if (search.trim()) {
      const q = search.toLowerCase();
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
  }, [tests, search, activeCategory]);

  const loadCartCount = useCallback(async () => {
    const cart = await getLabCart();
    setCartCount(cart.length);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCartCount();
    }, [loadCartCount]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      await loadCartCount();
    } finally {
      setRefreshing(false);
    }
  }, [refetch, loadCartCount]);

  const handleBook = (test: LabTest) => {
    navigation.navigate('LabTestBooking', { testId: test.id });
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
    <ScreenLayout
      hideHeader
      embedSafeAreaInChildren
      showSearch={false}
      showCart={false}
      backgroundColor={labTestsBrand.page}>
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
        <LabTestsHero search={search} onSearchChange={setSearch} />

        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={styles.quickLinkOutline}
            onPress={() => navigation.navigate('LabCart')}
            activeOpacity={0.85}>
            <Icon name="cart-outline" size={15} color={labTestsBrand.accent} />
            <Text style={styles.quickLinkOutlineText}>
              Lab Cart{cartCount > 0 ? ` (${cartCount})` : ''}
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
            <Text style={styles.quickLinkPrimaryText}>My Reports</Text>
          </TouchableOpacity>
        </View>

        <HomeCollectionBanner />

        {!search && !activeCategory && popular.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular packages</Text>
            <View style={styles.list}>
              {popular.map(test => (
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
            {!isLoading && filtered.length > 0 ? (
              <Text style={styles.countText}>
                {filtered.length} available
              </Text>
            ) : null}
          </View>

          {isLoading ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <LabTestSkeleton key={i} />
              ))}
            </>
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
            <View style={styles.empty}>
              <Icon
                name="flask-empty-outline"
                size={40}
                color={labTestsBrand.mist}
              />
              <Text style={styles.emptyTitle}>
                {isError ? 'Could not load tests' : 'No tests found'}
              </Text>
              <Text style={styles.emptySub}>
                {isError
                  ? 'Pull to refresh or try again in a moment.'
                  : 'Try a different search or category.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
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
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    backgroundColor: labTestsBrand.card,
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
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: labTestsBrand.accent,
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
  skeleton: {
    height: 140,
    backgroundColor: labTestsBrand.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    opacity: 0.7,
  },
  empty: {
    backgroundColor: labTestsBrand.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: labTestsBrand.ink,
    marginTop: spacing.md,
  },
  emptySub: {
    fontSize: 13,
    color: labTestsBrand.muted,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
});

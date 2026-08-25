import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../theme';
import { healthOs } from '../../theme/healthOs';
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
import { LabTestsHero } from './components/LabTestsHero';
import { LabTestCard } from './components/LabTestCard';
import { CATEGORIES } from './data/mockLabTests';

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

  return (
    <ScreenLayout title="Lab tests" showSearch={false} showCart={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: TAB_BAR_CLEARANCE },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing || (isFetching && !isLoading)}
            onRefresh={onRefresh}
            tintColor={colors.brandPrimary}
            colors={[colors.brandPrimary]}
          />
        }>
        <LabTestsHero search={search} onSearchChange={setSearch} />

        <View style={styles.quickLinks}>
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
            <Text style={styles.quickLinkPrimaryText}>My Reports</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Text style={styles.bannerEmoji}>🏠</Text>
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Free Home Sample Collection</Text>
            <Text style={styles.bannerSub}>
              Certified phlebotomist visits your home. No lab visit required.
            </Text>
          </View>
        </View>

        {!search && !activeCategory && popular.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Packages</Text>
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
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
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
        </View>

        <View style={styles.section}>
          {isLoading ? (
            <>
              <Text style={styles.countText}>Loading tests...</Text>
              {Array.from({ length: 4 }).map((_, i) => (
                <LabTestSkeleton key={i} />
              ))}
            </>
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
            <View style={styles.empty}>
              <Icon name="flask-empty-outline" size={48} color={colors.neutral300} />
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
    padding: spacing.lg,
  },
  quickLinks: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickLinkOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
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
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
  },
  quickLinkPrimaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.brandBanner,
    borderRadius: radius.xxl,
    marginBottom: spacing.lg,
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerEmoji: { fontSize: 24 },
  bannerText: { flex: 1 },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  bannerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    lineHeight: 18,
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: spacing.md,
  },
  categoriesRow: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
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
  skeleton: {
    height: 200,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    marginBottom: spacing.md,
    opacity: 0.6,
  },
  empty: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginTop: spacing.md,
  },
  emptySub: {
    fontSize: 14,
    color: colors.neutral500,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
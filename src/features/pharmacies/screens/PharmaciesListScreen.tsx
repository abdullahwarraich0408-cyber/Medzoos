import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { useVendors } from '../../../lib/hooks/useApi';
import type { Pharmacy } from '../../../lib/mappers/vendor';
import { PharmacyListCard } from '../components/PharmacyListCard';
import { PharmaciesHero } from '../components/PharmaciesHero';
import { pharmaciesBrand } from '../pharmaciesBrand';
import { spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { PharmaciesStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<PharmaciesStackParamList, 'PharmaciesList'>;

type QuickFilter = 'all' | 'open' | 'verified';

const QUICK_FILTERS: { id: QuickFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'storefront-outline' },
  { id: 'open', label: 'Open now', icon: 'clock-check-outline' },
  { id: 'verified', label: 'Verified', icon: 'shield-check-outline' },
];

function PharmacySkeleton() {
  return (
    <View style={styles.skeleton}>
      <View style={styles.skeletonPhoto} />
      <View style={styles.skeletonBody}>
        <View style={[styles.skeletonLine, { width: '70%' }]} />
        <View style={[styles.skeletonLine, { width: '45%', marginTop: 8 }]} />
        <View style={[styles.skeletonLine, { width: '55%', marginTop: 8 }]} />
      </View>
    </View>
  );
}

export function PharmaciesListScreen() {
  const navigation = useNavigation<Nav>();
  const {
    data: apiPharmacies = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useVendors();
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return apiPharmacies.filter(p => {
      if (quickFilter === 'open' && !p.open) return false;
      if (quickFilter === 'verified' && !p.verified) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q)
      );
    });
  }, [apiPharmacies, search, quickFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const openPharmacy = (pharmacy: Pharmacy) => {
    if (!pharmacy.id) return;
    navigation.navigate('PharmacyDetail', {
      vendorId: pharmacy.id,
      slug: pharmacy.slug,
      name: pharmacy.name,
    });
  };

  return (
    <ScreenLayout
      title="Pharmacies"
      headerMode="stack"
      showSearch={false}
      showCart
      showNotifications={false}
      backgroundColor={pharmaciesBrand.page}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing || (isFetching && !isLoading)}
            onRefresh={onRefresh}
            tintColor={pharmaciesBrand.accent}
            colors={[pharmaciesBrand.accent]}
          />
        }>
        <PharmaciesHero search={search} onSearchChange={setSearch} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}>
          {QUICK_FILTERS.map(item => {
            const active = quickFilter === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setQuickFilter(item.id)}
                style={[styles.filterChip, active && styles.filterChipActive]}>
                <Icon
                  name={item.icon}
                  size={14}
                  color={
                    active ? pharmaciesBrand.onAccent : pharmaciesBrand.accent
                  }
                />
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryTitle}>
            {isLoading && apiPharmacies.length === 0
              ? 'Finding pharmacies…'
              : `${filtered.length} ${filtered.length === 1 ? 'pharmacy' : 'pharmacies'}`}
          </Text>
          {apiPharmacies.length > 0 ? (
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          ) : null}
        </View>

        {isLoading && apiPharmacies.length === 0 ? (
          <View style={styles.list}>
            <PharmacySkeleton />
            <PharmacySkeleton />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.stateBlock}>
            <View style={styles.emptyIcon}>
              <Icon
                name="store-search-outline"
                size={28}
                color={pharmaciesBrand.accent}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {isError
                ? 'Couldn’t load pharmacies'
                : search.trim() || quickFilter !== 'all'
                  ? 'No matches'
                  : 'No pharmacies yet'}
            </Text>
            <Text style={styles.stateText}>
              {isError
                ? 'Pull down to refresh and try again.'
                : search.trim() || quickFilter !== 'all'
                  ? 'Try another search or filter.'
                  : 'Verified partners will appear here soon.'}
            </Text>
            {isLoading ? (
              <ActivityIndicator color={pharmaciesBrand.accent} />
            ) : null}
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map(pharmacy => (
              <PharmacyListCard
                key={pharmacy.id || pharmacy.slug}
                pharmacy={pharmacy}
                onPress={() => openPharmacy(pharmacy)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: TAB_BAR_CLEARANCE + spacing.xl,
    gap: spacing.md,
  },

  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: pharmaciesBrand.card,
    borderWidth: 1,
    borderColor: pharmaciesBrand.border,
  },
  filterChipActive: {
    backgroundColor: pharmaciesBrand.accent,
    borderColor: pharmaciesBrand.accent,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: pharmaciesBrand.ink,
  },
  filterChipTextActive: {
    color: pharmaciesBrand.onAccent,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: pharmaciesBrand.ink,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: pharmaciesBrand.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: pharmaciesBrand.success,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: pharmaciesBrand.success,
  },

  list: {
    gap: spacing.md,
  },

  skeleton: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: pharmaciesBrand.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: pharmaciesBrand.border,
    padding: spacing.md,
  },
  skeletonPhoto: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: pharmaciesBrand.soft,
  },
  skeletonBody: {
    flex: 1,
    justifyContent: 'center',
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: pharmaciesBrand.soft,
  },

  stateBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    backgroundColor: pharmaciesBrand.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: pharmaciesBrand.border,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: pharmaciesBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: pharmaciesBrand.ink,
    textAlign: 'center',
  },
  stateText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: pharmaciesBrand.muted,
    textAlign: 'center',
  },
});

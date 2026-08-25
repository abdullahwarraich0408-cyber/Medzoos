import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  RefreshControl,
  Platform,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { useVendors } from '../../../lib/hooks/useApi';
import type { Pharmacy } from '../../../lib/mappers/vendor';
import { PharmacyListCard } from '../components/PharmacyListCard';
import { colors, spacing, radius, TAB_BAR_CLEARANCE, shadows } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { PharmaciesStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<PharmaciesStackParamList, 'PharmaciesList'>;

export function PharmaciesListScreen() {
  const navigation = useNavigation<Nav>();
  const { data: apiPharmacies = [], isLoading, isError, refetch, isFetching } = useVendors();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const pharmacies = apiPharmacies;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pharmacies;
    return pharmacies.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q),
    );
  }, [pharmacies, search]);

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
      showCart>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || (isFetching && !isLoading)}
            onRefresh={onRefresh}
          />
        }>
        <Text style={styles.hint}>
          Order medicines from verified pharmacies near you.
        </Text>

        <View style={styles.searchBar}>
          <Icon name="magnify" size={20} color={colors.brandPrimary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pharmacies..."
            placeholderTextColor={colors.neutral500}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && Platform.OS === 'android' ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Icon name="close-circle" size={18} color={colors.neutral500} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Icon name="store-check" size={16} color={colors.brandPrimary} />
            <Text style={styles.statText}>{filtered.length} pharmacies</Text>
          </View>
          {apiPharmacies.length > 0 ? (
            <View style={[styles.statPill, styles.livePill]}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live from API</Text>
            </View>
          ) : null}
        </View>

        {isLoading && pharmacies.length === 0 ? (
          <Text style={styles.empty}>Loading pharmacies...</Text>
        ) : filtered.length === 0 ? (
          <Text style={styles.empty}>
            {isError
              ? 'Could not load pharmacies. Pull to refresh.'
              : search.trim()
                ? 'No pharmacies match your search.'
                : 'No pharmacies available yet.'}
          </Text>
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
    paddingHorizontal: calmLayout.screenPadding,
    paddingBottom: TAB_BAR_CLEARANCE + calmLayout.contentBottom,
    gap: calmLayout.blockGap,
  },
  hint: { ...healthOsTypography.sectionHint },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    ...shadows.card,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.ink900, padding: 0 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
  },
  statText: { fontSize: 12, fontWeight: '600', color: colors.neutral700 },
  livePill: { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#16A34A' },
  liveText: { fontSize: 11, fontWeight: '700', color: '#15803D' },
  list: { gap: spacing.md },
  empty: {
    ...healthOsTypography.messageBody,
    textAlign: 'center',
    paddingVertical: spacing.xxl,
    color: colors.neutral500,
  },
});

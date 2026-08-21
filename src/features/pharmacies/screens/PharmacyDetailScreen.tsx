import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  RefreshControl,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { usePharmacy, useVendorProducts } from '../../../lib/hooks/useApi';
import { MedicineCard } from '../../medicines/components/MedicineCard';
import type { Medicine } from '../../../lib/mappers/product';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';
import type { PharmaciesStackParamList } from '../../../navigation/types';

type DetailRoute = RouteProp<PharmaciesStackParamList, 'PharmacyDetail'>;
type DetailNav = NativeStackNavigationProp<PharmaciesStackParamList, 'PharmacyDetail'>;

export function PharmacyDetailScreen() {
  const navigation = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const { vendorId, slug, name: routeName } = route.params;
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const pharmacyQuery = usePharmacy(vendorId, slug);
  const productsQuery = useVendorProducts(vendorId);
  const pharmacy = pharmacyQuery.data;

  const displayName = pharmacy?.name || routeName || 'Pharmacy';

  const filteredProducts = useMemo(() => {
    const list = productsQuery.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      m =>
        m.name.toLowerCase().includes(q) ||
        m.generic.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q),
    );
  }, [productsQuery.data, search]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([pharmacyQuery.refetch(), productsQuery.refetch()]);
    } finally {
      setRefreshing(false);
    }
  };

  const openProduct = (medicine: Medicine) => {
    navigation.navigate('ProductDetail', { productId: medicine.id });
  };

  if (pharmacyQuery.isLoading && !pharmacy) {
    return (
      <ScreenLayout title={displayName} headerMode="stack" showSearch={false}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading pharmacy...</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={displayName} headerMode="stack" showSearch={false} showCart>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.hero}>
          <Image
            source={{ uri: pharmacy?.bgImage }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            {pharmacy?.verified ? (
              <View style={styles.verifiedRow}>
                <Icon name="shield-check" size={14} color={colors.white} />
                <Text style={styles.verifiedLabel}>Verified pharmacy</Text>
              </View>
            ) : null}
            <Text style={styles.heroTitle}>{displayName}</Text>
            <Text style={styles.heroMeta}>
              {pharmacy?.city || 'Pakistan'} · {pharmacy?.deliveryTime || '30–45 min'} delivery
            </Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Icon name="star" size={14} color={colors.rating} />
                <Text style={styles.heroStatText}>
                  {pharmacy?.rating?.toFixed(1) ?? '4.5'} ({pharmacy?.reviews ?? 0})
                </Text>
              </View>
              <View style={styles.heroStat}>
                <Icon name="map-marker" size={14} color={colors.brandHighlight} />
                <Text style={styles.heroStatText}>{pharmacy?.distance ?? '—'}</Text>
              </View>
              <View style={styles.heroStat}>
                <Icon
                  name={pharmacy?.open ? 'check-circle' : 'close-circle'}
                  size={14}
                  color={pharmacy?.open ? '#86EFAC' : '#FCA5A5'}
                />
                <Text style={styles.heroStatText}>
                  {pharmacy?.open ? 'Open now' : 'Closed'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {pharmacy?.description ? (
          <Text style={styles.description}>{pharmacy.description}</Text>
        ) : null}

        <View style={styles.searchBar}>
          <Icon name="magnify" size={20} color={colors.brandPrimary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines in this store..."
            placeholderTextColor={colors.neutral500}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>

        <Text style={styles.sectionTitle}>
          Medicines ({filteredProducts.length})
        </Text>

        {productsQuery.isLoading ? (
          <Text style={styles.empty}>Loading products...</Text>
        ) : filteredProducts.length === 0 ? (
          <Text style={styles.empty}>
            {search
              ? 'No medicines match your search.'
              : 'No medicines listed for this pharmacy yet.'}
          </Text>
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map(medicine => (
              <MedicineCard
                key={medicine.id}
                medicine={medicine}
                onPress={openProduct}
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...healthOsTypography.messageBody, color: colors.neutral500 },
  hero: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    minHeight: 180,
    backgroundColor: colors.neutral200,
  },
  heroImage: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(12, 26, 46, 0.55)',
  },
  heroContent: {
    padding: spacing.lg,
    justifyContent: 'flex-end',
    minHeight: 180,
    gap: spacing.xs,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(17, 61, 99, 0.85)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.xs,
  },
  verifiedLabel: { fontSize: 11, fontWeight: '700', color: colors.white },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.3,
  },
  heroMeta: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  heroStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  heroStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroStatText: { fontSize: 12, fontWeight: '600', color: colors.white },
  description: {
    ...healthOsTypography.messageBody,
    fontSize: 14,
    color: colors.neutral600,
    lineHeight: 21,
  },
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
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.ink900, padding: 0 },
  sectionTitle: { ...healthOsTypography.sectionTitle },
  grid: { gap: spacing.md },
  empty: {
    ...healthOsTypography.messageBody,
    textAlign: 'center',
    color: colors.neutral500,
    paddingVertical: spacing.xl,
  },
});

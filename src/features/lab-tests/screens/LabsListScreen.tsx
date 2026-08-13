import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  RefreshControl,
  Platform,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { useLabs } from '../../../lib/hooks/useApi';
import type { DoctorsStackParamList } from '../../../navigation/types';
import { colors, spacing, radius, TAB_BAR_CLEARANCE, shadows } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';

type Nav = NativeStackNavigationProp<DoctorsStackParamList, 'LabsList'>;

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'];

export function LabsListScreen() {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [homeOnly, setHomeOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (search.trim()) p.q = search.trim();
    if (city) p.city = city;
    if (homeOnly) p.home_collection = 'true';
    return p;
  }, [search, city, homeOnly]);

  const { data: labs = [], isLoading, refetch, isFetching } = useLabs(params);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScreenLayout title="Lab Partners" headerMode="stack" showSearch={false}>
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
          Browse certified labs, compare services, and book tests.
        </Text>

        <View style={styles.searchBar}>
          <Icon name="magnify" size={20} color={colors.brandPrimary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search lab name..."
            placeholderTextColor={colors.neutral500}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cityRow}>
          <Pressable
            style={[styles.cityChip, !city && styles.cityChipActive]}
            onPress={() => setCity('')}>
            <Text style={[styles.cityText, !city && styles.cityTextActive]}>All</Text>
          </Pressable>
          {CITIES.map(c => (
            <Pressable
              key={c}
              style={[styles.cityChip, city === c && styles.cityChipActive]}
              onPress={() => setCity(c === city ? '' : c)}>
              <Text style={[styles.cityText, city === c && styles.cityTextActive]}>
                {c}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.homeRow}>
          <Text style={styles.homeLabel}>Home collection only</Text>
          <Switch
            value={homeOnly}
            onValueChange={setHomeOnly}
            trackColor={{ true: colors.brandPrimary, false: colors.neutral200 }}
          />
        </View>

        {isLoading && labs.length === 0 ? (
          <Text style={styles.empty}>Loading labs...</Text>
        ) : labs.length === 0 ? (
          <Text style={styles.empty}>No labs match your filters.</Text>
        ) : (
          <View style={styles.list}>
            {labs.map(lab => (
              <Pressable
                key={lab.id}
                style={styles.card}
                onPress={() => navigation.navigate('LabDetail', { labId: lab.id })}>
                <View style={styles.cardTop}>
                  <View style={styles.cardTitleBlock}>
                    <Text style={styles.cardTitle}>{lab.name}</Text>
                    <Text style={styles.cardMeta}>
                      <Icon name="map-marker" size={12} color={colors.neutral500} />{' '}
                      {lab.city || lab.address || 'Pakistan'}
                    </Text>
                  </View>
                  <View style={styles.ratingPill}>
                    <Icon name="star" size={12} color={colors.rating} />
                    <Text style={styles.ratingText}>{lab.rating.toFixed(1)}</Text>
                  </View>
                </View>
                <View style={styles.badges}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{lab.testCount} tests</Text>
                  </View>
                  {lab.homeCollection ? (
                    <View style={[styles.badge, styles.badgeMint]}>
                      <Icon name="home" size={12} color={colors.brandPrimary} />
                      <Text style={styles.badgeMintText}>Home collection</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.viewTests}>View tests</Text>
                  <Icon name="chevron-right" size={20} color={colors.brandPrimary} />
                </View>
              </Pressable>
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
  cityRow: { gap: spacing.sm },
  cityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    backgroundColor: colors.white,
  },
  cityChipActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  cityText: { fontSize: 12, fontWeight: '600', color: colors.neutral600 },
  cityTextActive: { color: colors.white },
  homeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
  },
  homeLabel: { fontSize: 14, fontWeight: '600', color: colors.neutral600 },
  list: { gap: spacing.md },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    ...shadows.card,
    gap: spacing.md,
  },
  cardTop: { flexDirection: 'row', gap: spacing.md },
  cardTitleBlock: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.ink900 },
  cardMeta: { fontSize: 12, color: colors.neutral500, marginTop: 4 },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#B45309' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badge: {
    backgroundColor: colors.brandMist,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.brandPrimary },
  badgeMint: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeMintText: { fontSize: 11, fontWeight: '600', color: colors.brandPrimary },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewTests: { fontSize: 13, fontWeight: '700', color: colors.brandPrimary },
  empty: {
    ...healthOsTypography.messageBody,
    textAlign: 'center',
    color: colors.neutral500,
    paddingVertical: spacing.xl,
  },
});

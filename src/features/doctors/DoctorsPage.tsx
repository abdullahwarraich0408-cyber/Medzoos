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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../components/layout/ScreenLayout';
import { useDoctors, useDoctorFilters } from '../../lib/hooks/useApi';
import type { Doctor } from '../../lib/mappers/doctor';
import type { DoctorsStackParamList } from '../../navigation/types';
import {
  DoctorsHero,
  ConsultTypeTabs,
  DoctorCard,
  DoctorFilterSheet,
} from './components';
import {
  DEFAULT_FILTERS,
  FILTER_OPTIONS,
  applyDoctorFilters,
  type ConsultType,
  type DoctorFilters,
} from './data/mockDoctors';
import type { ConsultOption } from './utils/consultOptions';

type DoctorsRoute = RouteProp<DoctorsStackParamList, 'DoctorsList'>;

const QUICK_FILTERS = [
  { id: 'availableToday' as const, label: 'Available Today' },
  { id: 'online' as const, label: 'Video Consultation' },
  { id: 'experienced' as const, label: 'Most Experienced' },
];

function DoctorSkeleton() {
  return <View style={styles.skeleton} />;
}

export function DoctorsPage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<DoctorsStackParamList>>();
  const route = useRoute<DoctorsRoute>();
  const {
    consultType: initialConsultType,
    specialty: initialSpecialty,
    screenTitle = 'Doctors',
    onlineOnly = false,
  } = route.params ?? {};

  const lockConsultType = Boolean(initialConsultType);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<DoctorFilters>(() => ({
    ...DEFAULT_FILTERS,
    specialties: initialSpecialty ? [initialSpecialty] : [],
    online: onlineOnly,
  }));
  const [category, setCategory] = useState<ConsultType>(
    initialConsultType ?? 'in_person',
  );
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const apiParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (initialSpecialty) params.specialty = initialSpecialty;
    else if (filters.specialties.length === 1) {
      params.specialty = filters.specialties[0];
    }
    if (category === 'online' || onlineOnly || filters.online) {
      params.consult = 'online';
    }
    if (search.trim()) params.q = search.trim();
    return params;
  }, [
    initialSpecialty,
    filters.specialties,
    filters.online,
    category,
    onlineOnly,
    search,
  ]);

  const { data: apiDoctors = [], isLoading, isError, refetch, isFetching } =
    useDoctors(apiParams);
  const { data: apiFilters } = useDoctorFilters();

  const specialtyOptions = useMemo(() => {
    const fromApi = apiFilters?.specialties;
    if (fromApi?.length) return fromApi;
    return FILTER_OPTIONS.specialties;
  }, [apiFilters]);

  const doctors = apiDoctors;
  const usingLiveData = apiDoctors.length > 0;

  const onlineCount = useMemo(
    () => doctors.filter(d => d.online).length,
    [doctors],
  );

  const filtered = useMemo(
    () => applyDoctorFilters(doctors, filters, search, category),
    [doctors, filters, search, category],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const toggleQuickFilter = (id: (typeof QUICK_FILTERS)[number]['id']) => {
    if (id === 'availableToday') {
      setFilters(current => ({
        ...current,
        availableToday: !current.availableToday,
      }));
    } else if (id === 'online') {
      setFilters(current => ({ ...current, online: !current.online }));
    } else if (id === 'experienced') {
      setFilters(current => ({
        ...current,
        experienced: !current.experienced,
      }));
    }
  };

  const toggleSpecialtyChip = (specialty: string) => {
    setFilters(current => {
      const next = current.specialties.includes(specialty)
        ? current.specialties.filter(s => s !== specialty)
        : [...current.specialties, specialty];
      return { ...current, specialties: next };
    });
  };

  const handleBook = (doctor: Doctor, option: ConsultOption) => {
    navigation.navigate('DoctorBooking', {
      doctorId: doctor.id,
      consultType: option.type,
      practiceLocationId: option.practiceLocationId,
      hospitalId: option.hospitalId,
    });
  };

  const handleViewProfile = (doctor: Doctor) => {
    navigation.navigate('DoctorProfile', {
      doctorId: doctor.id,
      consultType: category,
    });
  };

  return (
    <ScreenLayout headerMode="stack" title={screenTitle} showSearch={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || (isFetching && !isLoading)}
            onRefresh={onRefresh}
            tintColor={colors.brandPrimary}
            colors={[colors.brandPrimary]}
          />
        }>
        <DoctorsHero
          search={search}
          onSearchChange={setSearch}
          category={category}
        />

        {!lockConsultType ? (
          <ConsultTypeTabs
            value={category}
            onChange={setCategory}
            onlineCount={onlineCount}
          />
        ) : null}

        {!initialSpecialty ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specialtyChips}>
            {specialtyOptions.slice(0, 5).map(specialty => {
              const active = filters.specialties.includes(specialty);
              return (
                <TouchableOpacity
                  key={specialty}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleSpecialtyChip(specialty)}
                  activeOpacity={0.8}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {specialty}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFilters}>
          {QUICK_FILTERS.map(chip => {
            const active =
              chip.id === 'availableToday'
                ? filters.availableToday
                : chip.id === 'online'
                  ? filters.online
                  : Boolean(filters.experienced);
            return (
              <TouchableOpacity
                key={chip.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleQuickFilter(chip.id)}
                activeOpacity={0.8}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.resultsHeader}>
          <View style={styles.resultsLeft}>
            {isLoading ? (
              <Text style={styles.resultsText}>Loading doctors...</Text>
            ) : (
              <Text style={styles.resultsText}>
                <Text style={styles.resultsCount}>{filtered.length}</Text> doctors
                found
              </Text>
            )}
            {usingLiveData && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setFilterSheetOpen(true)}
            activeOpacity={0.8}>
            <Icon name="filter-variant" size={16} color={colors.inkHeadline} />
            <Text style={styles.filterBtnText}>Filters</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.list}>
            {Array.from({ length: 4 }).map((_, i) => (
              <DoctorSkeleton key={i} />
            ))}
          </View>
        ) : filtered.length > 0 ? (
          <View style={styles.list}>
            {filtered.map(doctor => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                consultType={category}
                onViewProfile={handleViewProfile}
                onBook={handleBook}
              />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Icon name="doctor" size={48} color={colors.neutral300} />
            <Text style={styles.emptyTitle}>
              {isError ? 'Could not load doctors' : 'No doctors found'}
            </Text>
            <Text style={styles.emptySub}>
              {isError
                ? 'Pull to refresh or try again in a moment.'
                : 'Try another consult type or adjust your search or filters.'}
            </Text>
            <TouchableOpacity
              style={styles.clearFiltersBtn}
              onPress={() => {
                setFilters(DEFAULT_FILTERS);
                setSearch('');
              }}>
              <Text style={styles.clearFiltersText}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <DoctorFilterSheet
        visible={filterSheetOpen}
        filters={filters}
        category={category}
        onChange={setFilters}
        onClear={() => setFilters(DEFAULT_FILTERS)}
        onClose={() => setFilterSheetOpen(false)}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  quickFilters: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  specialtyChips: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
  },
  chipActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral600,
  },
  chipTextActive: {
    color: colors.white,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  resultsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  resultsText: {
    fontSize: 13,
    color: colors.neutral500,
  },
  resultsCount: {
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brandLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.statusSuccess,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.inkHeadline,
  },
  list: {
    gap: 0,
  },
  skeleton: {
    height: 200,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    marginBottom: spacing.lg,
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
    marginTop: spacing.lg,
  },
  emptySub: {
    fontSize: 14,
    color: colors.neutral500,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  clearFiltersBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
});
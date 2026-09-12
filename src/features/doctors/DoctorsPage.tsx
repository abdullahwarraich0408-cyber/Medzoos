import { doctorsBrand } from './doctorsBrand';
import { spacing, radius, TAB_BAR_CLEARANCE } from '../../theme';
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
  DoctorsScreenHeader,
  ConsultTypeTabs,
  DoctorCard,
  DoctorFilterSheet,
} from './components';
import { canPopCurrentStack } from '../../lib/auth/navigation';
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
  { id: 'availableToday' as const, label: 'Available Today', icon: 'calendar-today' },
  { id: 'online' as const, label: 'Video', icon: 'video-outline' },
  { id: 'experienced' as const, label: 'Experienced', icon: 'medal-outline' },
];

function DoctorSkeleton() {
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
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());

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

  const toggleFavorite = useCallback((doctor: Doctor) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(doctor.id)) next.delete(doctor.id);
      else next.add(doctor.id);
      return next;
    });
  }, []);

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

  const activeFilterCount =
    filters.specialties.length +
    (filters.availableToday ? 1 : 0) +
    (filters.online ? 1 : 0) +
    (filters.experienced ? 1 : 0);

  const handleBack = useCallback(() => {
    if (canPopCurrentStack(navigation)) {
      navigation.goBack();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('ConsultHome');
  }, [navigation]);

  return (
    <ScreenLayout
      hideHeader
      embedSafeAreaInChildren
      showSearch={false}
      backgroundColor={doctorsBrand.page}>
      <DoctorsScreenHeader
        title={screenTitle}
        onBackPress={handleBack}
        showBack={canPopCurrentStack(navigation)}
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
            tintColor={doctorsBrand.accent}
            colors={[doctorsBrand.accent]}
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>
          {!initialSpecialty
            ? specialtyOptions.slice(0, 5).map(specialty => {
                const active = filters.specialties.includes(specialty);
                return (
                  <TouchableOpacity
                    key={specialty}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleSpecialtyChip(specialty)}
                    activeOpacity={0.85}>
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}>
                      {specialty}
                    </Text>
                  </TouchableOpacity>
                );
              })
            : null}
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
                activeOpacity={0.85}>
                <Icon
                  name={chip.icon}
                  size={13}
                  color={active ? doctorsBrand.onAccent : doctorsBrand.accent}
                />
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.resultsHeader}>
          <View style={styles.resultsLeft}>
            {isLoading ? (
              <Text style={styles.resultsText}>Finding doctors…</Text>
            ) : (
              <Text style={styles.resultsText}>
                <Text style={styles.resultsCount}>{filtered.length}</Text>{' '}
                {filtered.length === 1 ? 'doctor' : 'doctors'}
              </Text>
            )}
            {usingLiveData ? (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setFilterSheetOpen(true)}
            activeOpacity={0.85}>
            <Icon name="tune-variant" size={16} color={doctorsBrand.accent} />
            <Text style={styles.filterBtnText}>Filters</Text>
            {activeFilterCount > 0 ? (
              <View style={styles.filterCount}>
                <Text style={styles.filterCountText}>{activeFilterCount}</Text>
              </View>
            ) : null}
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
                favorited={favorites.has(doctor.id)}
                onToggleFavorite={toggleFavorite}
                onViewProfile={handleViewProfile}
                onBook={handleBook}
              />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Icon name="doctor" size={32} color={doctorsBrand.accent} />
            </View>
            <Text style={styles.emptyTitle}>
              {isError ? 'Could not load doctors' : 'No doctors found'}
            </Text>
            <Text style={styles.emptySub}>
              {isError
                ? 'Pull to refresh or try again in a moment.'
                : 'Try another consult type, specialty, or clear filters.'}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: TAB_BAR_CLEARANCE,
    gap: 0,
  },
  chipsRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: doctorsBrand.card,
    borderWidth: 1,
    borderColor: doctorsBrand.border,
  },
  chipActive: {
    backgroundColor: doctorsBrand.accent,
    borderColor: doctorsBrand.accent,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: doctorsBrand.ink,
  },
  chipTextActive: {
    color: doctorsBrand.onAccent,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  resultsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  resultsText: {
    fontSize: 13,
    color: doctorsBrand.muted,
  },
  resultsCount: {
    fontWeight: '800',
    color: doctorsBrand.ink,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: doctorsBrand.successSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: doctorsBrand.success,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: doctorsBrand.success,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: doctorsBrand.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: doctorsBrand.border,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: doctorsBrand.ink,
  },
  filterCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: doctorsBrand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: doctorsBrand.onAccent,
  },
  list: {
    gap: spacing.md,
  },
  skeleton: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: doctorsBrand.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: doctorsBrand.border,
    padding: spacing.md,
  },
  skeletonPhoto: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: doctorsBrand.soft,
  },
  skeletonBody: { flex: 1, justifyContent: 'center' },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: doctorsBrand.soft,
  },
  empty: {
    backgroundColor: doctorsBrand.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: doctorsBrand.border,
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: doctorsBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: doctorsBrand.ink,
    marginTop: spacing.lg,
  },
  emptySub: {
    fontSize: 14,
    color: doctorsBrand.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  clearFiltersBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: doctorsBrand.accent,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '700',
    color: doctorsBrand.onAccent,
  },
});

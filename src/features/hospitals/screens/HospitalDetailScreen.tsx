import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { useHospitalDoctors } from '../../../lib/hooks/useApi';
import { DoctorCard } from '../../doctors/components/DoctorCard';
import { ConsultTypeTabs } from '../../doctors/components/ConsultTypeTabs';
import type { ConsultOption } from '../../doctors/utils/consultOptions';
import type { Doctor } from '../../../lib/mappers/doctor';
import type { DoctorsStackParamList, HospitalsStackParamList } from '../../../navigation/types';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';

type DetailRoute = RouteProp<
  DoctorsStackParamList | HospitalsStackParamList,
  'HospitalDetail'
>;
type DetailNav = NativeStackNavigationProp<
  DoctorsStackParamList | HospitalsStackParamList,
  'HospitalDetail'
>;

export function HospitalDetailScreen() {
  const navigation = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const { hospitalId, consultType: initialConsult } = route.params;
  const [consultType, setConsultType] = useState<'online' | 'in_person'>(
    initialConsult ?? 'in_person',
  );
  const [activeSpecialty, setActiveSpecialty] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useHospitalDoctors(hospitalId);
  const hospital = data?.hospital;
  const allDoctors = data?.doctors ?? [];
  const specialties = data?.specialties ?? [];

  const onlineCount = useMemo(
    () => allDoctors.filter(d => d.online).length,
    [allDoctors],
  );

  const filteredDoctors = useMemo(() => {
    let result = allDoctors;
    if (consultType === 'online') {
      result = result.filter(d => d.online);
    }
    if (activeSpecialty !== 'all') {
      result = result.filter(d => d.specialty === activeSpecialty);
    }
    return result;
  }, [allDoctors, activeSpecialty, consultType]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const openProfile = (doctor: Doctor) => {
    navigation.navigate('DoctorProfile', {
      doctorId: doctor.id,
      hospitalId,
      consultType,
    });
  };

  const handleBook = (doctor: Doctor, option: ConsultOption) => {
    navigation.navigate('DoctorBooking', {
      doctorId: doctor.id,
      consultType: option.type,
      practiceLocationId: option.practiceLocationId,
      hospitalId: option.hospitalId ?? hospitalId,
    });
  };

  if (isLoading && !hospital) {
    return (
      <ScreenLayout title="Hospital" headerMode="stack" showSearch={false}>
        <View style={styles.centered}>
          <Text style={styles.muted}>Loading hospital...</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (!hospital) {
    return (
      <ScreenLayout title="Hospital" headerMode="stack" showSearch={false}>
        <View style={styles.centered}>
          <Text style={styles.muted}>Hospital not found</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={hospital.name} headerMode="stack" showSearch={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.hero}>
          <Image source={{ uri: hospital.coverImage }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroBody}>
            <Image source={{ uri: hospital.logo }} style={styles.logo} />
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>{hospital.name}</Text>
              <Text style={styles.heroMeta}>
                {hospital.address ? `${hospital.address}, ` : ''}
                {hospital.city}
              </Text>
            </View>
          </View>
        </View>

        {hospital.description ? (
          <Text style={styles.description}>{hospital.description}</Text>
        ) : null}

        <View style={styles.metaRow}>
          {hospital.phone ? (
            <View style={styles.metaItem}>
              <Icon name="phone" size={14} color={colors.brandPrimary} />
              <Text style={styles.metaText}>{hospital.phone}</Text>
            </View>
          ) : null}
          <View style={styles.metaItem}>
            <Icon name="doctor" size={14} color={colors.brandPrimary} />
            <Text style={styles.metaText}>{hospital.doctorCount} doctors</Text>
          </View>
        </View>

        <ConsultTypeTabs
          value={consultType}
          onChange={setConsultType}
          onlineCount={onlineCount}
        />

        <View style={styles.specialtyHeader}>
          <Text style={styles.sectionTitle}>Select specialty</Text>
          <Text style={styles.sectionHint}>
            {filteredDoctors.length} doctors
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          <Pressable
            style={[styles.chip, activeSpecialty === 'all' && styles.chipActive]}
            onPress={() => setActiveSpecialty('all')}>
            <Text
              style={[
                styles.chipText,
                activeSpecialty === 'all' && styles.chipTextActive,
              ]}>
              All
            </Text>
          </Pressable>
          {specialties.map(specialty => (
            <Pressable
              key={specialty}
              style={[
                styles.chip,
                activeSpecialty === specialty && styles.chipActive,
              ]}
              onPress={() => setActiveSpecialty(specialty)}>
              <Text
                style={[
                  styles.chipText,
                  activeSpecialty === specialty && styles.chipTextActive,
                ]}>
                {specialty}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.specialtyHeader}>
          <Text style={styles.sectionTitle}>Available Doctors</Text>
          <Text style={styles.sectionHint}>
            {filteredDoctors.length} found
          </Text>
        </View>

        {filteredDoctors.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.muted}>
              {consultType === 'online'
                ? 'No doctors available for online consult at this hospital.'
                : 'No doctors match this specialty yet.'}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredDoctors.map(doctor => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                consultType={consultType}
                hospitalContext={hospitalId}
                onViewProfile={openProfile}
                onBook={handleBook}
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
  scrollContent: { padding: spacing.lg, gap: spacing.lg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.neutral500,
  },
  heroCard: {
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
  heroBody: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    padding: spacing.lg,
    minHeight: 180,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.white,
  },
  heroText: { flex: 1 },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.3,
  },
  heroMeta: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  description: {
    ...healthOsTypography.messageBody,
    fontSize: 14,
    color: colors.neutral600,
    lineHeight: 21,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: colors.neutral600, fontWeight: '600' },
  specialtyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { ...healthOsTypography.sectionTitle },
  sectionHint: { fontSize: 12, color: colors.neutral500 },
  chips: { gap: spacing.sm, paddingBottom: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.neutral600 },
  chipTextActive: { color: colors.white },
  list: { gap: spacing.md },
  empty: {
    ...healthOsTypography.messageBody,
    textAlign: 'center',
    color: colors.neutral500,
    paddingVertical: spacing.xl,
  },
});

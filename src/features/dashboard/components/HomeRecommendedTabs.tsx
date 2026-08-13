import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type {
  HomeDoctor,
  HomeLabPackage,
  HomePharmacy,
} from '../../../lib/hooks/useHomeData';
import type { Hospital } from '../../../lib/mappers/hospital';
import { colors, spacing, radius, cardStyles, shadows, appIcons, appIconTile } from '../../../theme';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';

type TabKey = 'doctors' | 'labs' | 'pharmacies' | 'hospitals';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'doctors', label: 'Doctors' },
  { key: 'labs', label: 'Labs' },
  { key: 'pharmacies', label: 'Pharmacies' },
  { key: 'hospitals', label: 'Hospitals' },
];

type HomeRecommendedTabsProps = {
  doctors: HomeDoctor[];
  labPackages: HomeLabPackage[];
  pharmacies: HomePharmacy[];
  hospitals: Hospital[];
  onViewAll: (tab: TabKey) => void;
  onDoctorPress: (id: string) => void;
  onLabPress: (id?: string) => void;
  onPharmacyPress: (pharmacy: HomePharmacy) => void;
  onHospitalPress: (hospital: Hospital) => void;
};

export function HomeRecommendedTabs({
  doctors,
  labPackages,
  pharmacies,
  hospitals,
  onViewAll,
  onDoctorPress,
  onLabPress,
  onPharmacyPress,
  onHospitalPress,
}: HomeRecommendedTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('doctors');

  const hasData =
    (activeTab === 'doctors' && doctors.length > 0) ||
    (activeTab === 'labs' && labPackages.length > 0) ||
    (activeTab === 'pharmacies' && pharmacies.length > 0) ||
    (activeTab === 'hospitals' && hospitals.length > 0);

  if (
    doctors.length === 0 &&
    labPackages.length === 0 &&
    pharmacies.length === 0 &&
    hospitals.length === 0
  ) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Recommended for you</Text>
        {hasData ? (
          <Pressable onPress={() => onViewAll(activeTab)} hitSlop={8}>
            <Text style={styles.viewAll}>See all</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.tabRow}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.cards}>
        {activeTab === 'doctors' &&
          doctors.slice(0, 2).map(doctor => (
            <Pressable
              key={doctor.id}
              style={({ pressed }) => [styles.doctorCard, pressed && cardStyles.pressed]}
              onPress={() => onDoctorPress(doctor.id)}>
              <View style={styles.imageRing}>
                <Image source={{ uri: doctor.image }} style={styles.doctorImg} />
              </View>
              <View style={styles.doctorBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {doctor.name}
                </Text>
                <Text style={styles.cardMeta}>{doctor.specialty}</Text>
                <View style={styles.ratingPill}>
                  <Icon name="star" size={11} color={colors.rating} />
                  <Text style={styles.rating}>{doctor.rating}</Text>
                  <Text style={styles.reviews}>({doctor.reviews})</Text>
                </View>
                <View style={styles.doctorFooter}>
                  <Text style={styles.price}>PKR {doctor.fee.toLocaleString()}</Text>
                  <View style={styles.bookBtn}>
                    <Text style={styles.bookBtnText}>Book</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}

        {activeTab === 'labs' &&
          labPackages.slice(0, 2).map(pkg => (
            <Pressable
              key={pkg.id || pkg.name}
              style={({ pressed }) => [styles.genericCard, pressed && cardStyles.pressed]}
              onPress={() => onLabPress(pkg.id)}>
              <View style={styles.iconWrap}>
                <Icon name="flask" size={appIcons.size.lg} color={appIcons.color} />
              </View>
              <View style={styles.genericBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {pkg.name}
                </Text>
                <Text style={styles.price}>{pkg.price}</Text>
                {pkg.discount ? (
                  <View style={styles.discountPill}>
                    <Text style={styles.discountText}>{pkg.discount}</Text>
                  </View>
                ) : null}
              </View>
              <View style={cardStyles.chevronWrap}>
                <Icon name="chevron-right" size={18} color={colors.neutral500} />
              </View>
            </Pressable>
          ))}

        {activeTab === 'pharmacies' &&
          pharmacies.slice(0, 2).map(pharmacy => (
            <Pressable
              key={pharmacy.id || pharmacy.name}
              style={({ pressed }) => [styles.genericCard, pressed && cardStyles.pressed]}
              onPress={() => onPharmacyPress(pharmacy)}>
              <Image source={{ uri: pharmacy.bgImage }} style={styles.pharmacyThumb} />
              <View style={styles.genericBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {pharmacy.name}
                </Text>
                <View style={styles.ratingPill}>
                  <Icon name="star" size={11} color={colors.rating} />
                  <Text style={styles.rating}>{pharmacy.rating}</Text>
                </View>
                <Text style={styles.cardMeta}>
                  {pharmacy.time} · {pharmacy.distance}
                </Text>
              </View>
              <View style={cardStyles.chevronWrap}>
                <Icon name="chevron-right" size={18} color={colors.neutral500} />
              </View>
            </Pressable>
          ))}

        {activeTab === 'hospitals' &&
          hospitals.slice(0, 2).map(hospital => (
            <Pressable
              key={hospital.id}
              style={({ pressed }) => [styles.genericCard, pressed && cardStyles.pressed]}
              onPress={() => onHospitalPress(hospital)}>
              <Image source={{ uri: hospital.coverImage }} style={styles.pharmacyThumb} />
              <View style={styles.genericBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {hospital.name}
                </Text>
                <Text style={styles.cardMeta}>{hospital.city}</Text>
                <Text style={styles.hospitalDoctors}>
                  {hospital.doctorCount}+ doctors
                </Text>
              </View>
              <View style={cardStyles.chevronWrap}>
                <Icon name="chevron-right" size={18} color={colors.neutral500} />
              </View>
            </Pressable>
          ))}

        {!hasData ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No recommendations yet</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { ...healthOsTypography.sectionTitle },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    ...shadows.cardSoft,
  },
  tabActive: {
    backgroundColor: colors.brandLight,
    borderColor: colors.brandPrimary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral600,
  },
  tabLabelActive: {
    color: colors.brandPrimary,
  },
  cards: { gap: spacing.sm },
  doctorCard: {
    flexDirection: 'row',
    ...cardStyles.premiumSoft,
    padding: spacing.md,
    gap: spacing.md,
  },
  imageRing: {
    padding: 3,
    borderRadius: radius.lg + 3,
    backgroundColor: colors.brandLight,
  },
  doctorImg: {
    width: 68,
    height: 68,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral100,
  },
  doctorBody: { flex: 1, gap: 2 },
  doctorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  genericCard: {
    flexDirection: 'row',
    alignItems: 'center',
    ...cardStyles.premiumSoft,
    padding: spacing.md,
    gap: spacing.md,
  },
  iconWrap: appIconTile('lg'),
  pharmacyThumb: {
    width: 50,
    height: 50,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral100,
  },
  genericBody: { flex: 1, gap: 2 },
  cardTitle: { ...healthOsTypography.messageTitle, fontSize: 14 },
  cardMeta: { fontSize: 12, color: colors.neutral500 },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 3,
    backgroundColor: colors.neutral100,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginTop: 2,
  },
  rating: { fontSize: 11, fontWeight: '700', color: colors.neutral800 },
  reviews: { fontSize: 10, color: colors.neutral500 },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brandPrimary,
  },
  bookBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.buttonEnd,
    ...shadows.cardSoft,
  },
  bookBtnText: { fontSize: 12, fontWeight: '700', color: colors.white },
  discountPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.statusDangerBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  discountText: { fontSize: 10, fontWeight: '700', color: colors.statusDanger },
  hospitalDoctors: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.brandPrimary,
    marginTop: 2,
  },
  empty: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.neutral500,
  },
});

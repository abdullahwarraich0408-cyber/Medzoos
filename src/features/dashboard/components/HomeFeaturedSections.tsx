import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SectionHeader } from '../../home/components/SectionHeader';
import type {
  HomeDoctor,
  HomeLabPackage,
  HomePharmacy,
} from '../../../lib/hooks/useHomeData';
import type { Hospital } from '../../../lib/mappers/hospital';
import { colors, spacing, radius, shadows } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

type HomeFeaturedSectionsProps = {
  doctors: HomeDoctor[];
  labPackages: HomeLabPackage[];
  pharmacies: HomePharmacy[];
  hospitals: Hospital[];
  onViewDoctors: () => void;
  onViewLabs: () => void;
  onViewPharmacies: () => void;
  onViewHospitals: () => void;
  onDoctorPress: (id: string) => void;
  onLabPress: (id?: string) => void;
  onPharmacyPress: (pharmacy: HomePharmacy) => void;
  onHospitalPress: (hospital: Hospital) => void;
};

export function HomeFeaturedSections({
  doctors,
  labPackages,
  pharmacies,
  hospitals,
  onViewDoctors,
  onViewLabs,
  onViewPharmacies,
  onViewHospitals,
  onDoctorPress,
  onLabPress,
  onPharmacyPress,
  onHospitalPress,
}: HomeFeaturedSectionsProps) {
  return (
    <>
      {doctors.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="Top Doctors" onViewAll={onViewDoctors} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}>
            {doctors.map(doctor => (
              <Pressable
                key={doctor.id}
                style={styles.doctorCard}
                onPress={() => onDoctorPress(doctor.id)}>
                <Image source={{ uri: doctor.image }} style={styles.doctorImg} />
                <View style={styles.doctorBody}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {doctor.name}
                  </Text>
                  <Text style={styles.cardMeta}>{doctor.specialty}</Text>
                  <View style={styles.ratingRow}>
                    <Icon name="star" size={12} color={colors.rating} />
                    <Text style={styles.rating}>{doctor.rating}</Text>
                    <Text style={styles.reviews}>({doctor.reviews})</Text>
                  </View>
                  <Text style={styles.price}>PKR {doctor.fee.toLocaleString()}</Text>
                  <View style={styles.miniBtn}>
                    <Text style={styles.miniBtnText}>Book</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {labPackages.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="Popular Lab Tests" onViewAll={onViewLabs} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}>
            {labPackages.map(pkg => (
              <Pressable
                key={pkg.id || pkg.name}
                style={styles.labCard}
                onPress={() => onLabPress(pkg.id)}>
                {pkg.discount ? (
                  <View style={styles.discount}>
                    <Text style={styles.discountText}>{pkg.discount}</Text>
                  </View>
                ) : null}
                <View style={styles.labIcon}>
                  <Icon name="flask" size={22} color="#6366F1" />
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {pkg.name}
                </Text>
                <Text style={styles.price}>{pkg.price}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {pharmacies.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="Nearby Pharmacies" onViewAll={onViewPharmacies} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}>
            {pharmacies.map(pharmacy => (
              <Pressable
                key={pharmacy.id || pharmacy.name}
                style={styles.pharmacyCard}
                onPress={() => onPharmacyPress(pharmacy)}>
                <Image source={{ uri: pharmacy.bgImage }} style={styles.pharmacyImg} />
                <View style={styles.pharmacyBody}>
                  <View
                    style={[
                      styles.statusPill,
                      !pharmacy.open && styles.statusClosed,
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        !pharmacy.open && styles.statusTextClosed,
                      ]}>
                      {pharmacy.open ? 'Open' : 'Closed'}
                    </Text>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {pharmacy.name}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Icon name="star" size={12} color={colors.rating} />
                    <Text style={styles.rating}>{pharmacy.rating}</Text>
                  </View>
                  <Text style={styles.cardMeta}>
                    {pharmacy.time} · {pharmacy.distance}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {hospitals.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="Featured Hospitals" onViewAll={onViewHospitals} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}>
            {hospitals.map(hospital => (
              <Pressable
                key={hospital.id}
                style={styles.hospitalCard}
                onPress={() => onHospitalPress(hospital)}>
                <Image source={{ uri: hospital.coverImage }} style={styles.hospitalCover} />
                <View style={styles.hospitalBody}>
                  <Image source={{ uri: hospital.logo }} style={styles.hospitalLogo} />
                  <View style={styles.hospitalInfo}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {hospital.name}
                    </Text>
                    <Text style={styles.cardMeta}>{hospital.city}</Text>
                    <Text style={styles.hospitalDoctors}>
                      {hospital.doctorCount}+ doctors
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  row: { gap: spacing.md, paddingBottom: spacing.xs },
  doctorCard: {
    width: 280,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 0,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.card,
  },
  doctorImg: {
    width: 76,
    height: 76,
    borderRadius: radius.lg,
    backgroundColor: colors.brandMist,
  },
  doctorBody: { flex: 1 },
  labCard: {
    width: 188,
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 0,
    padding: spacing.md,
    ...shadows.card,
  },
  discount: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.statusDanger,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    zIndex: 1,
  },
  discountText: { fontSize: 9, fontWeight: '700', color: colors.white },
  labIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  pharmacyCard: {
    width: 248,
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 0,
    overflow: 'hidden',
    ...shadows.card,
  },
  pharmacyImg: { width: '100%', height: 112, backgroundColor: colors.brandMist },
  pharmacyBody: { padding: spacing.md, gap: 4 },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginBottom: 4,
  },
  statusClosed: { backgroundColor: colors.neutral100 },
  statusText: { fontSize: 10, fontWeight: '700', color: '#15803D' },
  statusTextClosed: { color: colors.neutral500 },
  hospitalCard: {
    width: 236,
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 0,
    overflow: 'hidden',
    ...shadows.card,
  },
  hospitalCover: { width: '100%', height: 96, backgroundColor: colors.brandMist },
  hospitalBody: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  hospitalLogo: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brandLight,
  },
  hospitalInfo: { flex: 1 },
  hospitalDoctors: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.brandPrimary,
    marginTop: 4,
  },
  cardTitle: { ...healthOsTypography.messageTitle, fontSize: 14 },
  cardMeta: { fontSize: 12, color: colors.neutral500, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  rating: { fontSize: 12, fontWeight: '700', color: colors.neutral800 },
  reviews: { fontSize: 11, color: colors.neutral500 },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brandPrimary,
    marginTop: 4,
  },
  miniBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.buttonEnd,
  },
  miniBtnText: { fontSize: 11, fontWeight: '700', color: colors.white },
});

import { colors, spacing, radius, shadows, TAB_BAR_CLEARANCE, appIcons, appIconTile } from '../../theme';
import { healthOs } from '../../theme/healthOs';
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
  RefreshControl,
  TextInput,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../components/layout/ScreenLayout';
import { SectionHeader } from './components/SectionHeader';
import { FollowUpRecommendedCard } from './components/FollowUpRecommendedCard';
import { PROMO_BANNERS, SERVICE_CARDS } from './data/homeData';
import { useHomeData } from '../../lib/hooks/useHomeData';

import type { DrawerParamList, DoctorsStackParamList, MainTabParamList } from '../../navigation/types';

const { width: SCREEN_W } = Dimensions.get('window');
const HERO_W = Math.min(SCREEN_W * 0.88, 340);
const CARD_W = 260;
const DOCTOR_W = 280;
const TEST_W = 200;
const HOSPITAL_W = 240;

type HomeNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  DrawerNavigationProp<DrawerParamList>
>;

export function HomePage() {
  const navigation = useNavigation<HomeNav>();
  const {
    nearbyPharmacies,
    featuredDoctors,
    labPackages,
    featuredHospitals,
    isLoading,
    isRefreshing,
    refetch,
  } = useHomeData();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const goToTab = (tab: keyof MainTabParamList) => {
    navigation.navigate(tab);
  };

  const goToHealth = (
    screen: string,
    params?: object,
  ) => {
    navigation.navigate('Health', { screen, params } as never);
  };

  const goToConsult = (
    screen: string,
    params?: object,
  ) => {
    navigation.navigate('Home', {
      screen: 'Services',
      params: { screen, params },
    } as never);
  };

  const goToDrawer = (screen: keyof DrawerParamList) => {
    navigation.getParent()?.navigate(screen);
  };

  const goToDoctor = (doctorId?: string) => {
    if (doctorId) {
      goToConsult('DoctorBooking', { doctorId, consultType: 'online' });
    } else {
      goToConsult('DoctorsList');
    }
  };

  const goToLabTest = (testId?: string) => {
    if (testId) {
      goToConsult('LabTestBooking', { testId });
    } else {
      goToConsult('LabTestsList');
    }
  };

  const handleSearchSubmit = () => {
    goToHealth('MedicinesList');
  };

  const handleServicePress = (card: any) => {
    if (card.healthScreen) {
      goToHealth(card.healthScreen);
      return;
    }
    if (card.servicesScreen) {
      goToConsult(card.servicesScreen);
      return;
    }
    if (card.consultScreen) {
      goToConsult(card.consultScreen);
      return;
    }
    if (card.tab) {
      goToTab(card.tab);
      return;
    }
    if (card.drawer) {
      goToDrawer(card.drawer);
    }
  };

  const handlePromoPress = (banner: any) => {
    if (banner.healthScreen) {
      goToHealth(banner.healthScreen);
      return;
    }
    if (banner.servicesScreen) {
      goToConsult(banner.servicesScreen);
      return;
    }
    if (banner.consultScreen) {
      goToConsult(banner.consultScreen);
      return;
    }
    if (banner.tab) {
      goToTab(banner.tab);
    }
  };

  return (
    <ScreenLayout title="Home" showSearch={false} showCart={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || (isRefreshing && !isLoading)}
            onRefresh={onRefresh}
            tintColor={colors.brandPrimary}
            colors={[colors.brandPrimary]}
          />
        }>
        {/* Search */}
        <View style={styles.searchBar}>
          <View style={styles.searchIconTile}>
            <Icon name="magnify" size={20} color={colors.brandPrimary} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines, doctors, lab tests..."
            placeholderTextColor={colors.neutral500}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && Platform.OS === 'android' ? (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Icon name="close-circle" size={18} color={colors.neutral500} />
            </Pressable>
          ) : (
            <View style={styles.searchFilterBadge}>
              <Icon name="tune-variant" size={18} color={colors.brandPrimary} />
            </View>
          )}
        </View>

        {/* Hero Banner */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.heroRow}
          snapToInterval={HERO_W + spacing.md}
          decelerationRate="fast">
          {PROMO_BANNERS.map(banner => (
            <TouchableOpacity
              key={banner.id}
              style={[styles.heroCard, { backgroundColor: banner.bg }]}
              onPress={() => handlePromoPress(banner)}
              activeOpacity={0.92}>
              <View style={styles.heroContent}>
                <Text style={[styles.heroTitle, { color: banner.titleColor }]}>
                  {banner.title}
                </Text>
                <Text style={styles.heroSubtitle}>{banner.subtitle}</Text>
                {banner.code ? (
                  <Text style={styles.heroCode}>{banner.code}</Text>
                ) : null}
                <View style={[styles.heroBtn, { backgroundColor: banner.btnColor }]}>
                  <Text
                    style={[
                      styles.heroBtnText,
                      { color: banner.btnTextColor ?? colors.textPrimary },
                    ]}>
                    {banner.cta}
                  </Text>
                </View>
              </View>
              <Image source={{ uri: banner.image }} style={styles.heroImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.quickGrid}>
          {SERVICE_CARDS.map(card => (
            <Pressable
              key={card.id}
              style={({ pressed }) => [
                styles.quickCard,
                { backgroundColor: card.bg },
                pressed && styles.quickCardPressed,
              ]}
              onPress={() => handleServicePress(card)}>
              <View style={styles.quickIcon}>
                <Icon name={card.icon} size={22} color={appIcons.color} />
              </View>
              <Text style={styles.quickTitle} numberOfLines={1}>
                {card.title}
              </Text>
              <Text style={styles.quickSub} numberOfLines={2}>
                {card.subtitle}
              </Text>
            </Pressable>
          ))}
        </View>

        <FollowUpRecommendedCard
          onOpenAppointments={() =>
            navigation.navigate('You', {
              screen: 'Appointments',
            } as never)
          }
        />

        {/* Featured Doctors */}
        <SectionHeader
          title="Featured Doctors"
          linkLabel="View All"
          onViewAll={() => goToTab('Consult')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalRow}>
          {featuredDoctors.map(doctor => (
            <TouchableOpacity
              key={doctor.id}
              style={styles.doctorCard}
              onPress={() => goToDoctor(doctor.id)}
              activeOpacity={0.9}>
              <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
              <View style={styles.doctorBody}>
                <Text style={styles.doctorName} numberOfLines={1}>
                  {doctor.name}
                </Text>
                <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                <View style={styles.ratingRow}>
                  <Icon name="star" size={13} color={colors.rating} />
                  <Text style={styles.ratingText}>{doctor.rating}</Text>
                  <Text style={styles.reviewsText}>({doctor.reviews})</Text>
                </View>
                <Text style={styles.doctorFee}>
                  PKR {doctor.fee.toLocaleString()}
                </Text>
                <View style={styles.bookBtn}>
                  <Text style={styles.bookBtnText}>Book Now</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Tests */}
        <SectionHeader
          title="Popular Tests"
          linkLabel="View All"
          onViewAll={() => goToConsult('LabTestsList')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalRow}>
          {labPackages.map(pkg => (
            <TouchableOpacity
              key={pkg.id || pkg.name}
              style={styles.testCard}
              onPress={() => goToLabTest(pkg.id)}
              activeOpacity={0.9}>
              {pkg.discount ? (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{pkg.discount}</Text>
                </View>
              ) : null}
              <View style={styles.testIconWrap}>
                <Icon name="flask" size={22} color={colors.brandPrimary} />
              </View>
              <Text style={styles.testName} numberOfLines={2}>
                {pkg.name}
              </Text>
              {pkg.tests.slice(0, 2).map(test => (
                <Text key={test} style={styles.testMeta} numberOfLines={1}>
                  • {test}
                </Text>
              ))}
              <Text style={styles.testPrice}>{pkg.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Nearby Pharmacies */}
        <SectionHeader
          title="Nearby Pharmacies"
          linkLabel="View All"
          onViewAll={() => goToDrawer('Pharmacies')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalRow}>
          {nearbyPharmacies.map(pharmacy => (
            <TouchableOpacity
              key={pharmacy.name}
              style={styles.pharmacyCard}
              onPress={() => goToDrawer('Pharmacies')}
              activeOpacity={0.9}>
              <View style={styles.pharmacyImageWrap}>
                <Image source={{ uri: pharmacy.bgImage }} style={styles.pharmacyImage} />
                <View
                  style={[
                    styles.openBadge,
                    !pharmacy.open && styles.closedBadge,
                  ]}>
                  <Text
                    style={[
                      styles.openBadgeText,
                      !pharmacy.open && styles.closedBadgeText,
                    ]}>
                    {pharmacy.open ? 'Open' : 'Closed'}
                  </Text>
                </View>
              </View>
              <View style={styles.pharmacyBody}>
                <Text style={styles.pharmacyName} numberOfLines={1}>
                  {pharmacy.name}
                </Text>
                <View style={styles.ratingRow}>
                  <Icon name="star" size={13} color={colors.rating} />
                  <Text style={styles.ratingText}>{pharmacy.rating}</Text>
                  <Text style={styles.reviewsText}>({pharmacy.reviews})</Text>
                </View>
                <Text style={styles.pharmacyMeta}>
                  {pharmacy.time} • {pharmacy.distance}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Hospitals */}
        <SectionHeader
          title="Featured Hospitals"
          linkLabel="View All"
          onViewAll={() => goToDrawer('Hospitals')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalRow}>
          {featuredHospitals.map(hospital => (
            <TouchableOpacity
              key={hospital.id}
              style={styles.hospitalCard}
              onPress={() => goToDrawer('Hospitals')}
              activeOpacity={0.9}>
              <Image source={{ uri: hospital.coverImage }} style={styles.hospitalCover} />
              <View style={styles.hospitalBody}>
                <Image source={{ uri: hospital.logo }} style={styles.hospitalLogo} />
                <View style={styles.hospitalInfo}>
                  <Text style={styles.hospitalName} numberOfLines={2}>
                    {hospital.name}
                  </Text>
                  <Text style={styles.hospitalCity} numberOfLines={1}>
                    {hospital.city}
                  </Text>
                  <Text style={styles.hospitalDoctors}>
                    {hospital.doctorCount}+ Doctors
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: TAB_BAR_CLEARANCE,
    gap: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 52,
    marginTop: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(91, 130, 156, 0.18)',
    ...shadows.card,
  },
  searchIconTile: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(91, 130, 156, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral900,
    padding: 0,
  },
  searchFilterBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(91, 130, 156, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRow: {
    gap: spacing.md,
    paddingRight: spacing.sm,
  },
  heroCard: {
    width: HERO_W,
    flexDirection: 'row',
    borderRadius: radius.xl,
    overflow: 'hidden',
    minHeight: 168,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    ...shadows.card,
  },
  heroContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: colors.neutral600,
    lineHeight: 18,
  },
  heroCode: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral600,
    marginTop: 6,
  },
  heroBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  heroBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroImage: {
    width: 100,
    height: '100%',
    minHeight: 168,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: -spacing.sm,
  },
  quickCard: {
    width: (SCREEN_W - spacing.lg * 2 - spacing.md) / 2,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 120,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    ...shadows.card,
  },
  quickCardPressed: {
    opacity: 0.92,
  },
  quickIcon: {
    ...appIconTile('md'),
    marginBottom: spacing.sm,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: 2,
  },
  quickSub: {
    fontSize: 11,
    color: colors.neutral600,
    lineHeight: 15,
  },
  horizontalRow: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
    marginTop: -spacing.sm,
  },
  doctorCard: {
    width: DOCTOR_W,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.card,
  },
  doctorImage: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.neutral100,
  },
  doctorBody: {
    flex: 1,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 2,
  },
  doctorFee: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brandPrimary,
    marginTop: 4,
  },
  bookBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
  },
  bookBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  testCard: {
    width: TEST_W,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.md,
    ...shadows.card,
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.statusDanger,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    zIndex: 1,
  },
  discountText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
  },
  testIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brandMist,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  testName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: 4,
    paddingRight: spacing.lg,
  },
  testMeta: {
    fontSize: 11,
    color: colors.neutral500,
    marginBottom: 2,
  },
  testPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.brandPrimary,
    marginTop: spacing.sm,
  },
  pharmacyCard: {
    width: CARD_W,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    overflow: 'hidden',
    ...shadows.card,
  },
  pharmacyImageWrap: {
    height: 120,
    backgroundColor: colors.neutral100,
  },
  pharmacyImage: {
    width: '100%',
    height: '100%',
  },
  openBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  closedBadge: {
    backgroundColor: colors.neutral100,
  },
  openBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.statusSuccess,
  },
  closedBadgeText: {
    color: colors.neutral500,
  },
  pharmacyBody: {
    padding: spacing.md,
  },
  pharmacyName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: 4,
  },
  pharmacyMeta: {
    fontSize: 11,
    color: colors.neutral500,
    marginTop: 4,
  },
  hospitalCard: {
    width: HOSPITAL_W,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    overflow: 'hidden',
    ...shadows.card,
  },
  hospitalCover: {
    width: '100%',
    height: 100,
    backgroundColor: colors.neutral100,
  },
  hospitalBody: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  hospitalLogo: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.neutral100,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkHeadline,
    lineHeight: 17,
  },
  hospitalCity: {
    fontSize: 11,
    color: colors.neutral500,
    marginTop: 2,
  },
  hospitalDoctors: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.brandPrimary,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral800,
  },
  reviewsText: {
    fontSize: 11,
    color: colors.neutral500,
  },
});
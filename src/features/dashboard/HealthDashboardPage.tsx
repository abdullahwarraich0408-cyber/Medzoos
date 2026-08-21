import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../components/layout/ScreenLayout';
import { HomeGreeting } from './components/HomeGreeting';
import { HomePromoCarousel } from './components/HomePromoCarousel';
import { HomeCategoriesRow } from './components/HomeCategoriesRow';
import {
  HomeRecentVisits,
  type HomeRecentVisit,
} from './components/HomeRecentVisits';
import { HomeCheckupSchedule } from './components/HomeCheckupSchedule';
import { HomeCareActions } from './components/HomeCareActions';
import { HomeCampaignBanners } from './components/HomeCampaignBanners';
import { useNotifications } from '../../lib/notifications';
import { useHomeNavigation } from './hooks/useHomeNavigation';
import { useHomeDashboardData } from './hooks/useHomeDashboardData';
import { useHomePromoSlides } from './hooks/useHomePromoSlides';
import { openAppDrawer } from '../../lib/auth/navigation';
import type { HomePromoSlide } from '../home/data/homeData';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../theme';
import { calmLayout } from '../../theme/calmLayout';

function formatVisitDate(value?: string) {
  if (!value) return 'Recent visit';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function HealthDashboardPage() {
  const { user, firstName, health, refetchAll } = useHomeDashboardData();
  const { slides, refetch: refetchSlides } = useHomePromoSlides();
  const nav = useHomeNavigation();
  const { unreadCount } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchAll(), refetchSlides()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchAll, refetchSlides]);

  const doctorOrders = useMemo(
    () => (health.allOrders || []).filter(order => order.type === 'doctor'),
    [health.allOrders],
  );

  const upcomingDoctorOrders = useMemo(
    () =>
      doctorOrders.filter(
        order =>
          order.status === 'pending' ||
          order.status === 'processing' ||
          order.rawStatus === 'confirmed' ||
          order.rawStatus === 'in_progress',
      ),
    [doctorOrders],
  );

  const recentVisits = useMemo((): HomeRecentVisit[] => {
    return doctorOrders
      .filter(order => {
        if (order.status === 'cancelled' || order.rawStatus === 'cancelled') {
          return false;
        }
        if (
          order.status === 'pending' ||
          order.status === 'processing' ||
          order.rawStatus === 'confirmed' ||
          order.rawStatus === 'in_progress'
        ) {
          return false;
        }
        return (
          order.status === 'delivered' ||
          order.rawStatus === 'completed' ||
          Boolean(order.sortDate || order.date)
        );
      })
      .sort((a, b) => {
        const ta = new Date(a.sortDate || a.date || 0).getTime();
        const tb = new Date(b.sortDate || b.date || 0).getTime();
        return tb - ta;
      })
      .slice(0, 4)
      .map(order => ({
        id: order.id,
        name: order.vendor || 'Doctor visit',
        specialty: order.specialty || order.title || 'Consultation',
        image: order.items?.[0]?.img,
        dateLabel: formatVisitDate(order.sortDate || order.date),
        modeLabel:
          order.consultationMode === 'online' || order.isOnline
            ? 'Online consultation'
            : 'Clinic visit',
      }));
  }, [doctorOrders]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      nav.goToServicesScreen('DoctorsList', { screenTitle: `Search: ${searchQuery.trim()}` });
    } else {
      nav.goToServicesScreen('DoctorsList');
    }
  };

  const handleContentAction = (action: string) => {
    switch (action) {
      case 'prescription':
        nav.goToDrawer('Prescriptions');
        break;
      case 'doctors':
        nav.goToServicesScreen('DoctorsList', { consultType: 'online' });
        break;
      case 'clinic':
        nav.goToServicesScreen('DoctorsList', { consultType: 'in_person' });
        break;
      case 'meds':
      case 'medicines':
        nav.goToHealth('MedicinesList');
        break;
      case 'pharmacy':
      case 'pharmacies':
        nav.goToPharmacies();
        break;
      case 'labs':
      case 'lab_tests':
      case 'lab':
        nav.goToServicesScreen('LabTestsList');
        break;
      case 'packages':
      case 'health_packages':
        nav.goToServicesScreen('HealthPackages');
        break;
      case 'hospitals':
        nav.goToHospitals();
        break;
      case 'copilot':
        nav.goToCopilot();
        break;
      case 'orders':
        nav.goToOrders();
        break;
      case 'family':
      case 'family_health':
        nav.goToHealth('FamilyProfiles');
        break;
      case 'records':
      case 'medical_records':
        nav.goToHealth('MedicalRecords');
        break;
      default:
        nav.goToServicesScreen('DoctorsList');
        break;
    }
  };

  const handleHeroSlide = (slide: HomePromoSlide) => {
    handleContentAction(slide.action);
  };

  return (
    <ScreenLayout hideHeader>
      <View style={styles.topBar}>
        <HomeGreeting
          firstName={firstName}
          fullName={user?.name}
          avatarUrl={user?.avatar}
          unreadCount={unreadCount}
          onProfilePress={() =>
            nav.navigation.getParent()?.navigate('You', { screen: 'Profile' })
          }
          onMenuPress={() => openAppDrawer(nav.navigation)}
          onNotificationsPress={() => nav.goToNotifications()}
        />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.heroBlock}>
          <View style={styles.searchBlock}>
            <Text style={styles.searchLabel}>Looking for Doctors?</Text>
            <Pressable style={styles.searchBar} onPress={handleSearch}>
              <Icon name="magnify" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or department"
                placeholderTextColor={colors.textDisabled}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </Pressable>
          </View>

          <HomePromoCarousel slides={slides} onPressSlide={handleHeroSlide} />
        </View>

        <HomeCareActions onAction={handleContentAction} />
        <HomeCampaignBanners onAction={handleContentAction} />

        <HomeCategoriesRow
          onPressCategory={category =>
            nav.goToServicesScreen('DoctorsList', {
              specialty: category.specialty,
            })
          }
        />

        <HomeRecentVisits
          visits={recentVisits}
          onSeeAll={nav.goToAppointments}
          onVisitPress={() => nav.goToAppointments()}
          onEmptyCta={() => nav.goToServicesScreen('DoctorsList')}
        />

        <HomeCheckupSchedule
          doctorOrders={upcomingDoctorOrders}
          labBookings={health.upcomingBookings}
          onSeeAll={nav.goToAppointments}
          onItemPress={() => nav.goToAppointments()}
        />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: calmLayout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    paddingHorizontal: calmLayout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: TAB_BAR_CLEARANCE + calmLayout.contentBottom,
    gap: calmLayout.sectionGap,
  },
  heroBlock: {
    gap: 0,
  },
  searchBlock: {
    gap: 6,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
  },
});

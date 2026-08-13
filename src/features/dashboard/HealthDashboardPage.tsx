import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  RefreshControl,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../components/layout/ScreenLayout';
import { HomeGreeting } from './components/HomeGreeting';
import { HomeDiscountBanner } from './components/HomeDiscountBanner';
import { HomeCategoriesRow } from './components/HomeCategoriesRow';
import { HomeRecentVisits } from './components/HomeRecentVisits';
import { HomeCheckupSchedule } from './components/HomeCheckupSchedule';
import { useNotifications } from '../../lib/notifications';
import { useHomeNavigation } from './hooks/useHomeNavigation';
import { useHomeDashboardData } from './hooks/useHomeDashboardData';
import { openAppDrawer } from '../../lib/auth/navigation';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../theme';
import { calmLayout } from '../../theme/calmLayout';

export function HealthDashboardPage() {
  const { user, firstName, health, homeData, refetchAll } = useHomeDashboardData();
  const nav = useHomeNavigation();
  const { unreadCount } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchAll();
    } finally {
      setRefreshing(false);
    }
  }, [refetchAll]);

  const doctorOrders = useMemo(
    () => (health.allOrders || []).filter(order => order.type === 'doctor'),
    [health.allOrders],
  );

  const handleSearch = () => {
    nav.goToServicesScreen('DoctorsList');
  };

  return (
    <ScreenLayout hideHeader>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
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

        <View style={styles.searchBlock}>
          <Text style={styles.searchLabel}>Looking for Doctors?</Text>
          <Pressable style={styles.searchBar} onPress={handleSearch}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or department"
              placeholderTextColor={colors.textDisabled}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <Icon name="magnify" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        <HomeDiscountBanner
          onPress={() => nav.goToServicesScreen('DoctorsList')}
        />

        <HomeCategoriesRow
          onPressCategory={category =>
            nav.goToServicesScreen('DoctorsList', {
              specialty: category.specialty,
            })
          }
        />

        <HomeRecentVisits
          doctors={homeData.featuredDoctors}
          onSeeAll={() => nav.goToServicesScreen('DoctorsList')}
          onDoctorPress={id => nav.goToDoctorProfile(id)}
          onBookPress={id => nav.goToDoctorBooking(id)}
        />

        <HomeCheckupSchedule
          doctorOrders={doctorOrders}
          labBookings={health.upcomingBookings}
          onSeeAll={nav.goToAppointments}
          onItemPress={() => nav.goToAppointments()}
        />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    paddingHorizontal: calmLayout.screenPadding,
    paddingTop: spacing.xs,
    paddingBottom: TAB_BAR_CLEARANCE + calmLayout.contentBottom,
    gap: calmLayout.sectionGap,
  },
  searchBlock: {
    gap: spacing.sm,
  },
  searchLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? spacing.lg : spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    padding: 0,
  },
});

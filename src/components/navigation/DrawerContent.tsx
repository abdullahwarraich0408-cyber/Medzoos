import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../lib/auth/AuthContext';
import { useLocationContext } from '../../lib/location/LocationContext';
import { navigateToSignIn, dispatchFromDrawer } from '../../lib/auth/navigation';
import { colors, spacing, radius, typography } from '../../theme';
import type { DoctorsStackParamList, MainTabParamList } from '../../navigation/types';

type DrawerItem = {
  label: string;
  icon: string;
  route: string;
  tabRoute?: keyof MainTabParamList;
  stackScreen?: string;
  healthScreen?: 'MedicinesList' | 'FamilyProfiles';
  consultScreen?: keyof Pick<
    DoctorsStackParamList,
    'DoctorsList' | 'HospitalsList' | 'Specialties' | 'ConsultHome' | 'LabTestsList' | 'HealthPackages'
  >;
  badge?: string;
  badgeColor?: string;
};

const PRIMARY_ITEMS: DrawerItem[] = [
  {
    label: 'Dashboard',
    icon: 'view-dashboard',
    route: 'MainTabs',
    tabRoute: 'Home',
    stackScreen: 'Dashboard',
  },
  {
    label: 'Health Copilot',
    icon: 'robot',
    route: 'MainTabs',
    tabRoute: 'Copilot',
    stackScreen: 'CopilotHome',
  },
  {
    label: 'Health OS',
    icon: 'heart-pulse',
    route: 'MainTabs',
    tabRoute: 'Health',
    stackScreen: 'HealthHome',
  },
  {
    label: 'Community',
    icon: 'account-group',
    route: 'MainTabs',
    tabRoute: 'Community',
    stackScreen: 'CommunityHome',
  },
  {
    label: 'Medicines',
    icon: 'pill',
    route: 'MainTabs',
    tabRoute: 'Health',
    healthScreen: 'MedicinesList',
  },
  {
    label: 'Family Health',
    icon: 'account-heart',
    route: 'MainTabs',
    tabRoute: 'Health',
    healthScreen: 'FamilyProfiles',
  },
  {
    label: 'Doctors',
    icon: 'stethoscope',
    route: 'MainTabs',
    tabRoute: 'Home',
    consultScreen: 'DoctorsList',
  },
  {
    label: 'Lab Tests',
    icon: 'flask',
    route: 'MainTabs',
    tabRoute: 'Home',
    consultScreen: 'LabTestsList',
  },
  { label: 'Pharmacies', icon: 'store', route: 'Pharmacies', stackScreen: 'PharmaciesList' },
  { label: 'Hospitals', icon: 'hospital-building', route: 'Hospitals', stackScreen: 'HospitalsList' },
];

const SECONDARY_ITEMS: DrawerItem[] = [
  {
    label: 'Offers',
    icon: 'tag',
    route: 'Offers',
    badge: 'HOT',
    badgeColor: colors.statusDanger,
  },
  {
    label: 'My Orders',
    icon: 'package-variant',
    route: 'MainTabs',
    tabRoute: 'You',
    stackScreen: 'OrdersList',
  },
  { label: 'Prescriptions', icon: 'file-document-outline', route: 'Prescriptions' },
  { label: 'Help Center', icon: 'help-circle-outline', route: 'Help' },
  { label: 'Contact Us', icon: 'phone-outline', route: 'Contact' },
];

function buildDrawerAction(item: DrawerItem) {
  if (item.tabRoute) {
    if (item.healthScreen) {
      return CommonActions.navigate({
        name: 'MainTabs',
        params: {
          screen: item.tabRoute,
          params: { screen: item.healthScreen },
        },
        merge: false,
      });
    }

    if (item.consultScreen) {
      return CommonActions.navigate({
        name: 'MainTabs',
        params: {
          screen: item.tabRoute,
          params: {
            screen: 'Services',
            params: { screen: item.consultScreen },
          },
        },
        merge: false,
      });
    }

    if (item.stackScreen) {
      return CommonActions.navigate({
        name: 'MainTabs',
        params: {
          screen: item.tabRoute,
          params: { screen: item.stackScreen },
        },
        merge: false,
      });
    }

    return CommonActions.navigate({
      name: 'MainTabs',
      params: { screen: item.tabRoute },
      merge: false,
    });
  }

  if (item.stackScreen) {
    return CommonActions.navigate({
      name: item.route,
      params: { screen: item.stackScreen },
      merge: false,
    });
  }

  return CommonActions.navigate({
    name: item.route,
    merge: false,
  });
}

export function DrawerContent({ navigation, state }: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, logout } = useAuth();
  const { location, requestLocationDetection } = useLocationContext();

  const navigateTo = (item: DrawerItem) => {
    dispatchFromDrawer(navigation, buildDrawerAction(item));
    navigation.closeDrawer();
  };

  const isActive = (item: DrawerItem) => {
    const current = state.routes[state.index]?.name;

    if (item.tabRoute) {
      if (current !== 'MainTabs') return false;
      const tabState = state.routes.find(r => r.name === 'MainTabs')?.state;
      const activeTab = tabState?.routes[tabState.index ?? 0]?.name;
      if (activeTab !== item.tabRoute) return false;

      if (item.stackScreen || item.healthScreen || item.consultScreen) {
        const stackState = tabState?.routes[tabState.index ?? 0]?.state;
        const activeStack = stackState?.routes[stackState.index ?? 0]?.name;
        if (item.healthScreen) return activeStack === item.healthScreen;
        if (item.consultScreen) {
          const servicesState = stackState?.routes.find(r => r.name === 'Services')?.state;
          const activeService = servicesState?.routes[servicesState.index ?? 0]?.name;
          return activeStack === 'Services' && activeService === item.consultScreen;
        }
        return activeStack === item.stackScreen;
      }

      return true;
    }

    if (item.stackScreen) {
      if (current !== item.route) return false;
      const stackState = state.routes[state.index]?.state;
      const activeStack = stackState?.routes[stackState.index ?? 0]?.name;
      return activeStack === item.stackScreen;
    }

    return current === item.route;
  };

  const renderItem = (item: DrawerItem) => {
    const active = isActive(item);
    return (
      <TouchableOpacity
        key={item.label}
        style={[styles.menuItem, active && styles.menuItemActive]}
        onPress={() => navigateTo(item)}
        activeOpacity={0.7}>
        <View style={[styles.menuIconWrap, active && styles.menuIconWrapActive]}>
          <Icon
            name={item.icon}
            size={20}
            color={active ? colors.brandPrimary : colors.neutral600}
          />
        </View>
        <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>
          {item.label}
        </Text>
        {item.badge && (
          <View style={[styles.badge, { backgroundColor: item.badgeColor }]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        {active && <View style={styles.activeBar} />}
      </TouchableOpacity>
    );
  };

  const handleAuthPress = () => {
    navigation.closeDrawer();
    if (isAuthenticated) {
      Alert.alert('Sign out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => logout() },
      ]);
      return;
    }
    navigateToSignIn(navigation);
  };

  const displayName = isAuthenticated ? user?.name || 'User' : 'Guest User';
  const profileSub = isAuthenticated
    ? user?.email || 'Manage your health journey'
    : 'Sign in for full access';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.profileHeader}>
        <View style={styles.profileGradient}>
          <View style={styles.avatar}>
            <Icon name="account" size={32} color={colors.brandPrimary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {isAuthenticated ? `Hi, ${displayName.split(' ')[0]}!` : displayName}
            </Text>
            <Text style={styles.profileSub}>{profileSub}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.authBtn}
          onPress={handleAuthPress}
          activeOpacity={0.8}>
          <Icon
            name={isAuthenticated ? 'logout' : 'login'}
            size={18}
            color={colors.white}
          />
          <Text style={styles.authBtnText}>
            {isAuthenticated ? 'Sign Out' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Browse</Text>
        {PRIMARY_ITEMS.map(renderItem)}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Quick Links</Text>
        {SECONDARY_ITEMS.map(renderItem)}

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.locationCard}
          activeOpacity={0.7}
          onPress={() => {
            navigation.closeDrawer();
            requestLocationDetection();
          }}>
          <Icon name="map-marker-radius" size={22} color={colors.brandPrimary} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle} numberOfLines={2}>
              Delivering to {location}
            </Text>
            <Text style={styles.locationSub}>Tap to refresh exact location</Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.neutral500} />
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <View style={styles.footerLogo}>
          <Icon name="medical-bag" size={16} color={colors.brandPrimary} />
          <Text style={styles.footerBrand}>
            Pharma<Text style={styles.footerAccent}>Hub</Text>
          </Text>
        </View>
        <Text style={styles.footerTagline}>Your trusted healthcare partner</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceBase,
  },
  profileHeader: {
    backgroundColor: colors.brandLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  profileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${colors.brandPrimary}30`,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.subtitle,
    color: colors.inkHeadline,
    fontSize: 16,
  },
  profileSub: {
    ...typography.caption,
    color: colors.neutral600,
    marginTop: 2,
  },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brandPrimary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  authBtnText: {
    ...typography.subtitle,
    color: colors.white,
    fontSize: 14,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.neutral500,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.sm,
    borderRadius: radius.md,
    position: 'relative',
    overflow: 'hidden',
  },
  menuItemActive: {
    backgroundColor: colors.brandLight,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuIconWrapActive: {
    backgroundColor: `${colors.brandPrimary}18`,
  },
  menuLabel: {
    ...typography.body,
    color: colors.neutral800,
    fontWeight: '500',
    flex: 1,
  },
  menuLabelActive: {
    color: colors.brandPrimary,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginRight: spacing.sm,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: '20%',
    bottom: '20%',
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.brandPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral200,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.brandMist,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.brandPrimary}20`,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    ...typography.subtitle,
    color: colors.inkHeadline,
    fontSize: 13,
  },
  locationSub: {
    ...typography.caption,
    color: colors.neutral500,
    marginTop: 2,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    alignItems: 'center',
  },
  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerBrand: {
    ...typography.subtitle,
    color: colors.inkHeadline,
  },
  footerAccent: {
    color: colors.brandPrimary,
  },
  footerTagline: {
    ...typography.caption,
    color: colors.neutral500,
    marginTop: spacing.xs,
  },
});

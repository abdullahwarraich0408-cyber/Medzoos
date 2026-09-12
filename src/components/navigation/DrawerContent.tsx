import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../lib/auth/AuthContext';
import { useLocationContext } from '../../lib/location/LocationContext';
import { navigateToSignIn, dispatchFromDrawer } from '../../lib/auth/navigation';
import { spacing, radius } from '../../theme';
import type { DoctorsStackParamList, MainTabParamList } from '../../navigation/types';

/** Drawer brand — same teal as Home / Doctors (#105568). */
const drawerBrand = {
  ink: '#0C4554',
  accent: '#105568',
  accentSoft: '#176B7D',
  soft: '#E4F0F3',
  mist: '#C5DCE2',
  page: '#FFFFFF',
  card: '#FFFFFF',
  muted: '#5B7A85',
  border: 'rgba(16, 85, 104, 0.14)',
  onAccent: '#FFFFFF',
  danger: '#B42318',
} as const;

type DrawerItem = {
  label: string;
  icon: string;
  route: string;
  tabRoute?: keyof MainTabParamList;
  stackScreen?: string;
  healthScreen?: 'MedicinesList' | 'FamilyProfiles';
  consultScreen?: keyof Pick<
    DoctorsStackParamList,
    | 'DoctorsList'
    | 'HospitalsList'
    | 'Specialties'
    | 'ConsultHome'
    | 'LabTestsList'
    | 'HealthPackages'
  >;
  badge?: string;
  badgeColor?: string;
};

const PRIMARY_ITEMS: DrawerItem[] = [
  {
    label: 'Dashboard',
    icon: 'view-dashboard-outline',
    route: 'MainTabs',
    tabRoute: 'Home',
    stackScreen: 'Dashboard',
  },
  {
    label: 'Health Copilot',
    icon: 'robot-outline',
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
    icon: 'account-group-outline',
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
    icon: 'account-heart-outline',
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
    icon: 'flask-outline',
    route: 'MainTabs',
    tabRoute: 'Home',
    consultScreen: 'LabTestsList',
  },
  {
    label: 'Pharmacies',
    icon: 'storefront-outline',
    route: 'Pharmacies',
    stackScreen: 'PharmaciesList',
  },
  {
    label: 'Hospitals',
    icon: 'hospital-building',
    route: 'Hospitals',
    stackScreen: 'HospitalsList',
  },
];

const SECONDARY_ITEMS: DrawerItem[] = [
  {
    label: 'Offers',
    icon: 'tag-outline',
    route: 'Offers',
    badge: 'HOT',
    badgeColor: drawerBrand.danger,
  },
  {
    label: 'My Orders',
    icon: 'package-variant-closed',
    route: 'MainTabs',
    tabRoute: 'You',
    stackScreen: 'OrdersList',
  },
  {
    label: 'Prescriptions',
    icon: 'file-document-outline',
    route: 'Prescriptions',
  },
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

export function DrawerContent({
  navigation,
  state,
}: DrawerContentComponentProps) {
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
          const servicesState = stackState?.routes.find(
            r => r.name === 'Services',
          )?.state;
          const activeService =
            servicesState?.routes[servicesState.index ?? 0]?.name;
          return (
            activeStack === 'Services' &&
            activeService === item.consultScreen
          );
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
        activeOpacity={0.75}>
        {active ? <View style={styles.activeBar} /> : null}
        <View
          style={[styles.menuIconWrap, active && styles.menuIconWrapActive]}>
          <Icon
            name={item.icon}
            size={18}
            color={active ? drawerBrand.onAccent : drawerBrand.accent}
          />
        </View>
        <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>
          {item.label}
        </Text>
        {item.badge ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: item.badgeColor || drawerBrand.danger },
            ]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        ) : null}
        <Icon
          name="chevron-right"
          size={16}
          color={active ? drawerBrand.accentSoft : drawerBrand.mist}
        />
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

  const displayName = isAuthenticated ? user?.name || 'User' : 'Guest';
  const firstName = displayName.split(' ')[0];
  const profileSub = isAuthenticated
    ? user?.email || 'Manage your health journey'
    : 'Sign in for full access';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.profileHeader}>
        <View style={styles.headerOrb} />
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Icon name="account" size={28} color={drawerBrand.accent} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileKicker}>Welcome</Text>
            <Text style={styles.profileName} numberOfLines={1}>
              {isAuthenticated ? `Hi, ${firstName}!` : 'Guest'}
            </Text>
            <Text style={styles.profileSub} numberOfLines={1}>
              {profileSub}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.authBtn}
          onPress={handleAuthPress}
          activeOpacity={0.85}>
          <Icon
            name={isAuthenticated ? 'logout' : 'login'}
            size={16}
            color={drawerBrand.onAccent}
          />
          <Text style={styles.authBtnText}>
            {isAuthenticated ? 'Sign out' : 'Sign in'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Browse</Text>
        <View style={styles.menuGroup}>{PRIMARY_ITEMS.map(renderItem)}</View>

        <Text style={[styles.sectionTitle, styles.sectionGap]}>Quick links</Text>
        <View style={styles.menuGroup}>{SECONDARY_ITEMS.map(renderItem)}</View>

        <TouchableOpacity
          style={styles.locationCard}
          activeOpacity={0.8}
          onPress={() => {
            navigation.closeDrawer();
            requestLocationDetection();
          }}>
          <View style={styles.locationIcon}>
            <Icon
              name="map-marker-radius"
              size={18}
              color={drawerBrand.onAccent}
            />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle} numberOfLines={2}>
              Delivering to {location}
            </Text>
            <Text style={styles.locationSub}>Tap to refresh location</Text>
          </View>
          <Icon name="chevron-right" size={18} color={drawerBrand.muted} />
        </TouchableOpacity>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.md) },
        ]}>
        <View style={styles.footerLogo}>
          <View style={styles.footerMark}>
            <Icon name="plus" size={14} color={drawerBrand.onAccent} />
          </View>
          <Text style={styles.footerBrand}>Medzoos</Text>
        </View>
        <Text style={styles.footerTagline}>
          Your trusted healthcare partner
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: drawerBrand.page,
  },
  profileHeader: {
    backgroundColor: drawerBrand.accent,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    overflow: 'hidden',
  },
  headerOrb: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: drawerBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  profileKicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.72)',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
    color: drawerBrand.onAccent,
  },
  profileSub: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.78)',
  },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    paddingVertical: 11,
    borderRadius: radius.pill,
  },
  authBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: drawerBrand.onAccent,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: drawerBrand.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionGap: {
    marginTop: spacing.md,
  },
  menuGroup: {
    paddingHorizontal: spacing.sm,
    gap: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: spacing.sm,
    borderRadius: 14,
    position: 'relative',
    overflow: 'hidden',
    gap: 10,
  },
  menuItemActive: {
    backgroundColor: drawerBrand.soft,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: drawerBrand.card,
    borderWidth: 1,
    borderColor: drawerBrand.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconWrapActive: {
    backgroundColor: drawerBrand.accent,
    borderColor: drawerBrand.accent,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: drawerBrand.ink,
  },
  menuLabelActive: {
    color: drawerBrand.accent,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: drawerBrand.onAccent,
    letterSpacing: 0.3,
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderRadius: 2,
    backgroundColor: drawerBrand.accent,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: 12,
    backgroundColor: drawerBrand.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: drawerBrand.border,
    ...Platform.select({
      ios: {
        shadowColor: drawerBrand.ink,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: drawerBrand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
    minWidth: 0,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: drawerBrand.ink,
  },
  locationSub: {
    fontSize: 11,
    fontWeight: '500',
    color: drawerBrand.muted,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: drawerBrand.border,
    alignItems: 'center',
    backgroundColor: drawerBrand.card,
    gap: 4,
  },
  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerMark: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: drawerBrand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBrand: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    color: drawerBrand.ink,
  },
  footerTagline: {
    fontSize: 11,
    fontWeight: '500',
    color: drawerBrand.muted,
  },
});

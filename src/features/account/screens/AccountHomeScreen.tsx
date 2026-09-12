import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useNotifications } from '../../../lib/notifications';
import {
  navigateToTabScreen,
  navigateToServices,
  navigateToMainTabs,
} from '../../../lib/auth/navigation';
import { useOpenAppDrawer } from '../../../lib/auth/useOpenAppDrawer';
import { CollapsibleSection, PrimaryAction, SimpleRow } from '../../../design-system';
import { youCopy } from '../../../lib/copy/uiMessages';
import { YouProfileHeader } from '../components/YouProfileHeader';
import { YouLinkSection } from '../components/YouLinkSection';
import { AccountSettingsGroup } from '../components/AccountSettingsGroup';
import { EmergencySupportStrip } from '../components/EmergencySupportStrip';
import type { YouStackParamList } from '../../../navigation/types';
import {
  ACCOUNT_QUICK_LINKS,
  YOU_ACTIVITY_LINKS,
  YOU_PROFILE_ACTIONS,
  ACCOUNT_SETTINGS,
} from '../data/accountData';
import { spacing, TAB_BAR_CLEARANCE } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';
import { youBrand } from '../youBrand';

type AccountNav = NativeStackNavigationProp<YouStackParamList>;

function AccountHomeLoading() {
  return (
    <ScreenLayout
      hideHeader
      backgroundColor={youBrand.page}
      embedSafeAreaInChildren>
      <View style={styles.center}>
        <ActivityIndicator size="large" color={youBrand.accent} />
      </View>
    </ScreenLayout>
  );
}

type GuestAccountHomeProps = {
  navigation: AccountNav;
  drawerNavigation: ReturnType<typeof useNavigation>;
  openDrawer: () => void;
  onNotifications: () => void;
  unreadCount: number;
};

function GuestAccountHome({
  navigation,
  drawerNavigation,
  openDrawer,
  onNotifications,
  unreadCount,
}: GuestAccountHomeProps) {
  const handleQuickLink = (item: (typeof ACCOUNT_QUICK_LINKS)[number]) => {
    if (item.tab === 'You') {
      navigation.navigate(item.screen as 'OrdersList');
      return;
    }
    if ('viaServices' in item && item.viaServices) {
      navigateToServices(drawerNavigation, item.screen);
      return;
    }
    if (item.screen === 'ServicesHub') {
      navigateToTabScreen(drawerNavigation, 'Home', 'ServicesHub');
      return;
    }
    navigateToTabScreen(drawerNavigation, item.tab, item.screen);
  };

  return (
    <ScreenLayout
      hideHeader
      backgroundColor={youBrand.page}
      embedSafeAreaInChildren>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <YouProfileHeader
          displayName="Guest"
          isVerified={false}
          onEditProfile={() => navigation.navigate('SignIn')}
          onFamilyMembers={() => navigation.navigate('SignIn')}
          onBackPress={() =>
            navigateToMainTabs(drawerNavigation, 'Home', 'Dashboard')
          }
        />

        <View style={styles.body}>
          <Text style={styles.guestTitle}>{youCopy.guestTitle}</Text>
          <Text style={styles.guestSubtitle}>{youCopy.guestMessage}</Text>

          <View style={styles.actions}>
            <PrimaryAction
              icon="login"
              title="Sign in"
              onPress={() => navigation.navigate('SignIn')}
            />
            <PrimaryAction
              icon="account-plus-outline"
              title="Create account"
              onPress={() => navigation.navigate('Register')}
              variant="neutral"
            />
          </View>

          <CollapsibleSection title="Browse without signing in">
            {ACCOUNT_QUICK_LINKS.map(item => (
              <SimpleRow
                key={item.id}
                icon={item.icon}
                iconColor={item.iconColor}
                title={item.title}
                message={item.subtitle}
                onPress={() => handleQuickLink(item)}
              />
            ))}
          </CollapsibleSection>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

type AuthenticatedAccountHomeProps = {
  navigation: AccountNav;
  drawerNavigation: ReturnType<typeof useNavigation>;
  displayName: string;
  isVerified: boolean;
  onLogout: () => void;
  openDrawer: () => void;
  onNotifications: () => void;
  unreadCount: number;
};

function AuthenticatedAccountHome({
  navigation,
  drawerNavigation,
  displayName,
  isVerified,
  onLogout,
  openDrawer,
  onNotifications,
  unreadCount,
}: AuthenticatedAccountHomeProps) {
  const handleActivityPress = (item: (typeof YOU_ACTIVITY_LINKS)[number]) => {
    if (item.tab === 'You') {
      navigation.navigate(item.screen as 'OrdersList' | 'Appointments');
      return;
    }
    navigateToTabScreen(drawerNavigation, item.tab, item.screen);
  };

  const handleProfileAction = (item: (typeof YOU_PROFILE_ACTIONS)[number]) => {
    if (item.tab === 'You') {
      navigation.navigate(item.screen);
      return;
    }
    navigateToTabScreen(drawerNavigation, item.tab, item.screen);
  };

  const handleEmergency = () => {
    drawerNavigation.getParent()?.navigate('Copilot', {
      screen: 'CopilotHome',
      params: { initialPrompt: 'emergency' },
    });
  };

  const handleSettingsPress = (item: (typeof ACCOUNT_SETTINGS)[number]) => {
    navigation.navigate(item.screen);
  };

  return (
    <ScreenLayout
      hideHeader
      backgroundColor={youBrand.page}
      embedSafeAreaInChildren>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <YouProfileHeader
          displayName={displayName}
          isVerified={isVerified}
          onEditProfile={() => handleProfileAction(YOU_PROFILE_ACTIONS[0])}
          onFamilyMembers={() => handleProfileAction(YOU_PROFILE_ACTIONS[1])}
          onBackPress={() =>
            navigateToMainTabs(drawerNavigation, 'Home', 'Dashboard')
          }
        />

        <View style={styles.body}>
          <YouLinkSection
            title="My activity"
            items={YOU_ACTIVITY_LINKS}
            onPressItem={item => {
              const link = YOU_ACTIVITY_LINKS.find(l => l.id === item.id);
              if (link) handleActivityPress(link);
            }}
          />

          <AccountSettingsGroup onPressItem={handleSettingsPress} />

          <EmergencySupportStrip onPress={handleEmergency} />

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={onLogout}
            activeOpacity={0.85}>
            <Icon name="logout" size={18} color={youBrand.danger} />
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

export function AccountHomeScreen() {
  const navigation = useNavigation<AccountNav>();
  const drawerNavigation = useNavigation();
  const openDrawer = useOpenAppDrawer();
  const { unreadCount } = useNotifications();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const displayName = user?.name || 'Guest';

  const handleNotifications = useCallback(() => {
    navigateToTabScreen(navigation, 'You', 'Notifications');
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  if (isLoading) {
    return <AccountHomeLoading />;
  }

  if (!isAuthenticated) {
    return (
      <GuestAccountHome
        navigation={navigation}
        drawerNavigation={drawerNavigation}
        openDrawer={openDrawer}
        onNotifications={handleNotifications}
        unreadCount={unreadCount}
      />
    );
  }

  return (
    <AuthenticatedAccountHome
      navigation={navigation}
      drawerNavigation={drawerNavigation}
      displayName={displayName}
      isVerified={user?.isVerified ?? false}
      onLogout={handleLogout}
      openDrawer={openDrawer}
      onNotifications={handleNotifications}
      unreadCount={unreadCount}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: youBrand.page,
  },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    paddingBottom: TAB_BAR_CLEARANCE + calmLayout.contentBottom,
    gap: spacing.lg,
  },
  body: {
    paddingHorizontal: calmLayout.screenPadding,
    gap: spacing.lg,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: youBrand.ink,
    letterSpacing: -0.3,
  },
  guestSubtitle: {
    fontSize: 15,
    color: youBrand.muted,
    lineHeight: 22,
    fontWeight: '500',
  },
  actions: { gap: calmLayout.blockGap },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: youBrand.danger,
    backgroundColor: youBrand.card,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: youBrand.danger,
  },
});

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { useAuth } from '../../../lib/auth/AuthContext';
import {
  navigateToTabScreen,
  navigateToServices,
} from '../../../lib/auth/navigation';
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
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';
import { healthOsTypography } from '../../../theme/healthOs';

type AccountNav = NativeStackNavigationProp<YouStackParamList>;

function AccountHomeLoading() {
  return (
    <ScreenLayout title="You" showSearch={false} showCart={false}>
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brandPrimary} />
      </View>
    </ScreenLayout>
  );
}

type GuestAccountHomeProps = {
  navigation: AccountNav;
  drawerNavigation: ReturnType<typeof useNavigation>;
};

function GuestAccountHome({ navigation, drawerNavigation }: GuestAccountHomeProps) {
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
    <ScreenLayout title="You" showSearch={false} showCart={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.guestTitle}>{youCopy.guestTitle}</Text>
        <Text style={styles.guestSubtitle}>{youCopy.guestMessage}</Text>

        <View style={styles.actions}>
          <PrimaryAction
            icon="login"
            title="Sign in with phone"
            onPress={() => navigation.navigate('PhoneSignIn')}
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
};

function AuthenticatedAccountHome({
  navigation,
  drawerNavigation,
  displayName,
  isVerified,
  onLogout,
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
    <ScreenLayout title="You" showSearch={false} showCart={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <YouProfileHeader
          displayName={displayName}
          isVerified={isVerified}
          onEditProfile={() => handleProfileAction(YOU_PROFILE_ACTIONS[0])}
          onFamilyMembers={() => handleProfileAction(YOU_PROFILE_ACTIONS[1])}
        />

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
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}

export function AccountHomeScreen() {
  const navigation = useNavigation<AccountNav>();
  const drawerNavigation = useNavigation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const displayName = user?.name || 'Guest';

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
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
  },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    padding: calmLayout.screenPadding,
    paddingBottom: TAB_BAR_CLEARANCE + calmLayout.contentBottom,
    gap: calmLayout.sectionGap,
  },
  guestTitle: {
    ...healthOsTypography.greeting,
    fontSize: 24,
    color: colors.ink900,
  },
  guestSubtitle: {
    fontSize: 15,
    color: colors.neutral600,
    lineHeight: 22,
  },
  actions: { gap: calmLayout.blockGap },
  logoutBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.statusDanger,
    backgroundColor: colors.white,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.statusDanger,
  },
});

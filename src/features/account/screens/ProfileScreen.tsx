import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useAccountHomeData } from '../hooks/useAccountHomeData';
import type { AccountStackParamList } from '../../../navigation/types';
import type { UserProfile } from '../../../lib/api';
import type { ProfileData } from '../../../lib/profile/profileData';
import { ProfileSummaryCard } from '../components/ProfileSummaryCard';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';

type ProfileContentProps = {
  profileUser?: UserProfile | null;
  profileData: ProfileData;
  familyHealthScore?: number | null;
  familyMemberCount: number;
};

function ProfileContent({
  profileUser,
  profileData,
  familyHealthScore,
  familyMemberCount,
}: ProfileContentProps) {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList>>();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) },
      ]}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.subtitle}>
        Your personal information and health summary at a glance.
      </Text>

      <ProfileSummaryCard
        user={profileUser}
        profileData={profileData}
        familyHealthScore={familyHealthScore}
        familyMemberCount={familyMemberCount}
      />

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate('Settings')}
        activeOpacity={0.85}>
        <Text style={styles.editBtnText}>Edit Profile & Security</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export function ProfileScreen() {
  const { isAuthenticated } = useAuth();
  const { profileUser, profileData, familyScore, familyCount } =
    useAccountHomeData(isAuthenticated);

  return (
    <ScreenLayout headerMode="stack" title="Profile" showSearch={false}>
      <RequireAuthGate
        title="Sign in to view profile"
        subtitle="Access your personal information after signing in."
        icon="account-circle-outline">
        <ProfileContent
          profileUser={profileUser}
          profileData={profileData}
          familyHealthScore={familyScore}
          familyMemberCount={familyCount}
        />
      </RequireAuthGate>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg },
  subtitle: {
    fontSize: 14,
    color: colors.neutral500,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  editBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});

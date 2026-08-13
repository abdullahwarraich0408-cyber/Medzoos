import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { useAuth } from '../../../lib/auth/AuthContext';
import {
  navigateToPhoneSignIn,
  navigateToSignIn,
} from '../../../lib/auth/navigation';
import { colors, spacing, radius } from '../../../theme';

type RequireAuthGateProps = {
  title: string;
  subtitle: string;
  icon?: string;
  children: React.ReactNode;
};

export function RequireAuthGate({
  title,
  subtitle,
  icon = 'lock-outline',
  children,
}: RequireAuthGateProps) {
  const navigation = useNavigation();
  const { isAuthenticated, isLoading } = useAuth();

  const goToPhoneSignIn = () => navigateToPhoneSignIn(navigation);
  const goToSignIn = () => navigateToSignIn(navigation);

  if (isLoading) {
    return (
      <ScreenLayout title={title} showSearch={false} showCart={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brandPrimary} />
        </View>
      </ScreenLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenLayout title={title} showSearch={false} showCart={false}>
        <View style={styles.gate}>
        <View style={[styles.iconCircle, { backgroundColor: `${colors.brandPrimary}15` }]}>
          <Icon name={icon} size={40} color={colors.brandPrimary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <TouchableOpacity style={styles.btn} onPress={goToPhoneSignIn} activeOpacity={0.85}>
          <Icon name="phone" size={18} color={colors.white} />
          <Text style={styles.btnText}>Continue with Phone OTP</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToSignIn} activeOpacity={0.7} style={styles.secondaryBtn}>
          <Text style={styles.link}>Sign in with email</Text>
        </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  gate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.inkHeadline,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral500,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 21,
    marginBottom: spacing.xl,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    marginBottom: spacing.md,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  secondaryBtn: {
    marginTop: spacing.sm,
  },
});

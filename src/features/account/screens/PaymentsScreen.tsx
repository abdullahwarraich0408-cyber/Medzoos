import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import { useProfileData } from '../../../lib/hooks/useApi';
import type { PaymentMethod } from '../../../lib/profile/profileData';
import { PaymentMethodCard } from '../components/PaymentMethodCard';
import { AccountEmptyState } from '../components/AccountEmptyState';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';

const DEFAULT_PAYMENTS: PaymentMethod[] = [
  {
    id: 'cod',
    type: 'cod',
    label: 'Cash on Delivery',
    isDefault: true,
  },
];

function PaymentsContent() {
  const insets = useSafeAreaInsets();
  const { data: profileData, isLoading } = useProfileData();
  const savedMethods = profileData.paymentMethods ?? [];
  const methods: PaymentMethod[] =
    savedMethods.length > 0 ? savedMethods : DEFAULT_PAYMENTS;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) },
      ]}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.subtitle}>
        Manage cards and payment methods for orders and bookings.
      </Text>

      <View style={styles.codBanner}>
        <Icon name="cash" size={20} color={colors.statusSuccess} />
        <Text style={styles.codText}>
          Cash on delivery is available for medicines and lab tests across
          Pakistan.
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.brandPrimary}
          style={styles.loader}
        />
      ) : methods.length === 0 ? (
        <AccountEmptyState
          icon="credit-card-outline"
          title="No payment methods"
          subtitle="Add payment methods from your account on web."
        />
      ) : (
        methods.map(method => (
          <PaymentMethodCard key={method.id} method={method} />
        ))
      )}
    </ScrollView>
  );
}

export function PaymentsScreen() {
  return (
    <ScreenLayout headerMode="stack" title="Payments" showSearch={false}>
      <RequireAuthGate
        title="Sign in to view payments"
        subtitle="Manage your payment methods after signing in."
        icon="credit-card-outline">
        <PaymentsContent />
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
  codBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.statusSuccessBg,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  codText: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral600,
    lineHeight: 18,
  },
  loader: { marginVertical: spacing.xxxl },
});

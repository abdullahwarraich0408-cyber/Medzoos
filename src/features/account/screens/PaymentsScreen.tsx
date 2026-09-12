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
import { paymentsBrand } from '../accountScreenBrands';
import { spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';

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
        { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) + spacing.lg },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Icon name="wallet-outline" size={22} color={paymentsBrand.accent} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.pageTitle}>Wallet & payments</Text>
          <Text style={styles.subtitle}>
            Methods used for orders and bookings.
          </Text>
        </View>
      </View>

      <View style={styles.codBanner}>
        <View style={styles.codIcon}>
          <Icon name="cash-fast" size={20} color={paymentsBrand.success} />
        </View>
        <View style={styles.codBody}>
          <Text style={styles.codTitle}>Cash on delivery</Text>
          <Text style={styles.codText}>
            Available for medicines and lab tests across Pakistan.
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Saved methods</Text>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={paymentsBrand.accent}
          style={styles.loader}
        />
      ) : methods.length === 0 ? (
        <AccountEmptyState
          icon="credit-card-outline"
          title="No payment methods"
          subtitle="Add cards from your account on web, or use cash on delivery."
        />
      ) : (
        <View style={styles.list}>
          {methods.map(method => (
            <PaymentMethodCard key={method.id} method={method} />
          ))}
        </View>
      )}

      <View style={styles.note}>
        <Icon name="shield-check-outline" size={16} color={paymentsBrand.accent} />
        <Text style={styles.noteText}>
          Card details are stored securely. Medzoos never shows full card numbers
          in the app.
        </Text>
      </View>
    </ScrollView>
  );
}

export function PaymentsScreen() {
  return (
    <ScreenLayout
      headerMode="stack"
      title="Payments"
      showSearch={false}
      backgroundColor={paymentsBrand.page}>
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: paymentsBrand.card,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: paymentsBrand.border,
    padding: spacing.md,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: paymentsBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1, minWidth: 0, gap: 2 },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: paymentsBrand.ink,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: paymentsBrand.muted,
  },
  codBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: paymentsBrand.successSoft,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  codIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: paymentsBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codBody: { flex: 1, gap: 2 },
  codTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: paymentsBrand.success,
  },
  codText: {
    fontSize: 13,
    color: paymentsBrand.ink,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: paymentsBrand.ink,
  },
  list: { gap: spacing.sm },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: paymentsBrand.soft,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: paymentsBrand.muted,
  },
  loader: { marginVertical: spacing.xxxl },
});

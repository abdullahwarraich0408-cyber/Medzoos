import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import { useAddresses, useDeleteAddress } from '../../../lib/hooks/useApi';
import { AddressCard } from '../components/AddressCard';
import { AccountEmptyState } from '../components/AccountEmptyState';
import { addressesBrand } from '../accountScreenBrands';
import { spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';

function AddressesContent() {
  const insets = useSafeAreaInsets();
  const { data: addresses = [], isLoading } = useAddresses();
  const deleteAddress = useDeleteAddress();

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
          <Icon name="map-marker-radius" size={22} color={addressesBrand.onAccent} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.pageTitle}>Your places</Text>
          <Text style={styles.subtitle}>
            Delivery and sample-collection addresses.
          </Text>
        </View>
        {addresses.length > 0 ? (
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{addresses.length}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.tip}>
        <Icon name="information-outline" size={16} color={addressesBrand.accent} />
        <Text style={styles.tipText}>
          Addresses saved at checkout or on web appear here.
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={addressesBrand.accent}
          style={styles.loader}
        />
      ) : addresses.length === 0 ? (
        <AccountEmptyState
          icon="map-marker-outline"
          title="No saved addresses"
          subtitle="Add an address during medicine or lab checkout to see it here."
        />
      ) : (
        <View style={styles.list}>
          {addresses.map(address => (
            <AddressCard
              key={address.id}
              address={address}
              onDelete={() => deleteAddress.mutate(address.id)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

export function AddressesScreen() {
  return (
    <ScreenLayout
      headerMode="stack"
      title="Addresses"
      showSearch={false}
      backgroundColor={addressesBrand.page}>
      <RequireAuthGate
        title="Sign in to view addresses"
        subtitle="Manage your delivery addresses after signing in."
        icon="map-marker-outline">
        <AddressesContent />
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
    backgroundColor: addressesBrand.accent,
    borderRadius: radius.xxl,
    padding: spacing.md,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1, minWidth: 0, gap: 2 },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: addressesBrand.onAccent,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.82)',
  },
  countPill: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: addressesBrand.onAccent,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: addressesBrand.soft,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: addressesBrand.ink,
  },
  list: { gap: spacing.sm },
  loader: { marginVertical: spacing.xxxl },
});

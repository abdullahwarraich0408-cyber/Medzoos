import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import { useAddresses, useDeleteAddress } from '../../../lib/hooks/useApi';
import { AddressCard } from '../components/AddressCard';
import { AccountEmptyState } from '../components/AccountEmptyState';
import { colors, spacing, TAB_BAR_CLEARANCE } from '../../../theme';

function AddressesContent() {
  const insets = useSafeAreaInsets();
  const { data: addresses = [], isLoading } = useAddresses();
  const deleteAddress = useDeleteAddress();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) },
      ]}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.subtitle}>
        Saved addresses for medicine delivery and lab sample collection.
      </Text>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.brandPrimary}
          style={styles.loader}
        />
      ) : addresses.length === 0 ? (
        <AccountEmptyState
          icon="map-marker-outline"
          title="No saved addresses"
          subtitle="Addresses you save during checkout or on web will appear here."
        />
      ) : (
        addresses.map(address => (
          <AddressCard
            key={address.id}
            address={address}
            onDelete={() => deleteAddress.mutate(address.id)}
          />
        ))
      )}
    </ScrollView>
  );
}

export function AddressesScreen() {
  return (
    <ScreenLayout headerMode="stack" title="Addresses" showSearch={false}>
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
  content: { padding: spacing.lg },
  subtitle: {
    fontSize: 14,
    color: colors.neutral500,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  loader: { marginVertical: spacing.xxxl },
});

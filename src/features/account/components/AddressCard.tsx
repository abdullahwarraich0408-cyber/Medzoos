import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Address } from '../../../lib/api';
import { addressesBrand } from '../accountScreenBrands';
import { spacing, radius } from '../../../theme';

type AddressCardProps = {
  address: Address;
  onDelete?: () => void;
};

export function AddressCard({ address, onDelete }: AddressCardProps) {
  const handleDelete = () => {
    Alert.alert('Delete address', 'Remove this saved address?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.pin}>
        <Icon name="map-marker" size={20} color={addressesBrand.onAccent} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{address.name || 'Address'}</Text>
          {address.is_default ? (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.street}>{address.street}</Text>
        <Text style={styles.city}>
          {[address.city, address.country, address.postal_code]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
      {onDelete ? (
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Icon name="trash-can-outline" size={18} color={addressesBrand.danger} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: addressesBrand.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: addressesBrand.border,
    padding: spacing.md,
  },
  pin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: addressesBrand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: addressesBrand.ink,
  },
  defaultBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: addressesBrand.soft,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '700',
    color: addressesBrand.accent,
    textTransform: 'uppercase',
  },
  street: {
    fontSize: 14,
    color: addressesBrand.muted,
    marginTop: 4,
    lineHeight: 20,
  },
  city: {
    fontSize: 12,
    color: addressesBrand.muted,
    marginTop: 2,
  },
  deleteBtn: {
    padding: spacing.xs,
    borderRadius: 10,
    backgroundColor: addressesBrand.dangerSoft,
  },
});

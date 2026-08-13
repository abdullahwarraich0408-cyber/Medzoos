import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Address } from '../../../lib/api';


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
      <View style={styles.iconWrap}>
        <Icon name="map-marker" size={22} color={colors.brandPrimary} />
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
          <Icon name="trash-can-outline" size={18} color={colors.statusDanger} />
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
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  defaultBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
    textTransform: 'uppercase',
  },
  street: {
    fontSize: 14,
    color: colors.neutral600,
    marginTop: 4,
    lineHeight: 20,
  },
  city: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 2,
  },
  deleteBtn: { padding: spacing.xs },
});
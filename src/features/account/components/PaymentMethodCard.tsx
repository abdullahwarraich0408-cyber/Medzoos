import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PaymentMethod } from '../../../lib/profile/profileData';
import { paymentsBrand } from '../accountScreenBrands';
import { spacing, radius } from '../../../theme';

type PaymentMethodCardProps = {
  method: PaymentMethod;
};

export function PaymentMethodCard({ method }: PaymentMethodCardProps) {
  const isCod = method.type === 'cod';
  const isCard = method.type === 'card' || (!method.type && !isCod);

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, isCod && styles.iconCod]}>
        <Icon
          name={isCod ? 'cash' : isCard ? 'credit-card-outline' : 'wallet-outline'}
          size={22}
          color={isCod ? paymentsBrand.success : paymentsBrand.accent}
        />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.label}>{method.label}</Text>
          {method.isDefault ? (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          ) : null}
        </View>
        {method.expiry ? (
          <Text style={styles.meta}>Expires {method.expiry}</Text>
        ) : (
          <Text style={styles.meta}>
            {isCod
              ? 'Pay when your order arrives'
              : 'Saved for checkout'}
          </Text>
        )}
      </View>
      <Icon name="check-circle" size={18} color={paymentsBrand.mist} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: paymentsBrand.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: paymentsBrand.border,
    padding: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: paymentsBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCod: {
    backgroundColor: paymentsBrand.successSoft,
  },
  body: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: paymentsBrand.ink,
  },
  defaultBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: paymentsBrand.accent,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '700',
    color: paymentsBrand.onAccent,
    textTransform: 'uppercase',
  },
  meta: {
    fontSize: 12,
    color: paymentsBrand.muted,
    marginTop: 4,
  },
});

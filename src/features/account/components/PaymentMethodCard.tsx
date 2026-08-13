import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PaymentMethod } from '../../../lib/profile/profileData';


type PaymentMethodCardProps = {
  method: PaymentMethod;
};

export function PaymentMethodCard({ method }: PaymentMethodCardProps) {
  const isCard = method.type === 'card' || !method.type;

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Icon
          name={isCard ? 'credit-card' : 'wallet'}
          size={22}
          color={colors.brandPrimary}
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
          <Text style={styles.expiry}>Expires {method.expiry}</Text>
        ) : (
          <Text style={styles.expiry}>Cash on delivery supported</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  defaultBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.brandLight,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brandPrimary,
    textTransform: 'uppercase',
  },
  expiry: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 4,
  },
});
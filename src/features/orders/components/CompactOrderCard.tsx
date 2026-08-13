import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { HubOrderView } from '../data/orderModel';
import {
  formatHubOrderRef,
  getStatusBadgeColor,
} from '../data/orderModel';
import { colors, spacing, radius, cardStyles, appIcons, appIconTile } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

type CompactOrderCardProps = {
  order: HubOrderView;
  onPress: () => void;
  compact?: boolean;
};

export function CompactOrderCard({ order, onPress, compact = false }: CompactOrderCardProps) {
  const statusColor = getStatusBadgeColor(order.status);
  const showAmount =
    order.amount &&
    order.amount > 0 &&
    (order.lifecycle === 'active'
      ? order.orderType !== 'doctor_appointment' || order.status === 'pending'
      : true);

  const dateLine = `${order.date} · ${formatHubOrderRef(order.orderId)}`;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Icon name={order.icon} size={appIcons.size.md} color={appIcons.color} />
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {order.lifecycle === 'active' ? getDisplayTitle(order) : order.title}
        </Text>
        <View style={[styles.badge, { backgroundColor: `${statusColor}18` }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {order.statusLabel}
          </Text>
        </View>
      </View>

      <Text style={styles.provider} numberOfLines={2}>
        {order.providerName}
      </Text>

      <Text style={styles.dateLine}>{dateLine}</Text>

      {!compact && order.lifecycle === 'active' ? (
        <Text style={styles.nextStep}>{order.nextStep}</Text>
      ) : null}

      {order.lifecycle === 'cancelled' && order.refundStatus ? (
        <Text style={styles.nextStep}>{order.refundStatus}</Text>
      ) : null}
      {order.lifecycle === 'cancelled' && order.cancelReason ? (
        <Text style={styles.dateLine}>{order.cancelReason}</Text>
      ) : null}

      <View style={styles.footer}>
        {showAmount ? (
          <Text style={styles.amount}>PKR {order.amount!.toLocaleString()}</Text>
        ) : (
          <View style={styles.amountSpacer} />
        )}
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
          onPress={onPress}>
          <Text style={styles.actionText}>{order.actionLabel}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function getDisplayTitle(order: HubOrderView): string {
  if (order.orderType === 'medicine_order') return 'Medicine Order';
  if (order.orderType === 'lab_test') return 'Lab Test';
  if (order.orderType === 'doctor_appointment') return 'Doctor Appointment';
  if (order.orderType === 'hospital_booking') return 'Hospital Booking';
  return order.title;
}

const styles = StyleSheet.create({
  card: {
    ...cardStyles.premiumSoft,
    padding: spacing.md,
    gap: spacing.xs,
  },
  pressed: { backgroundColor: colors.brandMist },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  iconWrap: appIconTile('sm'),
  title: {
    ...healthOsTypography.messageTitle,
    fontSize: 14,
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  provider: {
    fontSize: 13,
    color: colors.neutral600,
    marginLeft: 44,
  },
  dateLine: {
    fontSize: 12,
    color: colors.neutral500,
    marginLeft: 44,
  },
  nextStep: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brandPrimary,
    marginLeft: 44,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginLeft: 44,
    gap: spacing.sm,
  },
  amount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink900,
  },
  amountSpacer: { flex: 1 },
  actionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
  },
  actionBtnPressed: { opacity: 0.9 },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
});

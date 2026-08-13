import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { UnifiedOrder } from '../../../lib/mappers/order';
import { colors, spacing, radius, cardStyles, appIcons, appIconTile } from '../../../theme';

const STATUS_COLORS: Record<string, string> = {
  pending: colors.statusWarning,
  processing: colors.brandPrimary,
  shipped: colors.statusInfo,
  delivered: colors.statusSuccess,
  cancelled: colors.statusDanger,
};

const TYPE_CONFIG: Record<
  UnifiedOrder['type'],
  { icon: string; label: string }
> = {
  medicines: {
    icon: 'pill',
    label: 'Medicine Order',
  },
  doctor: {
    icon: 'stethoscope',
    label: 'Doctor Appointment',
  },
  lab: {
    icon: 'flask',
    label: 'Lab Test',
  },
  prescription: {
    icon: 'file-document-outline',
    label: 'Prescription Request',
  },
};

function formatOrderRef(id: string) {
  const parts = id.split('-');
  if (parts.length >= 2 && parts[1]) {
    return `#${parts[1].slice(0, 8).toUpperCase()}`;
  }
  return `#${id.slice(0, 8).toUpperCase()}`;
}

function getTrackingProgress(tracking: UnifiedOrder['tracking']) {
  if (!tracking?.length) return null;
  const done = tracking.filter(step => step.done).length;
  return Math.round((done / tracking.length) * 100);
}

function getActiveStep(tracking: UnifiedOrder['tracking']) {
  if (!tracking?.length) return null;
  const current = [...tracking].reverse().find(step => step.done);
  return current?.step || tracking[0]?.step;
}

type OrderCardProps = {
  order: UnifiedOrder;
  onPress: () => void;
};

export function OrderCard({ order, onPress }: OrderCardProps) {
  const config = TYPE_CONFIG[order.type] || TYPE_CONFIG.medicines;
  const progress = getTrackingProgress(order.tracking);
  const activeStep = getActiveStep(order.tracking);
  const statusColor = STATUS_COLORS[order.status] || colors.brandPrimary;

  const displayTitle =
    order.isHospitalVisit && !order.isOnline
      ? 'Hospital Booking'
      : order.title || config.label;

  const subtitle =
    order.type === 'prescription' && order.statusLabel
      ? order.statusLabel
      : order.type === 'lab' && order.testName
        ? order.testName
        : order.vendor;

  const showProgress =
    progress !== null &&
    order.status !== 'cancelled' &&
    order.status !== 'delivered';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Icon name={config.icon} size={22} color={appIcons.color} />
        </View>

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {displayTitle}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${statusColor}20` },
              ]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {order.status}
              </Text>
            </View>
          </View>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.ref}>{formatOrderRef(order.id)}</Text>
            <View style={styles.dateRow}>
              <Icon name="calendar-blank" size={12} color={colors.neutral500} />
              <Text style={styles.date}>{order.date}</Text>
            </View>
          </View>
        </View>

        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.price}>
            PKR {order.total.toLocaleString()}
          </Text>
        </View>
      </View>

      {showProgress && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressStep} numberOfLines={1}>
              {activeStep}
            </Text>
            <Text style={styles.progressPct}>{progress}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.itemsPreview}>
          <View style={styles.avatarStack}>
            {order.items.slice(0, 3).map((item, i) => (
              <Image
                key={i}
                source={{ uri: item.img }}
                style={[styles.avatar, i > 0 && styles.avatarOverlap]}
              />
            ))}
          </View>
          <Text style={styles.itemsText} numberOfLines={2}>
            {order.items.length === 1
              ? order.items[0].name
              : `${order.items.length} items`}
          </Text>
        </View>
        <View style={styles.viewDetails}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Icon name="chevron-right" size={16} color={colors.brandPrimary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyles.listCard,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconWrap: appIconTile('md'),
  info: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.inkHeadline,
    minWidth: 120,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  subtitle: {
    fontSize: 13,
    color: colors.neutral600,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  ref: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral500,
    fontFamily: 'monospace',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: { fontSize: 11, color: colors.neutral500 },
  priceBlock: {
    alignItems: 'flex-end',
    minWidth: 72,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginTop: 2,
  },
  progressSection: { marginTop: spacing.lg },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: spacing.sm,
  },
  progressStep: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral600,
  },
  progressPct: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brandPrimary,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.neutral100,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
    gap: spacing.md,
  },
  itemsPreview: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  avatarStack: { flexDirection: 'row' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.neutral100,
  },
  avatarOverlap: { marginLeft: -8 },
  itemsText: {
    flex: 1,
    fontSize: 12,
    color: colors.neutral600,
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
});

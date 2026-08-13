import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp, NativeStackNavigationProp } from '@react-navigation/native';
import { navigateToTabScreen } from '../../../lib/auth/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import { useUnifiedOrder } from '../../../lib/hooks/useApi';
import { useCustomerOrderTracking } from '../../../lib/hooks/useOrderTracking';
import {
  buildHubOrderFromUnified,
  buildHubOrders,
  formatHubOrderRef,
  getStatusBadgeColor,
  DEMO_UNIFIED_ORDERS,
} from '../data/orderModel';
import type { OrdersStackParamList } from '../../../navigation/types';
import { healthOsTypography } from '../../../theme/healthOs';
import { calmLayout } from '../../../theme/calmLayout';

type OrderDetailRoute = RouteProp<OrdersStackParamList, 'OrderDetail'>;

function TrackingTimeline({
  steps,
}: {
  steps: Array<{ step: string; time: string; done: boolean }>;
}) {
  return (
    <View style={styles.timeline}>
      {steps.map((step, index) => (
        <View key={index} style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View
              style={[styles.timelineDot, step.done && styles.timelineDotDone]}>
              {step.done ? (
                <Icon name="check" size={12} color={colors.white} />
              ) : null}
            </View>
            {index < steps.length - 1 ? (
              <View
                style={[styles.timelineLine, step.done && styles.timelineLineDone]}
              />
            ) : null}
          </View>
          <View style={styles.timelineContent}>
            <Text
              style={[styles.timelineStep, step.done && styles.timelineStepDone]}>
              {step.step}
            </Text>
            <Text style={styles.timelineTime}>{step.time}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailLine}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function OrderDetailContent() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<OrdersStackParamList>>();
  const route = useRoute<OrderDetailRoute>();
  const { orderRef } = route.params;
  const { data: order, isLoading, isError } = useUnifiedOrder(orderRef);

  useCustomerOrderTracking({ orderId: orderRef, enabled: Boolean(orderRef) });

  const hubOrder = useMemo(() => {
    if (order) return buildHubOrderFromUnified(order);
    const demo = DEMO_UNIFIED_ORDERS.find(o => o.id === orderRef);
    if (demo) return buildHubOrderFromUnified(demo);
    const all = buildHubOrders([]);
    return all.find(o => o.orderId === orderRef) ?? null;
  }, [order, orderRef]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brandPrimary} />
      </View>
    );
  }

  if (isError || !hubOrder) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Order not found.</Text>
      </View>
    );
  }

  const statusColor = getStatusBadgeColor(hubOrder.status);
  const source = hubOrder.sourceOrder;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: Math.max(insets.bottom, spacing.xl) + spacing.lg },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}>
            <Icon name={hubOrder.icon} size={24} color={colors.brandPrimary} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>{hubOrder.title}</Text>
            <View style={[styles.badge, { backgroundColor: `${statusColor}18` }]}>
              <Text style={[styles.badgeText, { color: statusColor }]}>
                {hubOrder.statusLabel}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.heroProvider}>{hubOrder.providerName}</Text>
        <Text style={styles.heroMeta}>
          {hubOrder.date}
          {hubOrder.time ? ` · ${hubOrder.time}` : ''} · {formatHubOrderRef(hubOrder.orderId)}
        </Text>
        {hubOrder.amount && hubOrder.amount > 0 ? (
          <Text style={styles.heroAmount}>PKR {hubOrder.amount.toLocaleString()}</Text>
        ) : null}
        <Text style={styles.nextStep}>{hubOrder.nextStep}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Progress</Text>
        <TrackingTimeline steps={hubOrder.progressSteps} />
      </View>

      {hubOrder.orderType === 'doctor_appointment' ||
      hubOrder.orderType === 'hospital_booking' ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Appointment</Text>
          <DetailLine label="Doctor" value={source.vendor} />
          {hubOrder.specialty ? (
            <DetailLine label="Specialty" value={hubOrder.specialty} />
          ) : null}
          <DetailLine
            label="Location"
            value={source.isOnline ? 'Video consultation' : source.deliveryAddress}
          />
          {hubOrder.canChat ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() =>
                navigation.navigate('AppointmentChat', {
                  appointmentId: source.sourceId,
                  doctorName: source.vendor,
                })
              }>
              <Icon name="chat-outline" size={18} color={colors.white} />
              <Text style={styles.primaryBtnText}>Chat</Text>
            </TouchableOpacity>
          ) : null}
          {hubOrder.canReschedule ? (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => Alert.alert('Reschedule', 'Reschedule flow coming soon.')}>
              <Text style={styles.secondaryBtnText}>Reschedule</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {hubOrder.orderType === 'lab_test' ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Lab test</Text>
          <DetailLine label="Lab" value={source.vendor} />
          {hubOrder.testName ? (
            <DetailLine label="Test" value={hubOrder.testName} />
          ) : null}
          <DetailLine label="Collection" value={source.deliveryAddress} />
          {hubOrder.reportUrl ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => Linking.openURL(hubOrder.reportUrl!)}>
              <Icon name="download" size={18} color={colors.white} />
              <Text style={styles.primaryBtnText}>Download report</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {hubOrder.orderType === 'medicine_order' ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Medicine items</Text>
          {source.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>
                Qty {item.qty} · PKR {(item.price * item.qty).toLocaleString()}
              </Text>
            </View>
          ))}
          <DetailLine label="Pharmacy" value={source.vendor} />
          <DetailLine label="Delivery address" value={source.deliveryAddress} />
          {hubOrder.status === 'out_for_delivery' ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => Alert.alert('Tracking', 'Delivery tracking coming soon.')}>
              <Text style={styles.primaryBtnText}>Track delivery</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {hubOrder.orderType === 'prescription_request' ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Prescription request</Text>
          <DetailLine label="Status" value={hubOrder.statusLabel} />
          <DetailLine label="Verification" value={hubOrder.nextStep} />
          {source.fileUrl ? (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => Linking.openURL(source.fileUrl!)}>
              <Text style={styles.secondaryBtnText}>View uploaded prescription</Text>
            </TouchableOpacity>
          ) : null}
          {source.items.length > 0 ? (
            <View style={styles.itemsBlock}>
              <Text style={styles.itemsHeading}>Extracted medicines</Text>
              {source.items.map((item, idx) => (
                <Text key={idx} style={styles.itemName}>
                  · {item.name}
                </Text>
              ))}
            </View>
          ) : null}
          {hubOrder.status !== 'cancelled' ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigateToTabScreen(navigation, 'Health', 'Cart')}>
              <Text style={styles.primaryBtnText}>Order medicines</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {hubOrder.canCancel ? (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => Alert.alert('Cancel order', 'Cancellation flow coming soon.')}>
          <Text style={styles.cancelBtnText}>Cancel order</Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.supportCard}>
        <Icon name="headset" size={22} color={colors.brandPrimary} />
        <View style={styles.supportText}>
          <Text style={styles.supportTitle}>Need help with this order?</Text>
          <Text style={styles.supportSub}>Our support team is available 24/7</Text>
        </View>
      </View>
    </ScrollView>
  );
}

export function OrderDetailScreen() {
  return (
    <ScreenLayout headerMode="stack" title="Order details" showSearch={false} showCart>
      <RequireAuthGate
        title="Sign in to view order"
        subtitle="Sign in to see your order details."
        icon="package-variant">
        <OrderDetailContent />
      </RequireAuthGate>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    padding: calmLayout.screenPadding,
    gap: calmLayout.sectionGap,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  errorText: { fontSize: 14, color: colors.neutral500 },
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  heroTop: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: { flex: 1, gap: spacing.xs },
  heroTitle: {
    ...healthOsTypography.messageTitle,
    fontSize: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroProvider: {
    fontSize: 14,
    color: colors.neutral600,
    marginTop: spacing.xs,
  },
  heroMeta: {
    fontSize: 12,
    color: colors.neutral500,
  },
  heroAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink900,
    marginTop: spacing.xs,
  },
  nextStep: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...healthOsTypography.sectionTitle,
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  detailLine: { gap: 2 },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral500,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    color: colors.ink900,
    marginBottom: spacing.sm,
  },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: 'row', minHeight: 48 },
  timelineLeft: { width: 28, alignItems: 'center' },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: healthOs.cardBorder,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotDone: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.neutral200,
    marginVertical: 2,
  },
  timelineLineDone: { backgroundColor: colors.brandPrimary },
  timelineContent: { flex: 1, paddingBottom: spacing.sm, paddingLeft: spacing.sm },
  timelineStep: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral500,
  },
  timelineStepDone: { color: colors.ink900 },
  timelineTime: { fontSize: 12, color: colors.neutral500, marginTop: 2 },
  itemRow: {
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral200,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink900,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 2,
  },
  itemsBlock: { gap: spacing.xs, marginTop: spacing.sm },
  itemsHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral600,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  secondaryBtn: {
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.15)',
    backgroundColor: colors.white,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.statusDanger,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.statusDanger,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: `${colors.brandPrimary}10`,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.brandPrimary}25`,
    padding: spacing.lg,
  },
  supportText: { flex: 1 },
  supportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink900,
  },
  supportSub: { fontSize: 12, color: colors.neutral500, marginTop: 2 },
});

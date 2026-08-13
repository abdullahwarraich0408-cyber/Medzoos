import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { HealthSearchBar } from '../../health/components/shared/HealthSearchBar';
import { HealthEmptyState } from '../../health/components/shared/HealthEmptyState';
import { CompactOrderCard } from '../components/CompactOrderCard';
import { OrderHubTabs } from '../components/OrderHubTabs';
import { OrderTypeChips } from '../components/OrderTypeChips';
import { useAllOrders } from '../../../lib/hooks/useApi';
import { useCustomerOrderTracking } from '../../../lib/hooks/useOrderTracking';
import { navigateToTabScreen } from '../../../lib/auth/navigation';
import {
  buildHubOrders,
  filterByLifecycle,
  filterByType,
  searchHubOrders,
  type OrderLifecycleTab,
  type OrderTypeFilter,
} from '../data/orderModel';
import type { OrdersStackParamList } from '../../../navigation/types';
import { colors, spacing, TAB_BAR_CLEARANCE, radius } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';
import { calmLayout } from '../../../theme/calmLayout';

function OrderSkeleton() {
  return (
    <View style={styles.skeleton}>
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, { width: '70%', marginTop: 8 }]} />
      <View style={[styles.skeletonLine, { width: '50%', marginTop: 8 }]} />
    </View>
  );
}

function OrdersContent() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<OrdersStackParamList>>();
  const route = useRoute<RouteProp<OrdersStackParamList, 'OrdersList'>>();
  const initialFilter = route.params?.filter;

  useEffect(() => {
    if (initialFilter === 'doctor') {
      navigation.replace('Appointments');
    }
  }, [initialFilter, navigation]);

  const [search, setSearch] = useState('');
  const [lifecycleTab, setLifecycleTab] = useState<OrderLifecycleTab>('active');
  const [typeFilter, setTypeFilter] = useState<OrderTypeFilter>(() => {
    if (initialFilter === 'doctor') return 'doctors';
    if (initialFilter === 'medicines') return 'medicines';
    if (initialFilter === 'lab') return 'labs';
    if (initialFilter === 'hospital') return 'hospitals';
    if (initialFilter === 'prescription') return 'prescriptions';
    return 'all';
  });

  const { data: orders = [], isLoading, isError, refetch } = useAllOrders();
  useCustomerOrderTracking();

  const hubOrders = useMemo(() => buildHubOrders(orders), [orders]);

  const filtered = useMemo(() => {
    let list = filterByLifecycle(hubOrders, lifecycleTab);
    list = filterByType(list, typeFilter);
    list = searchHubOrders(list, search);
    return list;
  }, [hubOrders, lifecycleTab, typeFilter, search]);

  const sectionTitle =
    lifecycleTab === 'active'
      ? 'Active orders'
      : lifecycleTab === 'completed'
        ? 'Completed orders'
        : 'Cancelled orders';

  const handleBookService = () => {
    navigateToTabScreen(navigation, 'Home', 'ServicesHub');
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) + spacing.lg },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.pageTitle}>My Orders</Text>
      <Text style={styles.subtitle}>
        Track medicines, lab tests, appointments, and bookings.
      </Text>

      <HealthSearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search orders, doctors, labs, or medicines..."
        large
      />

      <OrderHubTabs active={lifecycleTab} onChange={setLifecycleTab} />

      <OrderTypeChips active={typeFilter} onChange={setTypeFilter} />

      {isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => (
            <OrderSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <HealthEmptyState
          icon="alert-circle-outline"
          title="Could not load orders"
          subtitle="Please try again."
          action={
            <TouchableOpacity style={styles.primaryBtn} onPress={() => refetch()}>
              <Text style={styles.primaryBtnText}>Retry</Text>
            </TouchableOpacity>
          }
        />
      ) : filtered.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          <View style={styles.list}>
            {filtered.map(order => (
              <CompactOrderCard
                key={order.orderId}
                order={order}
                compact={lifecycleTab !== 'active'}
                onPress={() =>
                  navigation.navigate('OrderDetail', { orderRef: order.orderId })
                }
              />
            ))}
          </View>
        </View>
      ) : search.trim() ? (
        <HealthEmptyState
          icon="magnify"
          title="No orders found"
          subtitle="Try another doctor, lab, medicine, or order ID."
        />
      ) : (
        <HealthEmptyState
          icon="package-variant"
          title={
            lifecycleTab === 'active'
              ? 'No active orders'
              : lifecycleTab === 'completed'
                ? 'No completed orders'
                : 'No cancelled orders'
          }
          subtitle={
            lifecycleTab === 'active'
              ? 'Your upcoming orders and bookings will appear here.'
              : 'Orders in this category will appear here.'
          }
          action={
            lifecycleTab === 'active' ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={handleBookService}>
                <Text style={styles.primaryBtnText}>Book a service</Text>
              </TouchableOpacity>
            ) : undefined
          }
        />
      )}
    </ScrollView>
  );
}

export function OrdersListScreen() {
  return (
    <RequireAuthGate
      title="Sign in to view orders"
      subtitle="Track medicines, lab tests, doctor visits, and prescription requests in one place."
      icon="package-variant">
      <ScreenLayout title="Orders" showSearch={false} showCart={false}>
        <OrdersContent />
      </ScreenLayout>
    </RequireAuthGate>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    padding: calmLayout.screenPadding,
    gap: calmLayout.sectionGap,
  },
  pageTitle: {
    ...healthOsTypography.greeting,
    fontSize: 24,
    color: colors.ink900,
  },
  subtitle: {
    ...healthOsTypography.sectionHint,
    fontSize: 14,
    lineHeight: 21,
    marginTop: -spacing.sm,
  },
  section: { gap: spacing.sm },
  sectionTitle: {
    ...healthOsTypography.sectionTitle,
    fontSize: 15,
  },
  list: { gap: spacing.sm },
  skeleton: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.08)',
    padding: spacing.lg,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 4,
    backgroundColor: colors.neutral100,
    width: '90%',
  },
  primaryBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});

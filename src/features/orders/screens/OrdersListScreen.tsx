import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { CompactOrderCard } from '../components/CompactOrderCard';
import { OrderHubTabs } from '../components/OrderHubTabs';
import { OrderTypeChips } from '../components/OrderTypeChips';
import { OrdersEmptyState } from '../components/OrdersEmptyState';
import { OrdersSearchBar } from '../components/OrdersSearchBar';
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
import { ordersBrand } from '../ordersBrand';
import type { OrdersStackParamList } from '../../../navigation/types';
import { spacing, TAB_BAR_CLEARANCE, radius } from '../../../theme';

function OrderSkeleton() {
  return (
    <View style={styles.skeleton}>
      <View style={styles.skeletonRail} />
      <View style={styles.skeletonBody}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '70%', marginTop: 8 }]} />
        <View style={[styles.skeletonLine, { width: '50%', marginTop: 8 }]} />
      </View>
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

  const activeCount = useMemo(
    () => filterByLifecycle(hubOrders, 'active').length,
    [hubOrders],
  );

  const sectionTitle =
    lifecycleTab === 'active'
      ? 'In progress'
      : lifecycleTab === 'completed'
        ? 'Completed'
        : 'Cancelled';

  const handleBookService = useCallback(() => {
    navigateToTabScreen(navigation, 'Home', 'ServicesHub');
  }, [navigation]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) + spacing.lg },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Icon name="package-variant-closed" size={22} color={ordersBrand.accent} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.pageTitle}>My Orders</Text>
          <Text style={styles.subtitle}>
            Track medicines, labs, and bookings in one place.
          </Text>
        </View>
        {activeCount > 0 ? (
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{activeCount} active</Text>
          </View>
        ) : null}
      </View>

      <OrdersSearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search orders, doctors, labs..."
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
        <OrdersEmptyState
          icon="alert-circle-outline"
          title="Could not load orders"
          subtitle="Check your connection and try again."
          action={
            <TouchableOpacity style={styles.primaryBtn} onPress={() => refetch()}>
              <Text style={styles.primaryBtnText}>Retry</Text>
            </TouchableOpacity>
          }
        />
      ) : filtered.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
            <Text style={styles.sectionCount}>{filtered.length}</Text>
          </View>
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
        <OrdersEmptyState
          icon="magnify"
          title="No orders found"
          subtitle="Try another doctor, lab, medicine, or order ID."
        />
      ) : (
        <OrdersEmptyState
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
              ? 'Book a service and your orders will show up here for tracking.'
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
      <ScreenLayout
        title="Orders"
        showSearch={false}
        showCart={false}
        backgroundColor={ordersBrand.page}>
        <OrdersContent />
      </ScreenLayout>
    </RequireAuthGate>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: ordersBrand.card,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: ordersBrand.border,
    padding: spacing.md,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: ordersBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1, minWidth: 0, gap: 2 },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ordersBrand.ink,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: ordersBrand.muted,
  },
  countPill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: ordersBrand.soft,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: ordersBrand.accent,
  },
  section: { gap: spacing.sm },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ordersBrand.ink,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: ordersBrand.muted,
    backgroundColor: ordersBrand.soft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  list: { gap: spacing.sm },
  skeleton: {
    flexDirection: 'row',
    backgroundColor: ordersBrand.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: ordersBrand.border,
    overflow: 'hidden',
  },
  skeletonRail: {
    width: 4,
    backgroundColor: ordersBrand.mist,
  },
  skeletonBody: {
    flex: 1,
    padding: spacing.lg,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 4,
    backgroundColor: ordersBrand.soft,
    width: '90%',
  },
  primaryBtn: {
    marginTop: spacing.lg,
    backgroundColor: ordersBrand.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: ordersBrand.onAccent,
  },
});

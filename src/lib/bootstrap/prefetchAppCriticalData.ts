import type { QueryClient } from '@tanstack/react-query';
import {
  fetchHomePromoSlides,
  homeSlidesQueryKey,
  localHomeSlides,
  resolveHomeSlideAudience,
} from '../../features/dashboard/homeSlides';
import { doctorsApi, labTestsApi, ordersApi, prescriptionOrdersApi } from '../api';
import { mergeAllOrders } from '../mappers/order';
import { mapLabTestBookingsToFrontend } from '../mappers/labTest';

const DEFAULT_TIMEOUT_MS = 1800;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(null), ms);
    promise
      .then(value => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(null);
      });
  });
}

async function prefetchHomeSlides(queryClient: QueryClient) {
  const audience = await resolveHomeSlideAudience();
  const key = homeSlidesQueryKey(audience);

  // Seed cache immediately so Home never mounts empty.
  if (!queryClient.getQueryData(key)) {
    queryClient.setQueryData(key, localHomeSlides(audience));
  }

  await queryClient.prefetchQuery({
    queryKey: key,
    queryFn: () => fetchHomePromoSlides(audience),
    staleTime: 5 * 60 * 1000,
  });
}

async function prefetchAllOrders(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ['all-orders'],
    queryFn: async () => {
      const [ordersResult, appointmentsResult, bookingsResult, prescriptionResult] =
        await Promise.all([
          ordersApi.getAll().catch(() => ({ orders: [] })),
          doctorsApi.getMyAppointments().catch(() => ({ appointments: [] })),
          labTestsApi.getMyBookings().catch(() => ({ bookings: [] })),
          prescriptionOrdersApi.getAll().catch(() => ({ orders: [] })),
        ]);

      return mergeAllOrders(
        ordersResult.orders || [],
        (appointmentsResult.appointments || []) as Record<string, unknown>[],
        bookingsResult.bookings || [],
        prescriptionResult.orders || [],
      );
    },
    staleTime: 30_000,
  });
}

async function prefetchLabBookings(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ['lab-test-bookings'],
    queryFn: async () => {
      const data = await labTestsApi.getMyBookings();
      return mapLabTestBookingsToFrontend(data.bookings || []);
    },
    staleTime: 30_000,
  });
}

/**
 * Warm the React Query cache for authenticated first paint (Home + related).
 * Always resolves within `timeoutMs` so splash never hangs on a slow network.
 */
export async function prefetchAppCriticalData(
  queryClient: QueryClient,
  options?: { timeoutMs?: number },
): Promise<void> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  await withTimeout(
    Promise.allSettled([
      prefetchHomeSlides(queryClient),
      prefetchAllOrders(queryClient),
      prefetchLabBookings(queryClient),
    ]),
    timeoutMs,
  );
}

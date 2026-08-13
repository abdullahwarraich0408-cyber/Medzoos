import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getCustomerSocket, type OrderTrackingEvent } from '../socket';

function invalidateMobileOrders(
  queryClient: ReturnType<typeof useQueryClient>,
  payload?: OrderTrackingEvent,
) {
  queryClient.invalidateQueries({ queryKey: ['all-orders'] });
  queryClient.invalidateQueries({ queryKey: ['orders'] });
  queryClient.invalidateQueries({ queryKey: ['prescription-orders'] });

  if (payload?.orderId) {
    queryClient.invalidateQueries({ queryKey: ['order', payload.orderId] });
  }
}

/** Real-time order tracking for mobile app. */
export function useCustomerOrderTracking(options: {
  orderId?: string;
  enabled?: boolean;
} = {}) {
  const { orderId, enabled = true } = options;
  const queryClient = useQueryClient();
  const handlersRef = useRef<{
    joinOrderRoom?: () => void;
    onUpdated?: (payload: OrderTrackingEvent) => void;
    onNew?: (payload: OrderTrackingEvent) => void;
  }>({});

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;

    const setup = async () => {
      const socketInstance = await getCustomerSocket();
      if (cancelled || !socketInstance) return;

      const joinOrderRoom = () => {
        if (orderId) {
          socketInstance.emit('join_order_room', orderId);
        }
      };

      const onUpdated = (payload: OrderTrackingEvent) => {
        invalidateMobileOrders(queryClient, payload);
      };

      const onNew = (payload: OrderTrackingEvent) => {
        invalidateMobileOrders(queryClient, payload);
      };

      handlersRef.current = { joinOrderRoom, onUpdated, onNew };

      if (socketInstance.connected) {
        joinOrderRoom();
      } else {
        socketInstance.on('connect', joinOrderRoom);
      }

      socketInstance.on('order:updated', onUpdated);
      socketInstance.on('order:new', onNew);
    };

    setup();

    return () => {
      cancelled = true;
      void getCustomerSocket().then(socketInstance => {
        if (!socketInstance) return;
        const { joinOrderRoom, onUpdated, onNew } = handlersRef.current;
        if (orderId) {
          socketInstance.emit('leave_order_room', orderId);
        }
        if (joinOrderRoom) {
          socketInstance.off('connect', joinOrderRoom);
        }
        if (onUpdated) {
          socketInstance.off('order:updated', onUpdated);
        }
        if (onNew) {
          socketInstance.off('order:new', onNew);
        }
      });
    };
  }, [enabled, orderId, queryClient]);
}

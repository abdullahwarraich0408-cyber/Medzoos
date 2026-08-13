import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '../auth/AuthContext';
import type { Medicine } from '../mappers/product';
import { queryClient } from '../../providers/QueryProvider';
import {
  addMedicineToCart as addMedicineToCartAction,
  getMedicineCartCount,
  mergeGuestCartAfterAuth,
} from './cartActions';

type CartContextValue = {
  cartCount: number;
  refreshCartCount: () => Promise<void>;
  addMedicineToCart: (medicine: Medicine, quantity?: number) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const wasAuthenticatedRef = useRef(isAuthenticated);

  const refreshCartCount = useCallback(async () => {
    const count = await getMedicineCartCount(isAuthenticated);
    setCartCount(count);
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function syncCart() {
      const justSignedIn = isAuthenticated && !wasAuthenticatedRef.current;

      if (justSignedIn) {
        try {
          await mergeGuestCartAfterAuth();
          await queryClient.invalidateQueries({ queryKey: ['cart'] });
        } catch {
          // Guest merge is best-effort.
        }
      }

      if (!cancelled) {
        await refreshCartCount();
      }

      wasAuthenticatedRef.current = isAuthenticated;
    }

    syncCart();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, refreshCartCount]);

  const addMedicineToCart = useCallback(
    async (medicine: Medicine, quantity = 1) => {
      await addMedicineToCartAction(medicine, quantity, isAuthenticated);
      if (isAuthenticated) {
        await queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
      await refreshCartCount();
    },
    [isAuthenticated, refreshCartCount],
  );

  const value = useMemo(
    () => ({
      cartCount,
      refreshCartCount,
      addMedicineToCart,
    }),
    [cartCount, refreshCartCount, addMedicineToCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return context;
}

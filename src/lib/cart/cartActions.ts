import { cartApi } from '../api';
import type { Medicine } from '../mappers/product';
import {
  addToGuestCart,
  clearGuestCart,
  getGuestCart,
  getGuestCartCount,
  type GuestCartItem,
} from '../medicineCart';

export async function getMedicineCartCount(
  isAuthenticated: boolean,
): Promise<number> {
  if (isAuthenticated) {
    try {
      const data = await cartApi.get();
      const items = data.cart?.items || data.items || [];
      return items.reduce(
        (sum, item) => sum + (item.quantity ?? 1),
        0,
      );
    } catch {
      return getGuestCartCount();
    }
  }
  return getGuestCartCount();
}

export async function addMedicineToCart(
  medicine: Medicine,
  quantity: number,
  isAuthenticated: boolean,
): Promise<void> {
  if (medicine.stock === 0) {
    throw new Error('This product is out of stock.');
  }

  if (isAuthenticated) {
    await cartApi.addItem(medicine.id, quantity);
    return;
  }

  await addToGuestCart(medicine, quantity);
}

export async function mergeGuestCartAfterAuth(): Promise<void> {
  const guestCart = await getGuestCart();
  if (!guestCart.length) return;

  const payload: GuestCartItem[] = guestCart.map(item => ({
    ...item,
    id: item.productId,
  }));

  await cartApi.merge(
    payload.map(item => ({
      id: item.id,
      product_id: item.productId,
      quantity: item.quantity,
    })),
  );
  await clearGuestCart();
}

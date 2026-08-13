import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Medicine } from './mappers/product';

const GUEST_CART_KEY = 'medzoos_guest_cart';

export type GuestCartItem = {
  id: string;
  productId: string;
  name: string;
  vendor: string;
  price: number;
  quantity: number;
  image: string;
  inStock: boolean;
};

export async function getGuestCart(): Promise<GuestCartItem[]> {
  try {
    const raw = await AsyncStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as GuestCartItem[]) : [];
  } catch {
    return [];
  }
}

async function saveGuestCart(items: GuestCartItem[]) {
  await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export async function addToGuestCart(
  medicine: Medicine,
  quantity = 1,
): Promise<GuestCartItem[]> {
  const cart = await getGuestCart();
  const idx = cart.findIndex(item => item.productId === medicine.id);

  if (idx > -1) {
    cart[idx].quantity += quantity;
  } else {
    cart.push({
      id: medicine.id,
      productId: medicine.id,
      name: medicine.name,
      vendor: medicine.vendor,
      price: medicine.price,
      quantity,
      image: medicine.image,
      inStock: medicine.stock > 0,
    });
  }

  await saveGuestCart(cart);
  return cart;
}

export async function updateGuestCartQuantity(
  productId: string,
  quantity: number,
): Promise<GuestCartItem[]> {
  const cart = await getGuestCart();
  const next = cart
    .map(item =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item,
    );
  await saveGuestCart(next);
  return next;
}

export async function removeFromGuestCart(
  productId: string,
): Promise<GuestCartItem[]> {
  const next = (await getGuestCart()).filter(item => item.productId !== productId);
  await saveGuestCart(next);
  return next;
}

export async function clearGuestCart() {
  await AsyncStorage.removeItem(GUEST_CART_KEY);
}

export async function getGuestCartCount(): Promise<number> {
  const cart = await getGuestCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function guestCartToMergePayload(cart: GuestCartItem[]) {
  return cart.map(item => ({
    product_id: item.productId,
    quantity: item.quantity,
  }));
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LabTest } from './mappers/labTest';

const CART_KEY = 'medzoos_lab_cart';

export async function getLabCart(): Promise<LabTest[]> {
  try {
    const raw = await AsyncStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as LabTest[]) : [];
  } catch {
    return [];
  }
}

async function saveLabCart(items: LabTest[]) {
  await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
}

export async function addToLabCart(test: LabTest): Promise<LabTest[]> {
  const cart = await getLabCart();
  if (cart.some(item => item.id === test.id)) return cart;
  const next = [...cart, test];
  await saveLabCart(next);
  return next;
}

export async function removeFromLabCart(testId: string): Promise<LabTest[]> {
  const next = (await getLabCart()).filter(item => item.id !== testId);
  await saveLabCart(next);
  return next;
}

export async function clearLabCart() {
  await AsyncStorage.removeItem(CART_KEY);
}

export type LabCartGroup = {
  lab: string;
  labPartnerId?: string | null;
  tests: LabTest[];
};

export function groupCartByLab(cart: LabTest[] = []): LabCartGroup[] {
  const groups = new Map<string, LabCartGroup>();

  for (const test of cart) {
    const labKey = test.labPartnerId || test.lab || 'unknown';
    if (!groups.has(labKey)) {
      groups.set(labKey, {
        lab: test.lab,
        labPartnerId: test.labPartnerId,
        tests: [],
      });
    }
    groups.get(labKey)!.tests.push(test);
  }

  return [...groups.values()];
}

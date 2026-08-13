import { DEFAULT_PRODUCT_IMAGE } from './product';

export type RawCartItem = {
  id?: string;
  product_id?: string;
  name?: string;
  vendor_name?: string;
  price?: number;
  quantity?: number;
  image_url?: string;
  in_stock?: boolean;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  vendor: string;
  price: number;
  quantity: number;
  image: string;
  inStock: boolean;
};

export type Cart = {
  items: CartItem[];
  total: number;
};

export function mapCartItemToFrontend(item: RawCartItem): CartItem {
  const productId = item.product_id || item.id || '';
  return {
    id: productId,
    productId,
    name: item.name || 'Product',
    vendor: item.vendor_name || 'Pharmacy',
    price: item.price ?? 0,
    quantity: item.quantity ?? 1,
    image: item.image_url || DEFAULT_PRODUCT_IMAGE,
    inStock: item.in_stock !== false,
  };
}

export function mapCartToFrontend(cart: { items?: RawCartItem[]; total?: number } | null): Cart {
  if (!cart) return { items: [], total: 0 };

  return {
    items: (cart.items || []).map(mapCartItemToFrontend),
    total: cart.total ?? 0,
  };
}

export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop';

export type RawProduct = {
  id?: string;
  name?: string;
  formula?: string;
  category?: string;
  requires_prescription?: boolean;
  price?: number;
  stock?: number;
  image_url?: string;
  rating?: number;
  reviews_count?: number;
  description?: string;
  vendor_id?: string;
  vendor?: { id?: string; business_name?: string };
  discount?: number;
};

export type Medicine = {
  id: string;
  name: string;
  generic: string;
  brand: string;
  vendor: string;
  category: string;
  prescriptionRequired: boolean;
  price: number;
  stock: number;
  deliveryEta: string;
  image: string;
  rating: number;
  reviews: number;
  description?: string;
  vendorId?: string;
};

export function mapProductToMedicine(product: RawProduct): Medicine | null {
  if (!product?.id && !product?.name) return null;

  return {
    id: product.id || product.name || '',
    name: product.name || 'Medicine',
    generic: product.formula || product.name || '',
    brand: product.category || 'Generic',
    vendor: product.vendor?.business_name || 'Verified Pharmacy',
    category: product.category || 'OTC',
    prescriptionRequired: Boolean(product.requires_prescription),
    price: product.price ?? 0,
    stock: product.stock ?? 0,
    deliveryEta: 'Same day',
    image: product.image_url || DEFAULT_PRODUCT_IMAGE,
    rating: product.rating ?? 4.5,
    reviews: product.reviews_count ?? 0,
    description: product.description,
    vendorId: product.vendor_id || product.vendor?.id,
  };
}

export function mapProductsToMedicines(products: RawProduct[] = []): Medicine[] {
  return products
    .map(mapProductToMedicine)
    .filter((item): item is Medicine => Boolean(item));
}

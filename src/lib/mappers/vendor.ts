export const DEFAULT_VENDOR_IMAGE =
  'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800';

export type RawVendor = {
  id?: string;
  slug?: string;
  business_name?: string;
  name?: string;
  description?: string;
  rating?: number;
  average_rating?: number;
  reviews_count?: number;
  delivery_time?: string;
  distance_km?: number;
  distance?: string | number;
  status?: string;
  bg_image?: string;
  image_url?: string;
  product_count?: number;
  address?: string;
  city?: string;
  phone?: string;
  is_open?: boolean;
  availability?: {
    isAvailable?: boolean;
    openAllowed?: boolean;
  };
};

export type Pharmacy = {
  id?: string;
  slug: string;
  name: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  distanceKm: number;
  distance: string;
  status: string;
  open: boolean;
  verified: boolean;
  bgImage: string;
  address?: string;
  city?: string;
  productCount: number;
  description: string;
};

function formatDistanceKm(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number') {
    const rounded = Math.round(value * 10) / 10;
    return `${rounded} km`;
  }
  const match = String(value).match(/([\d.]+)/);
  if (match) {
    const rounded = Math.round(parseFloat(match[1]) * 10) / 10;
    return `${rounded} km`;
  }
  return String(value);
}

export function slugifyVendorName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function mapVendorToPharmacy(vendor: RawVendor, index = 0): Pharmacy | null {
  if (!vendor) return null;

  const name = vendor.business_name || vendor.name || 'Pharmacy';
  const slug = vendor.slug || slugifyVendorName(name) || vendor.id || String(index);
  const isApproved = vendor.status === 'approved' || vendor.status === 'active';
  const open =
    vendor.availability?.openAllowed ??
    (vendor.is_open !== false && isApproved);

  return {
    id: vendor.id,
    slug,
    name,
    rating: vendor.average_rating ?? vendor.rating ?? 4.5,
    reviews: vendor.reviews_count ?? 0,
    deliveryTime: vendor.delivery_time || '30–45 min',
    distanceKm: vendor.distance_km ?? (index + 1) * 1.2,
    distance:
      formatDistanceKm(vendor.distance_km ?? vendor.distance) ||
      `${(index + 1) * 1.2} km`,
    status: open ? 'open' : 'closed',
    open,
    verified: isApproved,
    bgImage: vendor.bg_image || vendor.image_url || DEFAULT_VENDOR_IMAGE,
    address: vendor.address,
    city: vendor.city,
    productCount: vendor.product_count ?? 0,
    description:
      vendor.description ||
      `${name} is a verified Medzoos pharmacy partner with authentic medicines and fast delivery.`,
  };
}

export function mapVendorsToPharmacies(vendors: RawVendor[] = []): Pharmacy[] {
  return vendors
    .map((vendor, index) => mapVendorToPharmacy(vendor, index))
    .filter((item): item is Pharmacy => Boolean(item));
}

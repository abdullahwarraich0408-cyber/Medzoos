import type { Medicine } from '../../../lib/mappers/product';

export const FILTER_OPTIONS = {
  categories: [
    'OTC',
    'Prescription',
    'Vitamins',
    'Supplements',
    'Baby Care',
    'Personal Care',
  ],
  priceRanges: [
    { label: 'Under PKR 500', min: 0, max: 500 },
    { label: 'PKR 500 – 1,000', min: 500, max: 1000 },
    { label: 'PKR 1,000 – 2,500', min: 1000, max: 2500 },
    { label: 'Above PKR 2,500', min: 2500, max: Infinity },
  ],
};

export const MOCK_MEDICINES: Medicine[] = [
  {
    id: '1',
    name: 'Panadol Extra 500mg Tablets',
    generic: 'Paracetamol / Caffeine',
    brand: 'GSK',
    vendor: 'HealthPlus Pharmacy',
    category: 'OTC',
    prescriptionRequired: false,
    price: 450,
    stock: 120,
    deliveryEta: 'Under 30 min',
    image:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop',
    rating: 4.8,
    reviews: 142,
  },
  {
    id: '2',
    name: 'Augmentin 625mg Tablets',
    generic: 'Amoxicillin / Clavulanate',
    brand: 'GSK',
    vendor: 'MediCare Direct',
    category: 'Prescription',
    prescriptionRequired: true,
    price: 1200,
    stock: 45,
    deliveryEta: '30–60 min',
    image:
      'https://images.unsplash.com/photo-1587854691652-5c4cddc5abaf?q=80&w=600&auto=format&fit=crop',
    rating: 4.6,
    reviews: 89,
  },
  {
    id: '3',
    name: 'Surbex-Z Tablets',
    generic: 'Multivitamin + Zinc',
    brand: 'Abbott',
    vendor: 'City Drugs Store',
    category: 'Vitamins',
    prescriptionRequired: false,
    price: 850,
    stock: 200,
    deliveryEta: 'Under 30 min',
    image:
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=600&auto=format&fit=crop',
    rating: 4.9,
    reviews: 256,
  },
  {
    id: '4',
    name: 'Brufen 400mg Tablets',
    generic: 'Ibuprofen',
    brand: 'Abbott',
    vendor: 'PharmaCare 24/7',
    category: 'OTC',
    prescriptionRequired: false,
    price: 250,
    stock: 0,
    deliveryEta: '1–2 hours',
    image:
      'https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=600&auto=format&fit=crop',
    rating: 4.5,
    reviews: 67,
  },
  {
    id: '5',
    name: 'Glucophage 500mg Tablets',
    generic: 'Metformin',
    brand: 'Merck',
    vendor: 'HealthPlus Pharmacy',
    category: 'Prescription',
    prescriptionRequired: true,
    price: 320,
    stock: 88,
    deliveryEta: '30–60 min',
    image:
      'https://images.unsplash.com/photo-1550572017-edb79a527c9b?q=80&w=600&auto=format&fit=crop',
    rating: 4.7,
    reviews: 112,
  },
  {
    id: '6',
    name: 'Centrum Silver Multivitamin',
    generic: 'Multivitamin',
    brand: 'Pfizer',
    vendor: 'MediCare Direct',
    category: 'Supplements',
    prescriptionRequired: false,
    price: 3400,
    stock: 32,
    deliveryEta: 'Same day',
    image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&auto=format&fit=crop',
    rating: 4.8,
    reviews: 198,
  },
  {
    id: '7',
    name: 'Arinac Forte Tablets',
    generic: 'Ibuprofen / Pseudoephedrine',
    brand: 'Getz Pharma',
    vendor: 'City Drugs Store',
    category: 'OTC',
    prescriptionRequired: false,
    price: 320,
    stock: 150,
    deliveryEta: 'Under 30 min',
    image:
      'https://images.unsplash.com/photo-1587854691652-5c4cddc5abaf?q=80&w=600&auto=format&fit=crop',
    rating: 4.4,
    reviews: 54,
  },
  {
    id: '8',
    name: 'Vitamin D3 5000 IU',
    generic: 'Vitamin D',
    brand: 'Highnoon',
    vendor: 'MediCare Direct',
    category: 'Vitamins',
    prescriptionRequired: false,
    price: 650,
    stock: 95,
    deliveryEta: 'Under 30 min',
    image:
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=600&auto=format&fit=crop',
    rating: 4.7,
    reviews: 88,
  },
];

export type MedicineFilters = {
  category: string | null;
  prescriptionOnly: boolean | null;
};

export const DEFAULT_MEDICINE_FILTERS: MedicineFilters = {
  category: null,
  prescriptionOnly: null,
};

export function getMedicineById(id: string) {
  return MOCK_MEDICINES.find(m => m.id === id);
}

export function getSimilarMedicines(id: string, limit = 4) {
  const current = getMedicineById(id);
  if (!current) return MOCK_MEDICINES.slice(0, limit);
  return MOCK_MEDICINES.filter(
    m => m.id !== id && m.category === current.category,
  ).slice(0, limit);
}

export function applyMedicineFilters(
  medicines: Medicine[],
  search: string,
  filters: MedicineFilters,
  sort: string,
) {
  let result = [...medicines];

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      m =>
        m.name.toLowerCase().includes(q) ||
        m.generic.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q) ||
        m.vendor.toLowerCase().includes(q),
    );
  }

  if (filters.category) {
    result = result.filter(m => m.category === filters.category);
  }

  if (filters.prescriptionOnly !== null) {
    result = result.filter(
      m => m.prescriptionRequired === filters.prescriptionOnly,
    );
  }

  switch (sort) {
    case 'price-low':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
    default:
      break;
  }

  return result;
}

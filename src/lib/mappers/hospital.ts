export type RawHospital = {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  cover_image?: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
  _count?: { doctors?: number };
};

const DEFAULT_LOGO =
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=200';
const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1586773860418-d47a0db32928?auto=format&fit=crop&q=80&w=800';

export type Hospital = {
  id: string;
  name: string;
  slug?: string;
  logo: string;
  coverImage: string;
  city: string;
  address: string;
  description?: string;
  phone?: string;
  email?: string;
  doctorCount: number;
};

export function mapHospitalToFrontend(hospital: RawHospital | null | undefined): Hospital | null {
  if (!hospital) return null;

  return {
    id: hospital.id,
    name: hospital.name,
    slug: hospital.slug,
    logo: hospital.logo || DEFAULT_LOGO,
    coverImage: hospital.cover_image || DEFAULT_COVER,
    city: hospital.city || '',
    address: hospital.address || '',
    description: hospital.description,
    phone: hospital.phone,
    email: hospital.email,
    doctorCount: hospital._count?.doctors ?? 0,
  };
}

export function mapHospitalsToFrontend(hospitals: RawHospital[] = []): Hospital[] {
  return hospitals.map(mapHospitalToFrontend).filter(Boolean) as Hospital[];
}

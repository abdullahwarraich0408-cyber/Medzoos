import type { Doctor } from '../../../lib/mappers/doctor';

export const FILTER_OPTIONS = {
  specialties: [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Gynecologist',
    'Psychiatrist',
    'Orthopedic',
  ],
  languages: ['English', 'Urdu', 'Punjabi', 'Sindhi'],
  experience: ['5+ years', '10+ years', '15+ years', '20+ years'],
};

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Ayesha Khan',
    specialty: 'General Physician',
    experience: '12 years',
    experienceYears: 12,
    rating: 4.9,
    reviews: 324,
    fee: 1500,
    online: true,
    availableToday: true,
    languages: ['English', 'Urdu'],
    photo:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    image:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    qualifications: ['MBBS — Aga Khan University', 'FCPS — College of Physicians'],
    hospital: 'Aga Khan University Hospital',
    practiceLocations: [],
    isIndependent: false,
  },
  {
    id: '2',
    name: 'Dr. Hassan Ali',
    specialty: 'Cardiologist',
    experience: '15 years',
    experienceYears: 15,
    rating: 4.8,
    reviews: 198,
    fee: 2500,
    online: true,
    availableToday: true,
    languages: ['English', 'Urdu', 'Punjabi'],
    photo:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    image:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    qualifications: ['MBBS', 'FRCP — Cardiology'],
    hospital: 'National Institute of Cardiovascular Diseases',
    practiceLocations: [],
    isIndependent: false,
  },
  {
    id: '3',
    name: 'Dr. Sara Ahmed',
    specialty: 'Dermatologist',
    experience: '8 years',
    experienceYears: 8,
    rating: 4.9,
    reviews: 412,
    fee: 2000,
    online: true,
    availableToday: false,
    languages: ['English', 'Urdu'],
    photo:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400',
    image:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400',
    qualifications: ['MBBS', 'MD — Dermatology'],
    hospital: 'South City Hospital',
    practiceLocations: [],
    isIndependent: false,
  },
];

export type DoctorFilters = {
  specialties: string[];
  languages: string[];
  experience: string[];
  online: boolean;
  availableToday: boolean;
  experienced?: boolean;
};

export const DEFAULT_FILTERS: DoctorFilters = {
  specialties: [],
  languages: [],
  experience: [],
  online: false,
  availableToday: false,
};

export type ConsultType = 'online' | 'in_person';

export function applyDoctorFilters(
  doctors: Doctor[],
  filters: DoctorFilters,
  search: string,
  category: ConsultType,
): Doctor[] {
  let result = [...doctors];

  if (category === 'online') {
    result = result.filter(d => d.online);
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      d =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.hospital.toLowerCase().includes(q),
    );
  }

  if (filters.specialties?.length) {
    result = result.filter(d => filters.specialties.includes(d.specialty));
  }
  if (filters.online) {
    result = result.filter(d => d.online);
  }
  if (filters.availableToday) {
    result = result.filter(d => d.availableToday);
  }
  if (filters.languages?.length) {
    result = result.filter(d =>
      filters.languages.some(l => d.languages.includes(l)),
    );
  }
  if (filters.experience?.length) {
    result = result.filter(d =>
      filters.experience.some(exp => {
        const min = parseInt(exp, 10);
        return d.experienceYears >= min;
      }),
    );
  }
  if (filters.experienced) {
    result = [...result].sort((a, b) => b.experienceYears - a.experienceYears);
  }

  return result;
}

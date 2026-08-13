import { iconScheme } from '../../../theme';

export const PROMO_BANNERS = [
  {
    id: 'promo-meds',
    title: 'Flat 25% OFF',
    subtitle: 'On Medicines',
    code: 'Use Code: HEALTH25',
    cta: 'Shop Now',
    tab: 'Health' as const,
    healthScreen: 'MedicinesList' as const,
    bg: '#5B829C',
    titleColor: '#FFFFFF',
    btnColor: '#FFFFFF',
    btnTextColor: '#082B3F',
    image:
      'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'promo-doctors',
    title: 'Consult Top Doctors',
    subtitle: 'From the comfort of your home',
    code: null,
    cta: 'Book Now',
    servicesScreen: 'DoctorsList' as const,
    bg: '#5B829C',
    titleColor: '#FFFFFF',
    btnColor: '#FFFFFF',
    btnTextColor: '#082B3F',
    image:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'promo-labs',
    title: 'Lab Tests at Home',
    subtitle: 'Accurate • Fast • Reliable',
    code: null,
    cta: 'Book Now',
    servicesScreen: 'LabTestsList' as const,
    bg: '#5B829C',
    titleColor: '#FFFFFF',
    btnColor: '#FFFFFF',
    btnTextColor: '#082B3F',
    image:
      'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'promo-hospitals',
    title: 'Hospital Care',
    subtitle: 'Book visits at leading hospitals',
    code: null,
    cta: 'Explore',
    servicesScreen: 'HospitalsList' as const,
    bg: '#5B829C',
    titleColor: '#FFFFFF',
    btnColor: '#FFFFFF',
    btnTextColor: '#082B3F',
    image:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400',
  },
];

export const SERVICE_CARDS = [
  {
    id: 'svc-doctors',
    title: 'Doctors',
    subtitle: 'Video or in-clinic visits',
    servicesScreen: 'DoctorsList' as const,
    icon: 'stethoscope',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    bg: '#FFFFFF',
  },
  {
    id: 'svc-labs',
    title: 'Lab Tests',
    subtitle: 'Home sample collection',
    servicesScreen: 'LabTestsList' as const,
    icon: 'flask',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    bg: '#F1F8FF',
  },
  {
    id: 'svc-medicines',
    title: 'Medicines',
    subtitle: 'Order medicines nearby',
    drawer: 'Pharmacies' as const,
    icon: 'pill',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    bg: '#E8F4FF',
  },
  {
    id: 'svc-hospitals',
    title: 'Hospitals',
    subtitle: 'Top hospitals & clinics',
    servicesScreen: 'HospitalsList' as const,
    icon: 'hospital-building',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    bg: '#FFFFFF',
  },
];

export const CATEGORIES = [
  { name: 'OTC', icon: 'pill', circle: iconScheme.bg, color: iconScheme.color },
  { name: 'Vitamins', icon: 'circle-half-full', circle: iconScheme.bg, color: iconScheme.color },
  { name: 'Diabetes', icon: 'water', circle: iconScheme.bg, color: iconScheme.color },
  { name: 'Baby Care', icon: 'baby-carriage', circle: iconScheme.bg, color: iconScheme.color },
  { name: 'Skin Care', icon: 'face-woman-shimmer', circle: iconScheme.bg, color: iconScheme.color },
  { name: 'Hair Care', icon: 'hair-dryer', circle: iconScheme.bg, color: iconScheme.color },
  { name: 'Health Devices', icon: 'heart-pulse', circle: iconScheme.bg, color: iconScheme.color },
  { name: 'Personal Care', icon: 'hand-wash', circle: iconScheme.bg, color: iconScheme.color },
];

export const DOCTOR_CATEGORIES = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    icon: 'heart-pulse',
    color: '#17618E',
    bg: '#DEEEF9',
    specialty: 'Cardiologist',
  },
  {
    id: 'paediatrics',
    name: 'Paediatrics',
    icon: 'baby-face-outline',
    color: '#17618E',
    bg: '#DEEEF9',
    specialty: 'Pediatrician',
  },
  {
    id: 'urology',
    name: 'Urology',
    icon: 'water',
    color: '#17618E',
    bg: '#DEEEF9',
    specialty: 'Urologist',
  },
  {
    id: 'neurology',
    name: 'Neurology',
    icon: 'brain',
    color: '#17618E',
    bg: '#DEEEF9',
    specialty: 'Neurologist',
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    icon: 'face-woman-shimmer',
    color: '#17618E',
    bg: '#DEEEF9',
    specialty: 'Dermatologist',
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    icon: 'bone',
    color: '#17618E',
    bg: '#DEEEF9',
    specialty: 'Orthopedist',
  },
  {
    id: 'general',
    name: 'General',
    icon: 'stethoscope',
    color: '#17618E',
    bg: '#DEEEF9',
    specialty: 'General Physician',
  },
] as const;

export function specialtyVisual(specialty: string) {
  const key = specialty.toLowerCase();
  const match = DOCTOR_CATEGORIES.find(
    c =>
      key.includes(c.id) ||
      key.includes(c.specialty.toLowerCase()) ||
      key.includes(c.name.toLowerCase()),
  );
  if (match) {
    return { icon: match.icon, color: match.color, bg: match.bg };
  }
  return { icon: 'stethoscope', color: '#17618E', bg: '#DEEEF9' };
}

export const NEARBY_PHARMACIES = [
  {
    name: 'City Pharmacy',
    rating: 4.8,
    reviews: 230,
    time: '30 mins',
    distance: '1.2 km',
    minOrder: 'PKR 500',
    open: true,
    bgImage:
      'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=500',
  },
  {
    name: 'HealthPlus Pharmacy',
    rating: 4.9,
    reviews: 412,
    time: '20 mins',
    distance: '0.8 km',
    minOrder: 'PKR 500',
    open: true,
    bgImage:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=500',
  },
  {
    name: 'MedPlus',
    rating: 4.7,
    reviews: 185,
    time: '25 mins',
    distance: '2.1 km',
    minOrder: 'PKR 400',
    open: true,
    bgImage:
      'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=500',
  },
  {
    name: 'Care Pharmacy',
    rating: 4.9,
    reviews: 320,
    time: '15 mins',
    distance: '3.4 km',
    minOrder: 'PKR 500',
    open: true,
    bgImage:
      'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=500',
  },
];

export const FEATURED_DOCTORS = [
  {
    id: '1',
    name: 'Dr. Ayesha Khan',
    specialty: 'Cardiologist',
    rating: 4.9,
    reviews: 420,
    consultations: '2.5k',
    fee: 1500,
    image:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '2',
    name: 'Dr. Hassan Ali',
    specialty: 'General Physician',
    rating: 4.8,
    reviews: 189,
    consultations: '1.8k',
    fee: 1200,
    image:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '3',
    name: 'Dr. Sara Ahmed',
    specialty: 'Dermatologist',
    rating: 4.9,
    reviews: 312,
    consultations: '3.2k',
    fee: 2000,
    image:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400',
  },
];

export const LAB_PACKAGES = [
  {
    name: 'Complete Health Checkup',
    tests: ['CBC', 'LFT', 'KFT', 'Lipid Profile'],
    price: 'PKR 4,999',
    discount: '30% OFF',
  },
  {
    name: 'Diabetes Care Panel',
    tests: ['Fasting Sugar', 'HbA1c', 'Insulin'],
    price: 'PKR 1,299',
    discount: '20% OFF',
  },
  {
    name: "Women's Wellness",
    tests: ['CBC', 'Thyroid', 'Vitamin D', 'Iron'],
    price: 'PKR 2,499',
    discount: null,
  },
  {
    name: 'Heart Health Panel',
    tests: ['ECG Report', 'Lipid Profile', 'CRP'],
    price: 'PKR 3,499',
    discount: '15% OFF',
  },
];

export const FEATURED_HOSPITALS = [
  {
    id: 'h1',
    name: 'Aga Khan University Hospital',
    city: 'Karachi',
    address: 'Stadium Road, Karachi',
    doctorCount: 120,
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=200',
    coverImage:
      'https://images.unsplash.com/photo-1586773860418-d47a0db32928?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'h2',
    name: 'South City Hospital',
    city: 'Karachi',
    address: 'Clifton Block 2, Karachi',
    doctorCount: 85,
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=200',
    coverImage:
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'h3',
    name: 'Shaukat Khanum Memorial',
    city: 'Lahore',
    address: 'Johar Town, Lahore',
    doctorCount: 200,
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=200',
    coverImage:
      'https://images.unsplash.com/photo-1538108149393-ddd531804349?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'h4',
    name: 'PIMS Hospital',
    city: 'Islamabad',
    address: 'G-8/3, Islamabad',
    doctorCount: 95,
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=200',
    coverImage:
      'https://images.unsplash.com/photo-1486325212027-808962386279?auto=format&fit=crop&q=80&w=800',
  },
];

export const HOW_IT_WORKS = [
  { step: '1', title: 'Upload', desc: 'Upload prescription', icon: 'upload' },
  { step: '2', title: 'Auto Assign', desc: 'Nearest pharmacy gets it', icon: 'magnify' },
  { step: '3', title: 'We Deliver', desc: 'Fast delivery at home', icon: 'truck-delivery' },
];

export const PLATFORM_STATS = [
  { value: '50K+', label: 'Happy Customers', icon: 'account-group' },
  { value: '500+', label: 'Partner Pharmacies', icon: 'store' },
  { value: '200+', label: 'Expert Doctors', icon: 'stethoscope' },
  { value: '99%', label: 'On-time Delivery', icon: 'check-circle' },
];

export const TRUST_ITEMS = [
  { icon: 'credit-card-outline', title: 'Secure Payments', subtitle: '100% Secure & Safe' },
  { icon: 'shield-check', title: 'Authentic Medicines', subtitle: '100% Genuine Products' },
  { icon: 'backup-restore', title: 'Easy Returns', subtitle: '7 Days Return Policy' },
  { icon: 'headset', title: '24/7 Support', subtitle: 'We are here to help' },
];

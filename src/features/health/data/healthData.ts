export const POPULAR_TEST_QUERIES = [
  { id: 'cbc', label: 'CBC', query: 'CBC' },
  { id: 'hba1c', label: 'HbA1c', query: 'HbA1c' },
  { id: 'vitamin-d', label: 'Vitamin D', query: 'Vitamin D' },
  { id: 'lipid', label: 'Lipid Profile', query: 'Lipid' },
];

export type HealthPackageCategory =
  | 'full-body'
  | 'cardiac'
  | 'womens'
  | 'mens'
  | 'child';

export type HealthPackageDef = {
  id: string;
  emoji: string;
  name: string;
  tagline: string;
  benefits: string[];
  testsIncluded: number;
  price: number;
  individualPrice: number;
  category: HealthPackageCategory;
  searchTerms: string[];
};

export const HEALTH_PACKAGES: HealthPackageDef[] = [
  {
    id: 'full-body',
    emoji: '🩺',
    name: 'Full Body Checkup',
    tagline: '65+ parameters · home collection',
    benefits: [
      'Complete blood count & liver function',
      'Kidney, thyroid & vitamin panel',
      'Diabetes & lipid screening',
      'Doctor-reviewed summary',
    ],
    testsIncluded: 65,
    price: 5500,
    individualPrice: 8900,
    category: 'full-body',
    searchTerms: ['full body', 'executive', 'checkup'],
  },
  {
    id: 'cardiac',
    emoji: '🫀',
    name: 'Cardiac Screening',
    tagline: 'Heart health & risk markers',
    benefits: [
      'Lipid profile & cardiac enzymes',
      'ECG recommendation included',
      'Blood pressure guidance',
      'Cardiologist referral if needed',
    ],
    testsIncluded: 12,
    price: 3200,
    individualPrice: 4800,
    category: 'cardiac',
    searchTerms: ['cardiac', 'heart', 'lipid'],
  },
  {
    id: 'womens',
    emoji: '👩',
    name: "Women's Health Package",
    tagline: 'Hormonal & wellness screening',
    benefits: [
      'Thyroid & iron studies',
      'Vitamin D & B12 panel',
      'Pap smear guidance',
      'Bone health markers',
    ],
    testsIncluded: 28,
    price: 4200,
    individualPrice: 6500,
    category: 'womens',
    searchTerms: ['women', 'thyroid', 'iron'],
  },
  {
    id: 'mens',
    emoji: '👨',
    name: "Men's Health Package",
    tagline: 'Vitality & metabolic check',
    benefits: [
      'Testosterone screening',
      'Prostate health markers',
      'Diabetes & cholesterol panel',
      'Liver & kidney function',
    ],
    testsIncluded: 24,
    price: 3900,
    individualPrice: 5800,
    category: 'mens',
    searchTerms: ['men', 'prostate', 'testosterone'],
  },
  {
    id: 'child',
    emoji: '👶',
    name: 'Child Wellness Package',
    tagline: 'Growth & immunity screening',
    benefits: [
      'Complete blood count',
      'Vitamin D & iron levels',
      'Allergy screening basics',
      'Pediatrician summary',
    ],
    testsIncluded: 18,
    price: 2800,
    individualPrice: 4200,
    category: 'child',
    searchTerms: ['child', 'pediatric', 'wellness'],
  },
];

export type MedicalRecordTabId = 'all' | 'doctors' | 'labs' | 'reports' | 'uploads';

export const MEDICAL_RECORD_TABS: {
  id: MedicalRecordTabId;
  label: string;
  icon: string;
}[] = [
  { id: 'all', label: 'All', icon: 'folder-outline' },
  { id: 'doctors', label: 'Doctors', icon: 'stethoscope' },
  { id: 'labs', label: 'Labs', icon: 'flask-outline' },
  { id: 'reports', label: 'Reports', icon: 'file-chart-outline' },
  { id: 'uploads', label: 'Uploads', icon: 'cloud-upload-outline' },
];

export const RECORD_ALL_SECTIONS = [
  'doctors',
  'labs',
  'reports',
  'uploads',
] as const;

export type RecordAllSectionId = (typeof RECORD_ALL_SECTIONS)[number];

export const RECORD_ALL_SECTION_META: Record<
  RecordAllSectionId,
  { title: string; icon: string; seeAllTab: MedicalRecordTabId }
> = {
  doctors: { title: 'Doctors', icon: 'stethoscope', seeAllTab: 'doctors' },
  labs: { title: 'Labs', icon: 'flask-outline', seeAllTab: 'labs' },
  reports: { title: 'Latest Reports', icon: 'file-chart-outline', seeAllTab: 'reports' },
  uploads: { title: 'Uploads', icon: 'cloud-upload-outline', seeAllTab: 'uploads' },
};

export type RecordCategoryId =
  | 'lab-report'
  | 'prescription'
  | 'doctor-notes'
  | 'discharge'
  | 'vaccination'
  | 'imaging';

/** @deprecated Legacy category chips — use MEDICAL_RECORD_TABS */
export const RECORD_CATEGORIES = [
  { id: 'all', label: 'All', icon: 'folder-outline' },
  { id: 'lab-report', label: 'Lab Reports', icon: 'flask-outline' },
  { id: 'prescription', label: 'Prescriptions', icon: 'file-document-outline' },
  { id: 'doctor-notes', label: 'Doctor Visits', icon: 'stethoscope' },
  { id: 'discharge', label: 'Discharge', icon: 'hospital-building' },
  { id: 'vaccination', label: 'Vaccination', icon: 'needle' },
  { id: 'imaging', label: 'Imaging', icon: 'radioactive' },
] as const;

export function inferRecordCategory(type?: string): RecordCategoryId {
  const normalized = (type || '').toLowerCase();
  if (normalized.includes('lab') && normalized.includes('report')) return 'lab-report';
  if (normalized.includes('prescription')) return 'prescription';
  if (normalized.includes('discharge')) return 'discharge';
  if (normalized.includes('vaccin')) return 'vaccination';
  if (
    normalized.includes('mri') ||
    normalized.includes('ct') ||
    normalized.includes('x-ray') ||
    normalized.includes('scan') ||
    normalized.includes('imaging')
  ) {
    return 'imaging';
  }
  if (normalized.includes('doctor') || normalized.includes('note') || normalized.includes('visit')) {
    return 'doctor-notes';
  }
  return 'prescription';
}

export function getRecordCategoryIcon(category?: string, type?: string) {
  const cat = category || inferRecordCategory(type);
  const match = RECORD_CATEGORIES.find(c => c.id === cat);
  if (match) return match.icon;

  const normalized = (type || '').toLowerCase();
  if (normalized.includes('prescription')) return 'file-document-outline';
  if (normalized.includes('discharge')) return 'hospital-building';
  if (normalized.includes('vaccin')) return 'needle';
  if (normalized.includes('mri') || normalized.includes('ct') || normalized.includes('x-ray')) {
    return 'radioactive';
  }
  if (normalized.includes('doctor') || normalized.includes('note')) return 'stethoscope';
  if (normalized.includes('lab')) return 'flask-outline';
  return 'file-document-outline';
}

export type ReportTrendPoint = {
  label: string;
  value: number;
  unit: string;
  date: string;
};

export type ReportTrend = {
  testName: string;
  points: ReportTrendPoint[];
  improving: boolean;
};

/** Demo trend data shown when real history is unavailable */
export const DEMO_REPORT_TRENDS: ReportTrend[] = [
  {
    testName: 'HbA1c',
    improving: true,
    points: [
      { label: 'Jan', value: 8.2, unit: '%', date: 'Jan 2025' },
      { label: 'Mar', value: 7.5, unit: '%', date: 'Mar 2025' },
      { label: 'Jun', value: 6.8, unit: '%', date: 'Jun 2025' },
    ],
  },
];

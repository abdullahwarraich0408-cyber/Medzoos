import type { LabTest } from '../../../lib/mappers/labTest';

export type LabCategory = {
  id: string;
  label: string;
  icon: string;
};

export const CATEGORIES: LabCategory[] = [
  { id: 'blood', label: 'Blood', icon: '🩸' },
  { id: 'diabetes', label: 'Diabetes', icon: '💉' },
  { id: 'heart', label: 'Heart', icon: '❤️' },
  { id: 'vitamin', label: 'Vitamin', icon: '💊' },
  { id: 'full-body', label: 'Full Body', icon: '🧬' },
];

export const TIME_SLOTS = [
  '7:00 AM – 9:00 AM',
  '9:00 AM – 11:00 AM',
  '11:00 AM – 1:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
  '6:00 PM – 8:00 PM',
];

export const MOCK_LAB_TESTS: LabTest[] = [
  {
    id: '1',
    name: 'Complete Blood Count (CBC)',
    lab: 'Chughtai Lab',
    category: 'blood',
    testsIncluded: 28,
    collectionTime: '30–45 min',
    reportTime: '6–8 hours',
    price: 1200,
    popular: true,
    homeCollection: true,
    description: 'Comprehensive blood analysis including RBC, WBC, platelets, and hemoglobin.',
    discount: null,
  },
  {
    id: '2',
    name: 'HbA1c & Fasting Glucose',
    lab: 'Dr. Essa Laboratory',
    category: 'diabetes',
    testsIncluded: 2,
    collectionTime: '20 min',
    reportTime: '12 hours',
    price: 1800,
    popular: true,
    homeCollection: true,
    description: 'Diabetes monitoring panel with HbA1c and fasting blood sugar.',
    discount: null,
  },
  {
    id: '3',
    name: 'Lipid Profile & Cardiac Risk',
    lab: 'Excel Labs',
    category: 'heart',
    testsIncluded: 8,
    collectionTime: '30 min',
    reportTime: '24 hours',
    price: 2500,
    popular: true,
    homeCollection: true,
    description: 'Cholesterol, triglycerides, HDL, LDL, and cardiac risk markers.',
    discount: null,
  },
  {
    id: '4',
    name: 'Vitamin D & B12 Panel',
    lab: 'Chughtai Lab',
    category: 'vitamin',
    testsIncluded: 2,
    collectionTime: '20 min',
    reportTime: '24 hours',
    price: 3500,
    popular: false,
    homeCollection: true,
    description: 'Vitamin D (25-OH) and Vitamin B12 deficiency screening.',
    discount: null,
  },
  {
    id: '5',
    name: 'Executive Full Body Checkup',
    lab: 'Shaukat Khanum Labs',
    category: 'full-body',
    testsIncluded: 65,
    collectionTime: '45–60 min',
    reportTime: '48 hours',
    price: 8999,
    popular: true,
    homeCollection: true,
    description: 'Comprehensive health screening with 65+ parameters.',
    discount: '20% OFF',
  },
  {
    id: '6',
    name: 'Thyroid Function Test (TFT)',
    lab: 'Dr. Essa Laboratory',
    category: 'blood',
    testsIncluded: 3,
    collectionTime: '20 min',
    reportTime: '12 hours',
    price: 2200,
    popular: false,
    homeCollection: true,
    description: 'TSH, T3, and T4 levels for thyroid health assessment.',
    discount: null,
  },
];

export function getPopularPackages() {
  return MOCK_LAB_TESTS.filter(t => t.popular);
}

export function getLabTestById(id: string) {
  return MOCK_LAB_TESTS.find(t => t.id === id);
}

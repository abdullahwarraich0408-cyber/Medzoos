import type { ImageSourcePropType } from 'react-native';

export type OnboardingAuthTarget = 'signin' | 'register';

export type OnboardingVariant = 'welcome' | 'tour' | 'finish';

export type OnboardingSlideData = {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
  imageLabel: string;
  variant: OnboardingVariant;
};

export const ONBOARDING_SLIDES: OnboardingSlideData[] = [
  {
    id: 'welcome',
    title: 'Your Health, All in One Place',
    description:
      'Connect with doctors, manage your health, order medicines, and access healthcare services from one simple app.',
    image: require('../../assets/onboarding/onboarding-welcome.png'),
    imageLabel:
      'A person using a smartphone with a doctor and health tools nearby',
    variant: 'welcome',
  },
  {
    id: 'doctor',
    title: 'Talk to the Right Doctor',
    description:
      'Find qualified doctors, explore their specialties, and consult them from wherever you are.',
    image: require('../../assets/onboarding/onboarding-doctor.png'),
    imageLabel: 'A doctor on a video consultation with a patient',
    variant: 'tour',
  },
  {
    id: 'medicines',
    title: 'Your Medicines, Made Simple',
    description:
      'Get your prescriptions, order medicines, and keep your medication information organized in one place.',
    image: require('../../assets/onboarding/onboarding-medicines.png'),
    imageLabel: 'A prescription, medicine bottle, and pharmacy delivery',
    variant: 'tour',
  },
  {
    id: 'records',
    title: 'Keep Your Health History With You',
    description:
      'Store prescriptions, lab reports, medical records, and important health information securely in your Medzoos account.',
    image: require('../../assets/onboarding/onboarding-records.png'),
    imageLabel: 'A phone showing health records, prescriptions, and lab reports',
    variant: 'tour',
  },
  {
    id: 'started',
    title: 'Take Control of Your Health',
    description:
      'From finding a doctor to managing medicines and health records, Medzoos helps you manage your healthcare journey in one place.',
    image: require('../../assets/onboarding/onboarding-started.png'),
    imageLabel: 'A doctor and patient with medicines and health records',
    variant: 'finish',
  },
];

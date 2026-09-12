import { iconScheme } from '../../../theme';

export const SUPPORT_CONTACT = {
  email: 'support@medzoos.pk',
  phone: '+923001234567',
  phoneDisplay: '+92 300 123 4567',
  address: 'DHA Phase 6, Karachi\nSindh, Pakistan',
  hours: '24/7 support · Mon–Fri 9am–6pm for calls',
};

/** My activity rows on You home */
export const YOU_ACTIVITY_LINKS = [
  {
    id: 'orders',
    title: 'Orders',
    subtitle: 'Medicines, labs and deliveries',
    icon: 'package-variant-closed',
    tab: 'You' as const,
    screen: 'OrdersList' as const,
  },
  {
    id: 'appointments',
    title: 'Appointments',
    subtitle: 'Upcoming and past visits',
    icon: 'calendar-clock',
    tab: 'You' as const,
    screen: 'Appointments' as const,
  },
  {
    id: 'lab-reports',
    title: 'Lab reports',
    subtitle: 'Results and history',
    icon: 'flask-outline',
    tab: 'Health' as const,
    screen: 'LabReports' as const,
  },
];

/** Profile quick actions on You home */
export const YOU_PROFILE_ACTIONS = [
  {
    id: 'edit-profile',
    title: 'Edit profile',
    tab: 'You' as const,
    screen: 'Settings' as const,
  },
  {
    id: 'family',
    title: 'Family members',
    tab: 'Health' as const,
    screen: 'FamilyProfiles' as const,
  },
];

/** @deprecated Use YOU_ACTIVITY_LINKS — kept for legacy ProfileQuickActions */
export const ACCOUNT_QUICK_ACTIONS = [
  {
    id: 'orders',
    title: 'My Orders',
    icon: 'package-variant',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    tab: 'You' as const,
    screen: 'OrdersList' as const,
  },
  {
    id: 'appointments',
    title: 'Appointments',
    icon: 'calendar-clock',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    tab: 'You' as const,
    screen: 'Appointments' as const,
  },
  {
    id: 'lab-reports',
    title: 'Lab Reports',
    icon: 'file-document-outline',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    tab: 'Health' as const,
    screen: 'LabReports' as const,
  },
  {
    id: 'family',
    title: 'Family Members',
    icon: 'account-group-outline',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    tab: 'Health' as const,
    screen: 'FamilyProfiles' as const,
  },
];

/** Grouped account settings rows */
export const ACCOUNT_SETTINGS = [
  {
    id: 'addresses',
    title: 'Addresses',
    subtitle: 'Saved delivery and collection addresses',
    icon: 'map-marker-outline',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    screen: 'Addresses' as const,
  },
  {
    id: 'payments',
    title: 'Payments',
    subtitle: 'Cards, wallets and payment methods',
    icon: 'credit-card-outline',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    screen: 'Payments' as const,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    subtitle: 'Alerts, reminders and preferences',
    icon: 'bell-outline',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    screen: 'Notifications' as const,
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    subtitle: 'Account protection and login settings',
    icon: 'shield-lock-outline',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    screen: 'PrivacySecurity' as const,
  },
  {
    id: 'support',
    title: 'Support',
    subtitle: 'Help center, contact and FAQs',
    icon: 'headset',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    screen: 'Support' as const,
  },
];

/** More services cards on You home */
export const ACCOUNT_MORE_SERVICES = [
  {
    id: 'lab-tests',
    title: 'Lab Tests',
    subtitle: 'Book tests and home sample collection',
    icon: 'flask-outline',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    tab: 'Home' as const,
    screen: 'LabTestsList' as const,
    viaServices: true,
  },
  {
    id: 'consult',
    title: 'Healthcare Services',
    subtitle: 'Doctors, hospitals and video visits',
    icon: 'stethoscope',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    tab: 'Home' as const,
    screen: 'ServicesHub' as const,
    viaServices: false,
  },
];

/** Cross-tab shortcuts for guest browse */
export const ACCOUNT_QUICK_LINKS = [
  ...ACCOUNT_MORE_SERVICES,
  {
    id: 'orders',
    title: 'My Orders',
    subtitle: 'Medicines, labs and appointments',
    icon: 'package-variant',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    tab: 'You' as const,
    screen: 'OrdersList' as const,
    viaServices: false,
  },
];

/** Legacy menu — kept for other screens if referenced */
export const ACCOUNT_MENU = [
  {
    id: 'profile',
    title: 'Profile',
    subtitle: 'Personal info, blood group and health summary',
    icon: 'account-circle-outline',
    iconColor: iconScheme.color,
    iconBg: iconScheme.bg,
    screen: 'Profile' as const,
  },
  ...ACCOUNT_SETTINGS,
];

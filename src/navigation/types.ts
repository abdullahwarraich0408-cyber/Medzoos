import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  SignIn: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  PhoneSignIn: undefined;
  OtpVerify: {
    phone: string;
    confirmation: import('../types/auth').PhoneLoginConfirmation;
  };
  CompleteProfile: undefined;
};

export type GuestStackParamList = {
  Onboarding: undefined;
} & AuthStackParamList;

export type AccountStackParamList = {
  /** @deprecated Use YouHome */
  AccountHome?: undefined;
  YouHome: undefined;
  Profile: undefined;
  Addresses: undefined;
  Payments: undefined;
  Notifications: undefined;
  Settings: undefined;
  Support: undefined;
} & AuthStackParamList;

export type YouStackParamList = AccountStackParamList &
  OrdersStackParamList & {
    YouHome: undefined;
  };

export type DoctorsStackParamList = {
  ConsultHome: undefined;
  DoctorsList:
    | {
        consultType?: 'online' | 'in_person';
        specialty?: string;
        screenTitle?: string;
        onlineOnly?: boolean;
      }
    | undefined;
  HospitalsList: undefined;
  HospitalDetail: { hospitalId: string; consultType?: 'online' | 'in_person' };
  Specialties: undefined;
  DoctorProfile: {
    doctorId: string;
    hospitalId?: string;
    consultType?: 'online' | 'in_person';
  };
  DoctorBooking: {
    doctorId: string;
    consultType: 'online' | 'in_person';
    practiceLocationId?: string | null;
    hospitalId?: string | null;
  };
  HealthPackages: undefined;
  LabTestsList: undefined;
  LabsList: undefined;
  LabDetail: { labId: string };
  LabTestBooking: { testId: string };
  LabCart: undefined;
  LabReports: undefined;
};

export type HealthStackParamList = {
  HealthHome: undefined;
  MedicinesList: { category?: string } | undefined;
  MedicineDetail: { medicineId: string };
  PrescriptionDetail: { prescriptionId: string };
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  LabReports: undefined;
  MedicalRecords: undefined;
  DoctorRecordsDetail: { doctorId: string };
  LabRecordsDetail: { labId: string };
  FamilyProfiles: undefined;
  FamilyMemberDetail: { memberId: string };
  HealthHistory: undefined;
  UploadMedicalDocument: undefined;
};

/** @deprecated Use HealthStackParamList */
export type MedicinesStackParamList = Pick<
  HealthStackParamList,
  'MedicinesList' | 'ProductDetail' | 'Cart' | 'Checkout'
>;

/** Lab test flow screens shared by Health and Services stacks */
export type LabFlowParamList = {
  LabTestsList: undefined;
  LabsList: undefined;
  LabDetail: { labId: string };
  LabTestBooking: { testId: string };
  LabCart: undefined;
  LabReports: undefined;
};

/** @deprecated Use LabFlowParamList */
export type LabTestsStackParamList = LabFlowParamList;

export type OrdersStackParamList = {
  OrdersList: { filter?: 'all' | 'medicines' | 'lab' | 'doctor' | 'hospital' | 'prescription' } | undefined;
  Appointments: undefined;
  AppointmentDetail: { appointmentId: string };
  AppointmentVideo: {
    appointmentId: string;
    doctorName: string;
    doctorImage?: string;
    slot?: string;
  };
  OrderDetail: { orderRef: string };
  AppointmentChat: { appointmentId: string; doctorName?: string };
};

export type HomeStackParamList = {
  Dashboard: undefined;
  ServicesHub: undefined;
  Services: NavigatorScreenParams<DoctorsStackParamList> | undefined;
};

export type CopilotStackParamList = {
  CopilotHome: { initialPrompt?: string } | undefined;
};

export type CommunityStackParamList = {
  CommunityHome: undefined;
  PostDetail: { postId: string; groupId?: string };
  CreatePost: { groupId?: string; mode?: 'text' | 'video' } | undefined;
  ChallengeDetail: { challengeId: string };
  GroupDetail: { groupId: string };
  CreateGroup: undefined;
  CreateChallenge: undefined;
  AddGroupMember: { groupId: string };
  Buddies: undefined;
  AddBuddy: undefined;
  WeeklyReport: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Copilot: NavigatorScreenParams<CopilotStackParamList> | undefined;
  Health: NavigatorScreenParams<HealthStackParamList> | undefined;
  Community: NavigatorScreenParams<CommunityStackParamList> | undefined;
  You: NavigatorScreenParams<YouStackParamList> | undefined;
  /** @deprecated Use Home → Services or You */
  Consult?: NavigatorScreenParams<DoctorsStackParamList> | undefined;
  /** @deprecated Use You → OrdersList */
  Orders?: NavigatorScreenParams<OrdersStackParamList> | undefined;
  /** @deprecated Use You */
  Account?: NavigatorScreenParams<YouStackParamList> | undefined;
};

export type PharmaciesStackParamList = {
  PharmaciesList: undefined;
  PharmacyDetail: { vendorId: string; slug?: string; name?: string };
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
};

export type HospitalsStackParamList = {
  HospitalsList: undefined;
  HospitalDetail: { hospitalId: string; consultType?: 'online' | 'in_person' };
  DoctorProfile: {
    doctorId: string;
    hospitalId?: string;
    consultType?: 'online' | 'in_person';
  };
  DoctorBooking: {
    doctorId: string;
    consultType: 'online' | 'in_person';
    practiceLocationId?: string | null;
    hospitalId?: string | null;
  };
};

export type DrawerParamList = {
  MainTabs: { screen?: keyof MainTabParamList } | undefined;
  Hospitals: NavigatorScreenParams<HospitalsStackParamList> | undefined;
  Pharmacies: NavigatorScreenParams<PharmaciesStackParamList> | undefined;
  Offers: undefined;
  Prescriptions: undefined;
  Help: undefined;
  Contact: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends DrawerParamList {}
  }
}

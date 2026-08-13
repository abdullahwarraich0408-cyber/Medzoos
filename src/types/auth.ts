/**
 * Shared Medzoos authentication types (web + mobile).
 */

export type UserRole =
  | 'customer'
  | 'admin'
  | 'doctor'
  | 'vendor'
  | 'pharmacy'
  | 'lab'
  | 'hospital';

export type MembershipPlan = 'FREE' | 'CARE_PLUS' | 'FAMILY_PLUS';

export type AuthPlatform = 'web' | 'android' | 'ios';

export interface AuthUser {
  id: string;
  accountId?: string;
  firebaseUid?: string;
  email?: string | null;
  phone?: string | null;
  name?: string;
  avatar?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  isVerified?: boolean;
  role?: UserRole;
  membershipStatus?: MembershipPlan;
  membershipExpiry?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSessionResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  tokens?: AuthTokens;
}

export interface FirebaseAuthRequest {
  idToken: string;
  deviceId?: string;
  platform?: AuthPlatform;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
  gender?: string;
  dateOfBirth?: string;
}

export interface PendingAuthAction {
  type: 'checkout' | 'doctor_booking' | 'lab_booking' | 'hospital_booking' | 'reports' | 'profile';
  returnTo?: string;
  params?: Record<string, unknown>;
}

/** Phone OTP flow — mirrors website AuthProvider confirmation object */
export type PhoneLoginConfirmation =
  | { dev: true; phone: string }
  | { dev: false; verificationId: string };

export interface FamilyProfile {
  id: string;
  userId: string;
  fullName: string;
  relationship: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  bloodGroup?: string | null;
  medicalNotes?: string | null;
}

export interface UserSession {
  id: string;
  userId: string;
  deviceId: string;
  platform: AuthPlatform;
  expiresAt: string;
  createdAt: string;
}

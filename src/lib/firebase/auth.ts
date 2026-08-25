import { Platform } from 'react-native';
import type { AuthPlatform, PendingAuthAction } from '../../types/auth';

/**
 * Firebase helpers (phone OTP / Apple later).
 * Google login is Google OAuth — see `../auth/googleOAuth.ts`.
 */

export const FIREBASE_ENABLED = false;

export function getAuthPlatform(): AuthPlatform {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}

export type PhoneAuthResult = {
  verificationId: string;
};

export async function sendPhoneOtp(
  phoneNumber: string,
): Promise<PhoneAuthResult> {
  if (!FIREBASE_ENABLED) {
    throw new Error(
      'Firebase Phone Auth is not configured. Install @react-native-firebase/auth and rebuild the app.',
    );
  }

  void phoneNumber;
  throw new Error('Firebase Phone Auth native module not linked');
}

export async function verifyPhoneOtp(
  _verificationId: string,
  _code: string,
): Promise<string> {
  if (!FIREBASE_ENABLED) {
    throw new Error(
      'Firebase Phone Auth is not configured. Install @react-native-firebase/auth and rebuild the app.',
    );
  }

  throw new Error('Firebase Phone Auth native module not linked');
}

export async function signInWithAppleIdToken(): Promise<string> {
  throw new Error(
    'Apple Sign-In requires @invertase/react-native-apple-authentication and is only available on iOS.',
  );
}

let pendingAction: PendingAuthAction | null = null;

export function setPendingAuthAction(action: PendingAuthAction | null) {
  pendingAction = action;
}

export function consumePendingAuthAction(): PendingAuthAction | null {
  const action = pendingAction;
  pendingAction = null;
  return action;
}

export function getPendingAuthAction(): PendingAuthAction | null {
  return pendingAction;
}

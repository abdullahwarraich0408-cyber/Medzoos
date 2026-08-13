import { Platform } from 'react-native';
import type { AuthPlatform, PendingAuthAction } from '../../types/auth';

/**
 * Firebase React Native setup requires native configuration:
 * 1. npm install @react-native-firebase/app @react-native-firebase/auth
 * 2. Add google-services.json (Android) and GoogleService-Info.plist (iOS)
 * 3. Rebuild the native app
 *
 * Until native Firebase is linked, OTP flows surface a clear configuration error.
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

  // Native implementation after @react-native-firebase/auth is linked:
  // const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
  // return { verificationId: confirmation.verificationId };
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

  // const credential = auth.PhoneAuthProvider.credential(verificationId, code);
  // const result = await auth().signInWithCredential(credential);
  // return result.user.getIdToken();
  throw new Error('Firebase Phone Auth native module not linked');
}

export async function signInWithGoogleIdToken(): Promise<string> {
  if (!FIREBASE_ENABLED) {
    throw new Error(
      'Google Sign-In requires @react-native-firebase/auth and @react-native-google-signin/google-signin.',
    );
  }
  throw new Error('Google Sign-In native module not linked');
}

export async function signInWithAppleIdToken(): Promise<string> {
  if (!FIREBASE_ENABLED) {
    throw new Error(
      'Apple Sign-In requires @react-native-firebase/auth and @invertase/react-native-apple-authentication.',
    );
  }
  throw new Error('Apple Sign-In native module not linked');
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

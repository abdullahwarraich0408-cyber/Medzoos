import { Platform } from 'react-native';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '../../config/googleAuth';

/**
 * Google OAuth (not Firebase Auth).
 * Flow matches the website:
 * 1) Native Google account picker → Google ID token
 * 2) POST /api/auth/google { idToken } → Medzoos session
 *
 * Requires Backend GOOGLE_CLIENT_ID === GOOGLE_WEB_CLIENT_ID
 * and an Android OAuth client in Google Cloud with package com.medcare + SHA-1.
 */

let configured = false;

function ensureConfigured() {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
  configured = true;
}

function formatGoogleOAuthError(error: unknown): Error {
  if (isErrorWithCode(error)) {
    switch (error.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        return new Error('Google sign-in was cancelled.');
      case statusCodes.IN_PROGRESS:
        return new Error('Google sign-in is already in progress.');
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        return new Error(
          'Google Play Services is missing or outdated. Update Play Services and try again.',
        );
      case statusCodes.SIGN_IN_REQUIRED:
        return new Error('Please sign in with Google to continue.');
      default:
        break;
    }

    const message = error.message || '';
    if (
      message.includes('DEVELOPER_ERROR') ||
      message.includes('ApiException: 10') ||
      error.code === '10'
    ) {
      return new Error(
        'Google OAuth is misconfigured for this Android build. In Google Cloud Console, create an OAuth client of type Android for package com.medcare, add the app SHA-1, then rebuild.',
      );
    }
  }

  if (error instanceof Error && error.message) {
    return error;
  }

  return new Error('Google sign-in failed. Please try again.');
}

/** Opens Google account picker and returns a Google OAuth ID token. */
export async function signInWithGoogleIdToken(): Promise<string> {
  try {
    ensureConfigured();

    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) {
      throw new Error('Google sign-in was cancelled.');
    }

    const idToken =
      response.data.idToken || (await GoogleSignin.getTokens()).idToken;

    if (!idToken) {
      throw new Error(
        'Google did not return an ID token. GOOGLE_WEB_CLIENT_ID must be an OAuth client of type Web.',
      );
    }

    return idToken;
  } catch (error) {
    throw formatGoogleOAuthError(error);
  }
}

export async function signOutGoogle(): Promise<void> {
  try {
    ensureConfigured();
    await GoogleSignin.signOut();
  } catch {
    // Ignore — local Medzoos session logout still proceeds.
  }
}

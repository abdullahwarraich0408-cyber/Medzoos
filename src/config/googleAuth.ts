/**
 * Google OAuth Web client ID.
 *
 * Must match:
 * - Backend `GOOGLE_CLIENT_ID`
 * - Frontend `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
 *
 * This is OAuth type "Web application" (not Firebase Auth).
 * Android also needs a separate OAuth client of type "Android"
 * (package `com.medcare` + SHA-1) in Google Cloud Console.
 */
export const GOOGLE_WEB_CLIENT_ID =
  '1083815277954-9spbmn6ppfe4nnb3eong8dbihn44211a.apps.googleusercontent.com';

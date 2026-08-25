# Firebase Authentication — Environment Variables

## Backend (`Backend/.env`)

```env
# Existing JWT secrets (required)
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Firebase Admin SDK — choose ONE method:

# Option A: Full service account JSON (single line)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}

# Option B: Individual fields
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Customer Web (`Frontend/Frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Mobile Google OAuth (`app/medCare`) — not Firebase Auth

Same flow as the website:

1. App opens Google account picker (`@react-native-google-signin/google-signin`)
2. App gets a Google **ID token**
3. App calls `POST /api/auth/google` with `{ idToken }`
4. Backend verifies token with Google (`tokeninfo`) using `GOOGLE_CLIENT_ID`

### Config checklist

| Place | Value |
|-------|--------|
| `src/config/googleAuth.ts` → `GOOGLE_WEB_CLIENT_ID` | Web OAuth client ID |
| Backend `.env` → `GOOGLE_CLIENT_ID` | Same Web client ID |
| Frontend → `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same Web client ID |

### Android OAuth client (required)

Create this in the **same Google Cloud project as the Web client**
(`1083815277954-9spbmn6ppfe4nnb3eong8dbihn44211a` — RouteBuddy), not Medzoos.

Google Auth Platform → Clients → **+ Create client**:

1. Application type: **Android**
2. Package name: `com.medcare`
3. SHA-1 (release / upload keystore — use this for tester APKs):
   ```
   3F:F2:9C:D6:73:9B:78:27:9A:87:E4:50:00:A6:F0:CC:6C:4B:F8:BB
   ```
4. Create → wait 5–10 minutes → rebuild release APK

Get release SHA-1 anytime:
```bash
keytool -list -v -keystore android/app/medcare-upload.keystore -alias medcare -storepass medcare123 -keypass medcare123
```

Note: the old debug SHA-1 (`5E:8F:...`) is already claimed by another Google Cloud project, so release builds use `medcare-upload.keystore` instead.

Without the Android OAuth client + matching SHA-1, Google login fails with `DEVELOPER_ERROR` / ApiException 10.

### Phone OTP (Firebase — optional, separate)

```bash
npm install @react-native-firebase/auth
```

Set `FIREBASE_ENABLED = true` in `src/lib/firebase/auth.ts` after linking.

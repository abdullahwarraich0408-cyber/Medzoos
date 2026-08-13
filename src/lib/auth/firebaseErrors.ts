import { normalizePhoneNumber } from './phoneUtils';

/** Test accounts — must match Backend dev-auth.service.js */
export const DEV_TEST_PHONES = ['+923361400372', '+923361400373'];
export const DEV_TEST_PHONE = DEV_TEST_PHONES[0];
export const DEV_TEST_OTP = '123456';

export function isTestAuthEnabled(): boolean {
  return __DEV__;
}

export function isDevTestPhone(phone: string): boolean {
  const normalized =
    normalizePhoneNumber(phone) || String(phone || '').replace(/[\s-]/g, '');
  return DEV_TEST_PHONES.some(p => p.replace(/[\s-]/g, '') === normalized);
}

export function isDevTestOtp(code: string): boolean {
  return String(code || '').trim() === DEV_TEST_OTP;
}

export function formatFirebaseAuthError(error: unknown): string {
  const err = error as { code?: string; message?: string; status?: number };
  const code = err?.code || '';
  const message = err?.message || String(error || 'Authentication failed');

  if (
    message.includes('Unable to reach the server') ||
    message.includes('Network request failed') ||
    message.includes('Failed to fetch') ||
    err?.status === 0
  ) {
    return [
      'Cannot reach the Medzoos API from this phone.',
      '',
      'Fix (USB):',
      '1. Keep the phone plugged in',
      '2. On your PC run: npm run connect:android',
      '3. Confirm Backend is running on port 5000',
      '',
      'Then try phone sign-in again with OTP 123456.',
    ].join('\n');
  }

  if (code === 'auth/operation-not-allowed' || message.includes('region enabled')) {
    if (isTestAuthEnabled()) {
      return [
        'Firebase SMS is not available for this build.',
        '',
        'Local phone sign-in:',
        `Enter any valid number → OTP ${DEV_TEST_OTP}`,
      ].join('\n');
    }
    return [
      'Phone OTP is not available yet for Pakistan.',
      '',
      'Options:',
      '• Sign in with email',
      '• Ask admin to enable Blaze + Pakistan SMS in Firebase',
    ].join('\n');
  }

  if (code === 'auth/invalid-phone-number') {
    return 'Invalid phone format. Use 03361400372 or +923361400372.';
  }

  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Wait a few minutes and try again.';
  }

  if (message.includes('Firebase Phone Auth is not configured')) {
    if (isTestAuthEnabled()) {
      return [
        'Firebase SMS is not linked yet.',
        '',
        'Local phone sign-in (no SMS):',
        `Any valid number → OTP ${DEV_TEST_OTP}`,
      ].join('\n');
    }
    return message;
  }

  if (
    message.includes('Invalid OTP') ||
    message.includes('Invalid authentication') ||
    message.includes('Invalid dev test') ||
    message.includes('Test login') ||
    message.includes('local phone sign-in')
  ) {
    return message;
  }

  if (
    /Invalid `prisma|does not exist on the database server|PrismaClient/i.test(
      message,
    )
  ) {
    return 'Sign-in is temporarily unavailable. Please try again in a moment.';
  }

  const cleaned = message.replace(/^Firebase:\s*/i, '').trim();
  if (cleaned.length > 180 || cleaned.includes('\n')) {
    return 'Could not verify that code. Please try again.';
  }

  return cleaned;
}

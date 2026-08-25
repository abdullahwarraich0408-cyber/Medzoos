import {
  paymentsApi,
  type StripeCheckoutPayload,
  type StripeVerifyResponse,
} from '../api';
import { STRIPE_RETURN_BASE_URL } from '../../config/stripe';

export type StartStripeCheckoutResult = {
  checkoutUrl: string;
  sessionId?: string;
};

export async function startStripeCheckout(
  payload: Omit<StripeCheckoutPayload, 'payment_method' | 'frontend_url'> & {
    frontend_url?: string;
  },
): Promise<StartStripeCheckoutResult> {
  const payment = await paymentsApi.checkout({
    ...payload,
    payment_method: 'stripe',
    frontend_url: payload.frontend_url || STRIPE_RETURN_BASE_URL,
  });

  if (!payment.checkoutUrl) {
    throw new Error('Stripe checkout URL was not returned');
  }

  return {
    checkoutUrl: payment.checkoutUrl,
    sessionId: payment.sessionId,
  };
}

export async function verifyStripePayment(
  sessionId: string,
): Promise<StripeVerifyResponse> {
  return paymentsApi.verifyStripeSession(sessionId);
}

/** Extract Stripe session_id from a Checkout return URL. */
export function extractStripeSessionId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const sessionId =
      parsed.searchParams.get('session_id') ||
      parsed.searchParams.get('sessionId');
    return sessionId && sessionId.startsWith('cs_') ? sessionId : null;
  } catch {
    const match = url.match(/[?&]session_id=([^&]+)/i);
    if (!match?.[1]) return null;
    const value = decodeURIComponent(match[1]);
    return value.startsWith('cs_') ? value : null;
  }
}

export function isStripeSuccessReturnUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    Boolean(extractStripeSessionId(url)) &&
    (lower.includes('success=true') ||
      lower.includes('payment=success') ||
      lower.includes('/payment/complete') ||
      lower.includes('/checkout?') ||
      lower.includes('session_id='))
  );
}

export function isStripeCancelReturnUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes('cancelled=true') ||
    lower.includes('canceled=true') ||
    lower.includes('payment=cancel')
  );
}

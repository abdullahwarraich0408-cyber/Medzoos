/**
 * Stripe uses hosted Checkout Sessions (same as the website).
 * Success/cancel URLs are built from this base by the Backend.
 * The in-app WebView intercepts return URLs containing session_id.
 */
export const STRIPE_RETURN_BASE_URL = 'https://medzoos.com';

/**
 * Same-page Razorpay pay flow via Checkout.js — supports both recurring
 * subscriptions and one-time lifetime orders.
 * UPI (Google Pay, PhonePe, etc.) and UPI QR appear inside Razorpay’s modal when
 * those methods are enabled for your account in the Razorpay Dashboard — no
 * separate PhonePe/Google Pay integration is required.
 */

const CHECKOUT_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptLoadPromise: Promise<void> | null = null;

export type RazorpaySubscriptionPaymentResponse = {
  razorpay_payment_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature?: string;
};

export type RazorpayOrderPaymentResponse = {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

export type OpenSubscriptionCheckoutParams = {
  keyId: string;
  subscriptionId: string;
  businessName: string;
  planLabel: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess?: (response: RazorpaySubscriptionPaymentResponse) => void;
  onDismiss?: () => void;
};

export type OpenOrderCheckoutParams = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  businessName: string;
  planLabel: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess?: (response: RazorpayOrderPaymentResponse) => void;
  onDismiss?: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function loadRazorpayCheckoutScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = CHECKOUT_SCRIPT;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error('Failed to load Razorpay Checkout'));
    document.body.appendChild(el);
  });
  return scriptLoadPromise;
}

/**
 * Opens Razorpay’s subscription payment modal on the current page (no full navigation).
 */
export async function openRazorpaySubscriptionCheckout(
  params: OpenSubscriptionCheckoutParams
): Promise<void> {
  await loadRazorpayCheckoutScript();
  const Ctor = window.Razorpay;
  if (!Ctor) {
    throw new Error('Razorpay Checkout is not available');
  }

  const options: Record<string, unknown> = {
    key: params.keyId,
    subscription_id: params.subscriptionId,
    name: params.businessName,
    description: params.planLabel,
    prefill: params.prefill ?? {},
    handler(response: RazorpaySubscriptionPaymentResponse) {
      params.onSuccess?.(response);
    },
    modal: {
      ondismiss() {
        params.onDismiss?.();
      },
    },
    theme: { color: '#a17c2a' },
  };

  const instance = new Ctor(options);
  instance.open();
}

/**
 * Opens Razorpay’s one-time order payment modal (used for lifetime plans).
 */
export async function openRazorpayOrderCheckout(
  params: OpenOrderCheckoutParams
): Promise<void> {
  await loadRazorpayCheckoutScript();
  const Ctor = window.Razorpay;
  if (!Ctor) {
    throw new Error('Razorpay Checkout is not available');
  }

  const options: Record<string, unknown> = {
    key: params.keyId,
    order_id: params.orderId,
    amount: params.amount,
    currency: params.currency,
    name: params.businessName,
    description: params.planLabel,
    prefill: params.prefill ?? {},
    handler(response: RazorpayOrderPaymentResponse) {
      params.onSuccess?.(response);
    },
    modal: {
      ondismiss() {
        params.onDismiss?.();
      },
    },
    theme: { color: '#a17c2a' },
  };

  const instance = new Ctor(options);
  instance.open();
}

export {};

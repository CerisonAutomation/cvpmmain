/**
 * useStripe — Lazy-loads Stripe.js from CDN.
 * Avoids bundling Stripe (keeps the bundle lean).
 */
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Stripe?: (key: string) => StripeInstance;
  }
}

export interface StripeInstance {
  elements: (options?: Record<string, unknown>) => StripeElements;
  confirmPayment: (options: {
    elements: StripeElements;
    confirmParams: { return_url?: string };
    redirect: 'if_required' | 'always';
  }) => Promise<{ error?: { message?: string }; paymentIntent?: { status: string } }>;
}

export interface StripeElements {
  create: (type: string, options?: Record<string, unknown>) => StripeElement;
  getElement: (type: string) => StripeElement | null;
  submit: () => Promise<{ error?: { message?: string } }>;
  update: (options: Record<string, unknown>) => void;
}

export interface StripeElement {
  mount: (selector: string | HTMLElement) => void;
  unmount: () => void;
  on: (event: string, handler: (e: unknown) => void) => void;
  destroy: () => void;
}

let stripePromise: Promise<StripeInstance | null> | null = null;

function loadStripeJs(): Promise<StripeInstance | null> {
  if (stripePromise) return stripePromise;

  stripePromise = new Promise((resolve) => {
    if (window.Stripe) {
      const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      resolve(key ? window.Stripe(key) : null);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => {
      const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      resolve(key && window.Stripe ? window.Stripe(key) : null);
    };
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });

  return stripePromise;
}

export function useStripeLoader() {
  const [stripe, setStripe] = useState<StripeInstance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStripeJs().then((s) => {
      setStripe(s);
      setLoading(false);
    });
  }, []);

  return { stripe, loading };
}

/**
 * PaymentForm — Stripe Payment Element
 *
 * Renders the Stripe Payment Element (card, SEPA, etc) inside a container.
 * Handles confirmation and surfaces errors.
 */
import { useEffect, useRef, useState } from 'react';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStripeLoader } from '@/lib/useStripe';
import type { StripeElements } from '@/lib/useStripe';

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
  disabled?: boolean;
}

export default function PaymentForm({
  clientSecret,
  amount,
  currency,
  onSuccess,
  onError,
  disabled,
}: PaymentFormProps) {
  const { stripe, loading: stripeLoading } = useStripeLoader();
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const [mounted, setMounted] = useState(false);
  const [paying, setPaying] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Mount Stripe Payment Element
  useEffect(() => {
    if (!stripe || !clientSecret || !containerRef.current) return;

    const elements = stripe.elements({
      clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#C9A96E',
          colorBackground: '#ffffff',
          colorText: '#1a1a1a',
          colorDanger: '#df1b41',
          fontFamily: 'Inter, system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '4px',
          fontSizeBase: '14px',
        },
      },
    });

    const paymentElement = elements.create('payment', {
      layout: { type: 'tabs', defaultCollapsed: false },
    });

    paymentElement.mount(containerRef.current);
    elementsRef.current = elements;
    setMounted(true);

    paymentElement.on('change', (e: unknown) => {
      const event = e as { error?: { message?: string } };
      if (event.error?.message) {
        setLocalError(event.error.message);
      } else {
        setLocalError(null);
      }
    });

    return () => {
      paymentElement.unmount();
      paymentElement.destroy();
      elementsRef.current = null;
      setMounted(false);
    };
  }, [stripe, clientSecret]);

  const handlePay = async () => {
    if (!stripe || !elementsRef.current) return;
    setLocalError(null);
    setPaying(true);

    // First validate the element
    const { error: submitError } = await elementsRef.current.submit();
    if (submitError) {
      setLocalError(submitError.message ?? 'Please check your payment details.');
      setPaying(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements: elementsRef.current,
      confirmParams: {},
      redirect: 'if_required',
    });

    setPaying(false);

    if (error) {
      const msg = error.message ?? 'Payment failed. Please try again.';
      setLocalError(msg);
      onError(msg);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    } else if (paymentIntent?.status === 'requires_action') {
      setLocalError('Additional authentication is required. Please follow the prompts.');
    } else {
      setLocalError('Payment could not be completed. Please try again.');
    }
  };

  if (stripeLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading payment form...</span>
      </div>
    );
  }

  if (!stripe) {
    return (
      <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg text-sm text-destructive flex items-start gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        Payment form unavailable — Stripe is not configured. Please contact support.
      </div>
    );
  }

  const displayAmount = `${currency} ${amount.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-5">
      {/* Stripe Payment Element container */}
      <div>
        <div
          ref={containerRef}
          className={`min-h-[120px] transition-opacity duration-200 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        />
        {!mounted && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {localError && (
        <div className="flex items-start gap-2 p-3 border border-destructive/30 bg-destructive/5 rounded-md text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {localError}
        </div>
      )}

      <Button
        onClick={handlePay}
        disabled={!mounted || paying || disabled}
        className="w-full h-12 text-sm font-semibold"
      >
        {paying ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing payment...
          </>
        ) : (
          `Pay ${displayAmount}`
        )}
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
        Secure payment powered by Stripe
      </div>
    </div>
  );
}

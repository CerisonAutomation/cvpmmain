/**
 * BookingCheckout — Multi-step checkout page
 *
 * Steps:
 *   1. guest-details — collect guest name/email/phone
 *   2. payment       — Stripe Payment Element
 *   3. confirmation  — polls booking status until confirmed/inquiry_required
 *
 * URL params:
 *   listing=<listingId>
 *   quoteId=<guestyQuoteId>
 *   checkIn=YYYY-MM-DD
 *   checkOut=YYYY-MM-DD
 *   guests=<n>
 */
import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Clock,
  Star,
  Loader2,
  AlertCircle,
  User,
  Check,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PaymentForm from '@/components/PaymentForm';
import BookingConfirmation from '@/components/BookingConfirmation';
import InquiryForm from '@/components/InquiryForm';
import { useListing, useQuote, normalizeListingDetail } from '@/lib/guesty/hooks';
import { initiateCheckout } from '@/lib/checkout';
import type { GuestDetails } from '@/lib/checkout';
import { cn } from '@/lib/utils';

// ── Step indicator ────────────────────────────────────────────────────────────

const STEPS = ['Details', 'Payment', 'Confirmed'] as const;
type Step = 'details' | 'payment' | 'confirmation';

function StepIndicator({ current }: { current: Step }) {
  const idx = current === 'details' ? 0 : current === 'payment' ? 1 : 2;
  return (
    <nav aria-label="Checkout steps" className="flex items-center gap-0">
      {STEPS.map((label, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={label} className="flex items-center">
            <div
              className={cn(
                'flex items-center gap-1.5 text-[11px] font-medium',
                active ? 'text-foreground' : done ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <span
                className={cn(
                  'w-5 h-5 flex items-center justify-center text-[10px] rounded-full border',
                  active
                    ? 'border-foreground bg-foreground text-background'
                    : done
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border'
                )}
              >
                {done ? <Check size={10} /> : i + 1}
              </span>
              {label}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'w-8 h-px mx-2',
                  i < idx ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ── Guest details form ────────────────────────────────────────────────────────

const guestSchema = z.object({
  firstName: z.string().trim().min(1, 'Required').max(50),
  lastName: z.string().trim().min(1, 'Required').max(50),
  email: z.string().trim().email('Valid email required').max(255),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,20}$/, 'Valid phone required'),
});

type GuestFormData = z.infer<typeof guestSchema>;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-[10px] text-destructive mt-0.5">{msg}</p>;
}

// ── Booking summary sidebar ───────────────────────────────────────────────────

function BookingSummary({
  title,
  heroImage,
  city,
  checkIn,
  checkOut,
  guestsCount,
  total,
  currency,
  nights,
  accommodation,
  cleaningFee,
  taxes,
}: {
  title?: string;
  heroImage?: string;
  city?: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  total?: number;
  currency?: string;
  nights: number;
  accommodation?: number;
  cleaningFee?: number;
  taxes?: number;
}) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <aside className="border border-border/50 rounded-xl bg-card overflow-hidden sticky top-24">
      {/* Property image */}
      {heroImage && heroImage !== '/placeholder.svg' && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={heroImage}
            alt={title ?? 'Property'}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Property info */}
        {title && (
          <div>
            <h3 className="font-semibold text-sm leading-tight">{title}</h3>
            {city && <p className="text-xs text-muted-foreground mt-0.5">{city}</p>}
          </div>
        )}

        {/* Stay dates */}
        <div className="space-y-1.5 text-xs border-t border-border/30 pt-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-in</span>
            <span className="font-medium">{checkIn ? fmt(checkIn) : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-out</span>
            <span className="font-medium">{checkOut ? fmt(checkOut) : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Guests</span>
            <span className="font-medium">{guestsCount}</span>
          </div>
        </div>

        {/* Price breakdown */}
        {total != null && (
          <div className="space-y-1.5 text-xs border-t border-border/30 pt-4">
            {accommodation != null && (
              <div className="flex justify-between text-muted-foreground">
                <span>Accommodation ({nights}n)</span>
                <span>{currency} {accommodation.toLocaleString()}</span>
              </div>
            )}
            {cleaningFee != null && cleaningFee > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Cleaning fee</span>
                <span>{currency} {cleaningFee.toLocaleString()}</span>
              </div>
            )}
            {taxes != null && taxes > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Taxes</span>
                <span>{currency} {taxes.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-sm pt-1 border-t border-border/30">
              <span>Total</span>
              <span>{currency} {total.toLocaleString('en-EU', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        )}

        {/* Trust */}
        <div className="border-t border-border/30 pt-4 space-y-1.5">
          {[
            { Icon: ShieldCheck, label: 'Secure encrypted payment' },
            { Icon: CreditCard, label: 'Direct booking rates' },
            { Icon: Clock, label: 'Instant confirmation' },
            { Icon: Star, label: 'Verified properties' },
          ].map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Icon className="w-3 h-3 text-primary shrink-0" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BookingCheckout() {
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('listing') ?? '';
  const quoteId = searchParams.get('quoteId') ?? '';
  const checkIn = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';
  const guestsCount = Number(searchParams.get('guests') ?? '2');

  const { data: rawListing } = useListing(listingId || undefined);
  const { data: quote, isLoading: quoteLoading } = useQuote(quoteId || undefined);

  const property = rawListing ? normalizeListingDetail(rawListing) : null;

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
    ));
  }, [checkIn, checkOut]);

  const [step, setStep] = useState<Step>('details');
  const [guestDetails, setGuestDetails] = useState<GuestDetails | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '' },
  });

  // Step 1 → Step 2: create booking + Stripe PaymentIntent
  const onGuestSubmit = async (data: GuestFormData) => {
    if (!quote) return;
    setCheckoutError(null);
    setCheckoutLoading(true);

    try {
      const result = await initiateCheckout({
        quote,
        listingId,
        checkIn,
        checkOut,
        guestsCount,
        guest: data,
      });

      setGuestDetails(data);
      setClientSecret(result.clientSecret);
      setBookingId(result.bookingId);
      setStep('payment');
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : 'Failed to initiate checkout. Please try again.'
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Missing required params — show fallback
  if (!listingId || !quoteId) {
    return (
      <Layout>
        <section className="py-16 text-center">
          <div className="section-container">
            <p className="text-muted-foreground text-sm mb-4">
              No booking information found. Please select a property and dates first.
            </p>
            <Button asChild>
              <Link to="/properties">Browse Properties</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section-container py-3">
        <Link
          to={`/properties/${listingId}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} />
          Back to property
        </Link>
      </div>

      <section className="py-8 pb-16">
        <div className="section-container">
          <div className="grid lg:grid-cols-[1fr_360px] gap-10 max-w-5xl mx-auto">
            {/* Main content */}
            <div className="space-y-8">
              {/* Step indicator */}
              <div>
                <p className="micro-type text-primary mb-2">Book Direct</p>
                <h1 className="font-serif text-2xl font-semibold text-foreground mb-4">
                  {step === 'details'
                    ? 'Guest Details'
                    : step === 'payment'
                    ? 'Payment'
                    : 'Booking Complete'}
                </h1>
                {step !== 'confirmation' && <StepIndicator current={step} />}
              </div>

              {/* Step content */}
              <AnimatePresence mode="wait">
                {/* ── STEP 1: Guest details ── */}
                {step === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    {quoteLoading ? (
                      <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading quote...
                      </div>
                    ) : !quote ? (
                      <div className="p-4 border border-amber-300/40 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-sm text-amber-800 dark:text-amber-300">
                        Quote not found or expired. Please go back and select dates again.
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit(onGuestSubmit)} className="space-y-5" noValidate>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm font-medium">Who's staying?</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              First Name
                            </Label>
                            <Input
                              {...register('firstName')}
                              placeholder="John"
                              className="mt-1 h-11"
                              autoComplete="given-name"
                            />
                            <FieldError msg={errors.firstName?.message} />
                          </div>
                          <div>
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Last Name
                            </Label>
                            <Input
                              {...register('lastName')}
                              placeholder="Smith"
                              className="mt-1 h-11"
                              autoComplete="family-name"
                            />
                            <FieldError msg={errors.lastName?.message} />
                          </div>
                        </div>

                        <div>
                          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Email Address
                          </Label>
                          <Input
                            type="email"
                            {...register('email')}
                            placeholder="john@example.com"
                            className="mt-1 h-11"
                            autoComplete="email"
                          />
                          <FieldError msg={errors.email?.message} />
                        </div>

                        <div>
                          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Phone Number
                          </Label>
                          <Input
                            type="tel"
                            {...register('phone')}
                            placeholder="+356 7900 0000"
                            className="mt-1 h-11"
                            autoComplete="tel"
                          />
                          <FieldError msg={errors.phone?.message} />
                        </div>

                        {checkoutError && (
                          <div className="flex items-start gap-2 p-3 border border-destructive/30 bg-destructive/5 rounded-md text-sm text-destructive">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            {checkoutError}
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={checkoutLoading}
                          className="w-full h-12 text-sm font-semibold"
                        >
                          {checkoutLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Preparing payment...
                            </>
                          ) : (
                            'Continue to Payment'
                          )}
                        </Button>

                        <p className="text-[10px] text-center text-muted-foreground">
                          By continuing, you agree to our{' '}
                          <Link to="/terms" className="text-primary hover:underline">
                            Terms
                          </Link>{' '}
                          and{' '}
                          <Link to="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                          .
                        </p>
                      </form>
                    )}
                  </motion.div>
                )}

                {/* ── STEP 2: Payment ── */}
                {step === 'payment' && clientSecret && quote && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Payment Details</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep('details')}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Edit details
                      </button>
                    </div>

                    {/* Guest details summary */}
                    {guestDetails && (
                      <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-0.5">
                        <p className="font-medium">
                          {guestDetails.firstName} {guestDetails.lastName}
                        </p>
                        <p className="text-muted-foreground">{guestDetails.email}</p>
                        <p className="text-muted-foreground">{guestDetails.phone}</p>
                      </div>
                    )}

                    {paymentError && (
                      <div className="flex items-start gap-2 p-3 border border-destructive/30 bg-destructive/5 rounded-md text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        {paymentError}
                      </div>
                    )}

                    <PaymentForm
                      clientSecret={clientSecret}
                      amount={quote.priceBreakdown.total}
                      currency={quote.currency || 'EUR'}
                      onSuccess={() => setStep('confirmation')}
                      onError={(msg) => setPaymentError(msg)}
                    />
                  </motion.div>
                )}

                {/* ── STEP 3: Confirmation ── */}
                {step === 'confirmation' && bookingId && (
                  <motion.div
                    key="confirmation"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    <BookingConfirmation
                      bookingId={bookingId}
                      listingTitle={property?.title}
                      listingId={listingId}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Booking summary sidebar */}
            {step !== 'confirmation' && (
              <BookingSummary
                title={property?.title}
                heroImage={property?.heroImage}
                city={property?.city}
                checkIn={checkIn}
                checkOut={checkOut}
                guestsCount={guestsCount}
                nights={nights}
                total={quote?.priceBreakdown.total}
                currency={quote?.currency}
                accommodation={quote?.priceBreakdown.accommodation}
                cleaningFee={quote?.priceBreakdown.cleaningFee}
                taxes={quote?.priceBreakdown.taxes}
              />
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

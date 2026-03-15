import { useState } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, CreditCard, Clock, Star, CheckCircle, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useListing, useQuote, useCreateBooking, normalizeListingDetail } from '@/lib/guesty/hooks';
import { sanitizeObject } from '@/lib/utils';

const bookingSchema = z.object({
  firstName: z.string().trim().min(1, 'Required').max(50),
  lastName: z.string().trim().min(1, 'Required').max(50),
  email: z.string().trim().email('Valid email required').max(255),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,20}$/, 'Valid phone required'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: 'Secure Booking', desc: 'Encrypted payments' },
  { icon: CreditCard, title: 'Best Price', desc: 'Direct owner rates' },
  { icon: Clock, title: 'Instant Confirm', desc: 'Within minutes' },
  { icon: Star, title: 'Verified', desc: 'Guest satisfaction' },
];

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-[10px] text-destructive mt-0.5">{msg}</p>;
}

export default function Book() {
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('listing') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guestsCount = Number(searchParams.get('guests') || '2');
  const quoteId = searchParams.get('quoteId') || '';

  const { data: rawListing } = useListing(listingId || undefined);
  const { data: quote } = useQuote(quoteId || undefined);
  const bookingMutation = useCreateBooking();

  const property = rawListing ? normalizeListingDetail(rawListing) : null;

  const [step, setStep] = useState<'details' | 'confirmed'>('details');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '' },
  });

  const onSubmit = async (data: BookingFormData) => {
    if (!quoteId) return;
    
    const sanitizedGuest = sanitizeObject({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
    });

    bookingMutation.mutate({
      quoteId,
      guest: sanitizedGuest,
    }, {
      onSuccess: () => setStep('confirmed'),
    });
  };

  // No listing — generic booking page
  if (!listingId) {
    return (
      <Layout>
        <section className="py-16">
          <div className="section-container text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <p className="micro-type text-primary mb-2">Book Direct</p>
              <h1 className="font-serif text-3xl font-semibold text-foreground mb-3">
                Find your perfect <span className="gold-text">stay</span>
              </h1>
              <p className="text-muted-foreground text-[13px] max-w-sm mx-auto mb-6">
                Browse our collection and book directly for the best rates.
              </p>
              <Button asChild>
                <Link to="/properties">Browse Properties</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="py-10 border-t border-border/20">
          <div className="section-container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {TRUST_ITEMS.map(({ icon: Icon, title, desc }, i) => (
                <motion.div 
                  key={title} 
                  initial={{ opacity: 0, y: 8 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.1 + i * 0.04 }} 
                  className="text-center"
                >
                  <div className="w-9 h-9 border border-border/40 flex items-center justify-center mx-auto mb-2">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <h3 className="text-[12px] font-semibold text-foreground mb-0.5">{title}</h3>
                  <p className="text-[10px] text-muted-foreground">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // Guard: if listing exists but no quote, redirect back to listing to get a fresh quote
  if (!quoteId && listingId) {
    return <Navigate to={`/properties/${listingId}`} replace />;
  }

  // Confirmed state
  if (step === 'confirmed') {
    const { firstName, email } = getValues();
    return (
      <Layout>
        <section className="py-16 text-center">
          <div className="section-container">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="w-14 h-14 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-primary" />
              </div>
              <h1 className="font-serif text-2xl font-semibold text-foreground mb-2">Booking Confirmed</h1>
              <p className="text-muted-foreground text-[13px] mb-1">
                Thank you, {firstName}! Your reservation is confirmed.
              </p>
              <p className="text-[11px] text-muted-foreground mb-6">
                Confirmation sent to <strong>{email}</strong>
              </p>
              <div className="flex gap-2 justify-center">
                <Button asChild variant="outline" size="sm">
                  <Link to="/properties">Browse More</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/">Home</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section-container py-2">
        <Link to={`/properties/${listingId}`} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={12} /> Back to property
        </Link>
      </div>

      <section className="py-6">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Guest details form */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <p className="micro-type text-primary mb-2">Complete Booking</p>
              <h1 className="font-serif text-2xl font-semibold text-foreground mb-6">Guest Details</h1>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">First Name</Label>
                    <Input {...register('firstName')} placeholder="John" className="mt-1" autoComplete="given-name" />
                    <FieldError msg={errors.firstName?.message} />
                  </div>
                  <div>
                    <Label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                    <Input {...register('lastName')} placeholder="Smith" className="mt-1" autoComplete="family-name" />
                    <FieldError msg={errors.lastName?.message} />
                  </div>
                </div>

                <div>
                  <Label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                  <Input type="email" {...register('email')} placeholder="john@example.com" className="mt-1" autoComplete="email" />
                  <FieldError msg={errors.email?.message} />
                </div>

                <div>
                  <Label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Phone</Label>
                  <Input type="tel" {...register('phone')} placeholder="+356 7900 0000" className="mt-1" autoComplete="tel" />
                  <FieldError msg={errors.phone?.message} />
                </div>

                {bookingMutation.error && (
                  <div className="flex items-start gap-1.5 p-2.5 border border-destructive/30 bg-destructive/5 text-[11px] text-destructive">
                    <AlertCircle size={12} className="shrink-0 mt-0.5" />
                    {bookingMutation.error instanceof Error ? bookingMutation.error.message : 'Booking failed. Please try again.'}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || bookingMutation.isPending}
                  className="w-full h-10 text-[12px] font-semibold"
                >
                  {(isSubmitting || bookingMutation.isPending) ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Processing...</>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>

                <p className="text-[9px] text-muted-foreground text-center">
                  By confirming, you agree to our <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
              </form>
            </motion.div>

            {/* Booking summary */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
              <div className="border border-border/50 bg-card p-4 sticky top-20">
                <h2 className="font-serif text-base font-semibold mb-4">Booking Summary</h2>

                {property && (
                  <div className="flex gap-3 mb-4">
                    {property.heroImage && property.heroImage !== '/placeholder.svg' && (
                      <img src={property.heroImage} alt={property.title} className="w-20 h-16 object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] font-medium truncate">{property.title}</h3>
                      <p className="text-[11px] text-muted-foreground">{property.city}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 text-[12px] pb-3 border-b border-border/30">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in</span>
                    <span className="font-medium numeric">{checkIn ? new Date(checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out</span>
                    <span className="font-medium numeric">{checkOut ? new Date(checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="font-medium numeric">{guestsCount}</span>
                  </div>
                </div>

                {quote && (
                  <div className="space-y-1.5 text-[12px] py-3 border-b border-border/30">
                    <div className="flex justify-between">
                      <span>Accommodation ({quote.nightsCount}n)</span>
                      <span className="numeric">€{quote.priceBreakdown.accommodation?.toLocaleString()}</span>
                    </div>
                    {quote.priceBreakdown.cleaningFee != null && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Cleaning</span>
                        <span className="numeric">€{quote.priceBreakdown.cleaningFee}</span>
                      </div>
                    )}
                    {quote.priceBreakdown.taxes != null && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Taxes</span>
                        <span className="numeric">€{quote.priceBreakdown.taxes}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-base pt-2">
                      <span>Total</span>
                      <span className="numeric">€{quote.priceBreakdown.total?.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 pt-3">
                  {TRUST_ITEMS.slice(0, 3).map(({ icon: Icon, title }) => (
                    <div key={title} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Icon size={11} className="text-primary shrink-0" />
                      {title}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

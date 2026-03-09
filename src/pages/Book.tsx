import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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

// Validation schema
const bookingSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  email: z.string().trim().email('Valid email is required').max(255),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,20}$/, 'Valid phone number required'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: 'Secure Booking', desc: 'All payments encrypted and protected' },
  { icon: CreditCard, title: 'Best Price', desc: 'No markups — direct owner rates' },
  { icon: Clock, title: 'Instant Confirmation', desc: 'Receive confirmation within minutes' },
  { icon: Star, title: 'Highly Rated', desc: 'Verified guest satisfaction' },
];

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-destructive mt-1">{msg}</p>;
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
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    if (!quoteId) return;
    
    bookingMutation.mutate({
      quoteId,
      guest: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      },
    }, {
      onSuccess: () => setStep('confirmed'),
    });
  };

  // No listing context — show generic booking page
  if (!listingId) {
    return (
      <Layout>
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="section-container relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="micro-type text-primary mb-3">Book Direct</p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                Find your perfect <span className="gold-text">stay</span>
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Browse our collection and book directly for the best rates.
              </p>
              <Button asChild size="lg">
                <Link to="/properties">Browse Properties</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="py-16 border-t border-border/30">
          <div className="section-container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {TRUST_ITEMS.map(({ icon: Icon, title, desc }, i) => (
                <motion.div key={title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="text-center">
                  <div className="w-12 h-12 rounded-full border border-border/50 flex items-center justify-center mx-auto mb-3">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (step === 'confirmed') {
    const { firstName, email } = getValues();
    return (
      <Layout>
        <section className="py-24 text-center">
          <div className="section-container">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-primary" />
              </div>
              <h1 className="font-serif text-3xl font-semibold text-foreground mb-3">Booking Confirmed</h1>
              <p className="text-muted-foreground mb-2">
                Thank you, {firstName}! Your reservation has been confirmed.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                A confirmation email has been sent to <strong>{email}</strong>.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link to="/properties">Browse More Properties</Link>
                </Button>
                <Button asChild>
                  <Link to="/">Back to Home</Link>
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
      <div className="section-container py-3">
        <Link to={`/properties/${listingId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back to property
        </Link>
      </div>

      <section className="py-8">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Left: Guest details form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="micro-type text-primary mb-3">Complete Your Booking</p>
              <h1 className="font-serif text-3xl font-semibold text-foreground mb-8">Guest Details</h1>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First Name</Label>
                    <Input {...register('firstName')} placeholder="John" className="mt-1.5" autoComplete="given-name" />
                    <FieldError msg={errors.firstName?.message} />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                    <Input {...register('lastName')} placeholder="Smith" className="mt-1.5" autoComplete="family-name" />
                    <FieldError msg={errors.lastName?.message} />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                  <Input type="email" {...register('email')} placeholder="john@example.com" className="mt-1.5" autoComplete="email" />
                  <FieldError msg={errors.email?.message} />
                </div>

                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                  <Input type="tel" {...register('phone')} placeholder="+356 7900 0000" className="mt-1.5" autoComplete="tel" />
                  <FieldError msg={errors.phone?.message} />
                </div>

                {bookingMutation.error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-sm text-destructive">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    {bookingMutation.error instanceof Error ? bookingMutation.error.message : 'Booking failed. Please try again.'}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || bookingMutation.isPending}
                  className="w-full h-12 text-sm font-semibold"
                  size="lg"
                >
                  {(isSubmitting || bookingMutation.isPending) ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>

                <p className="text-[11px] text-muted-foreground text-center">
                  By confirming, you agree to our <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
              </form>
            </motion.div>

            {/* Right: Booking summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="satin-surface rounded-2xl p-6 sticky top-24 space-y-5">
                <h2 className="font-serif text-lg font-semibold">Booking Summary</h2>

                {property && (
                  <div className="flex gap-4">
                    {property.heroImage && property.heroImage !== '/placeholder.svg' && (
                      <img src={property.heroImage} alt={property.title} className="w-24 h-20 object-cover rounded-lg" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{property.title}</h3>
                      <p className="text-xs text-muted-foreground">{property.city}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in</span>
                    <span className="font-medium">{checkIn ? new Date(checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out</span>
                    <span className="font-medium">{checkOut ? new Date(checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="font-medium">{guestsCount}</span>
                  </div>
                </div>

                {quote && (
                  <div className="space-y-2 text-sm pt-3 border-t border-border/30">
                    <div className="flex justify-between">
                      <span>Accommodation ({quote.nightsCount} {quote.nightsCount === 1 ? 'night' : 'nights'})</span>
                      <span>€{quote.priceBreakdown.accommodation?.toLocaleString()}</span>
                    </div>
                    {quote.priceBreakdown.cleaningFee != null && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Cleaning</span>
                        <span>€{quote.priceBreakdown.cleaningFee}</span>
                      </div>
                    )}
                    {quote.priceBreakdown.taxes != null && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Taxes &amp; charges</span>
                        <span>€{quote.priceBreakdown.taxes}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-border/30">
                      <span>Total</span>
                      <span>€{quote.priceBreakdown.total?.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-3 border-t border-border/30">
                  {TRUST_ITEMS.slice(0, 3).map(({ icon: Icon, title }) => (
                    <div key={title} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon size={14} className="text-primary shrink-0" />
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

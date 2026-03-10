/**
 * BookingConfirmation — Shown after payment succeeds.
 * Polls reservation-status until confirmed or inquiry_required.
 */
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Loader2, Calendar, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchBookingStatus } from '@/lib/checkout';

interface BookingConfirmationProps {
  bookingId: string;
  listingTitle?: string;
  listingId?: string;
}

type ConfirmStatus =
  | 'polling'
  | 'confirmed'
  | 'inquiry_required'
  | 'needs_manual_review'
  | 'error';

export default function BookingConfirmation({
  bookingId,
  listingTitle,
  listingId,
}: BookingConfirmationProps) {
  const [status, setStatus] = useState<ConfirmStatus>('polling');
  const [booking, setBooking] = useState<{
    confirmation_code: string | null;
    check_in: string;
    check_out: string;
    guests_count: number;
    total_amount: number;
    currency: string;
    guest_first_name: string;
    guest_last_name: string;
    guest_email: string;
  } | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const poll = useCallback(async () => {
    try {
      const result = await fetchBookingStatus(bookingId);
      const b = result.booking;

      setBooking(b as typeof booking);

      if (b.status === 'confirmed') {
        setStatus('confirmed');
      } else if (b.status === 'inquiry_required') {
        setStatus('inquiry_required');
      } else if (b.status === 'needs_manual_review') {
        setStatus('needs_manual_review');
      } else if (['payment_failed', 'booking_failed', 'cancelled'].includes(b.status)) {
        setStatus('error');
      }
      // Still in flight — keep polling
    } catch {
      // Tolerate transient errors
    }
  }, [bookingId]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    // Poll immediately, then every 3s for up to 90s
    const doPoll = async () => {
      await poll();
      setPollCount((c) => {
        const next = c + 1;
        if (next < 30 && ['polling'].includes(status)) {
          timer = setTimeout(doPoll, 3000);
        }
        return next;
      });
    };

    doPoll();
    return () => clearTimeout(timer);
  }, [poll]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  if (status === 'polling' || (status === 'polling' && pollCount < 3)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 space-y-4"
      >
        <div className="w-14 h-14 border border-border/40 flex items-center justify-center mx-auto">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground mb-1">
            Finalising your booking...
          </h2>
          <p className="text-sm text-muted-foreground">
            Payment received. We're confirming your reservation.
          </p>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          This usually takes less than 30 seconds
        </div>
      </motion.div>
    );
  }

  if (status === 'confirmed') {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-8"
      >
        {/* Success header */}
        <div className="text-center">
          <div className="w-16 h-16 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-foreground mb-1">
            Booking Confirmed!
          </h1>
          <p className="text-muted-foreground text-sm">
            You're all set. We've sent a confirmation to{' '}
            <strong>{booking?.guest_email}</strong>
          </p>
        </div>

        {/* Confirmation code */}
        {booking?.confirmation_code && (
          <div className="border border-primary/20 bg-primary/5 rounded-lg p-5 text-center">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">
              Booking Reference
            </p>
            <p className="font-mono text-2xl font-bold text-foreground tracking-widest">
              {booking.confirmation_code}
            </p>
          </div>
        )}

        {/* Booking details */}
        {booking && (
          <div className="border border-border/50 rounded-lg divide-y divide-border/30">
            <div className="p-4">
              <h3 className="text-sm font-semibold mb-3">Stay Details</h3>
              <div className="space-y-2">
                {listingTitle && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span>{listingTitle}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>
                    {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{(booking as any).guests_count ?? 1} guests</span>
                </div>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total paid</span>
              <span className="font-semibold">
                {booking.currency} {booking.total_amount.toLocaleString('en-EU', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your host will send check-in instructions to{' '}
                <strong>{booking.guest_email}</strong> closer to your arrival date.
                If you have any questions, please contact us directly.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link to="/properties">Browse More</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  if (status === 'inquiry_required') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 py-8"
      >
        <div className="w-14 h-14 border border-amber-400/30 bg-amber-50 dark:bg-amber-950 flex items-center justify-center mx-auto">
          <Clock className="w-7 h-7 text-amber-500" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
            Awaiting Host Approval
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Your payment was received and your inquiry has been sent to the host.
            You'll receive a confirmation email once approved — usually within 24 hours.
          </p>
        </div>
        {booking?.guest_email && (
          <p className="text-xs text-muted-foreground">
            Updates will be sent to <strong>{booking.guest_email}</strong>
          </p>
        )}
        <Button asChild variant="outline">
          <Link to="/properties">Browse Other Properties</Link>
        </Button>
      </motion.div>
    );
  }

  if (status === 'needs_manual_review') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 py-8"
      >
        <div className="w-14 h-14 border border-blue-400/30 bg-blue-50 dark:bg-blue-950 flex items-center justify-center mx-auto">
          <Clock className="w-7 h-7 text-blue-500" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
            Under Review
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Your payment was received. Our team is manually reviewing your booking.
            We'll contact you at <strong>{booking?.guest_email}</strong> within a few hours.
          </p>
        </div>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </motion.div>
    );
  }

  // Error state
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6 py-8"
    >
      <div className="w-14 h-14 border border-destructive/30 bg-destructive/5 flex items-center justify-center mx-auto">
        <AlertCircle className="w-7 h-7 text-destructive" />
      </div>
      <div>
        <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
          Something Went Wrong
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          We encountered an issue processing your booking. Please contact our support team
          quoting booking ID: <code className="text-xs bg-muted px-1 py-0.5 rounded">{bookingId}</code>
        </p>
      </div>
      <div className="flex gap-3 justify-center">
        <Button asChild variant="outline">
          <Link to="/contact">Contact Support</Link>
        </Button>
        <Button asChild>
          <Link to="/properties">Browse Properties</Link>
        </Button>
      </div>
    </motion.div>
  );
}

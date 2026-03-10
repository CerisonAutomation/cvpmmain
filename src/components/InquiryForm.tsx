/**
 * InquiryForm — Fallback for non-instant-bookable listings.
 * Submits an inquiry directly via the Guesty inquiry endpoint.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Quote } from '@/lib/guesty/types';

const inquirySchema = z.object({
  firstName: z.string().trim().min(1, 'Required').max(50),
  lastName: z.string().trim().min(1, 'Required').max(50),
  email: z.string().trim().email('Valid email required'),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,20}$/, 'Valid phone required'),
  message: z.string().trim().min(10, 'Please write at least 10 characters').max(1000),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

interface InquiryFormProps {
  quote: Quote;
  listingId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  onSuccess?: () => void;
  prefillEmail?: string;
  prefillFirstName?: string;
  prefillLastName?: string;
  prefillPhone?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-[10px] text-destructive mt-0.5">{msg}</p>;
}

export default function InquiryForm({
  quote,
  listingId,
  checkIn,
  checkOut,
  guestsCount,
  onSuccess,
  prefillEmail,
  prefillFirstName,
  prefillLastName,
  prefillPhone,
}: InquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      firstName: prefillFirstName ?? '',
      lastName: prefillLastName ?? '',
      email: prefillEmail ?? '',
      phone: prefillPhone ?? '',
      message: '',
    },
  });

  const onSubmit = async (data: InquiryFormData) => {
    setSubmitError(null);

    // Call guesty-proxy inquiry endpoint
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/guesty-proxy?action=inquiry&quoteId=${encodeURIComponent(quote._id)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guest: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
          },
          message: data.message,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setSubmitError(
        (err as any).error ||
          'Failed to send inquiry. Please try contacting us directly.'
      );
      return;
    }

    setSubmitted(true);
    onSuccess?.();
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-10 space-y-4"
      >
        <div className="w-14 h-14 border border-primary/30 flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
            Inquiry Sent
          </h3>
          <p className="text-sm text-muted-foreground">
            The host will review your inquiry and respond within 24 hours. Check your email for updates.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 border border-amber-300/40 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
        <MessageSquare className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Inquiry Required
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            This property requires host approval. Send an inquiry below — no payment is taken until confirmed.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              First Name
            </Label>
            <Input
              {...register('firstName')}
              placeholder="John"
              className="mt-1 h-10"
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
              className="mt-1 h-10"
              autoComplete="family-name"
            />
            <FieldError msg={errors.lastName?.message} />
          </div>
        </div>

        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Email
          </Label>
          <Input
            type="email"
            {...register('email')}
            placeholder="john@example.com"
            className="mt-1 h-10"
            autoComplete="email"
          />
          <FieldError msg={errors.email?.message} />
        </div>

        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Phone
          </Label>
          <Input
            type="tel"
            {...register('phone')}
            placeholder="+356 7900 0000"
            className="mt-1 h-10"
            autoComplete="tel"
          />
          <FieldError msg={errors.phone?.message} />
        </div>

        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Message
          </Label>
          <Textarea
            {...register('message')}
            placeholder="Hi! I'm interested in this property for our stay. Could you let me know about..."
            className="mt-1 resize-none"
            rows={4}
          />
          <FieldError msg={errors.message?.message} />
        </div>

        {submitError && (
          <div className="flex items-start gap-2 p-3 border border-destructive/30 bg-destructive/5 rounded-md text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {submitError}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 text-sm font-semibold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending inquiry...
            </>
          ) : (
            'Send Inquiry'
          )}
        </Button>

        <p className="text-[10px] text-center text-muted-foreground">
          No payment required until the host accepts your inquiry.
        </p>
      </form>
    </div>
  );
}

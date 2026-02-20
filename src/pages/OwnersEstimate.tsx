import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import Layout from '@/components/Layout';
import { MALTA_LOCALITIES, PROPERTY_TYPES, BEDROOM_OPTIONS } from '@/lib/malta-localities';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Valid email required').max(255),
  phone: z.string().regex(/^\+356\s?\d{4}\s?\d{4}$/, 'Valid Malta phone (+356 XXXX XXXX)'),
  locality: z.string().min(1, 'Select a locality'),
  propertyType: z.string().min(1, 'Select property type'),
  bedrooms: z.string().min(1, 'Select bedrooms'),
  message: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

export default function OwnersEstimate() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data: FormData) => {
    const webhookUrl = import.meta.env.VITE_LEAD_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        setSubmitted(true);
      } catch {
        // Fallback to mailto
        openMailto(data);
      }
    } else {
      openMailto(data);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <section className="py-20 text-center">
          <div className="section-container">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-4">Thank you</h1>
            <p className="text-muted-foreground">We'll be in touch within 24 hours to discuss your property.</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16">
        <div className="section-container max-w-xl">
          <p className="micro-type text-primary mb-3">Free Estimate</p>
          <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
            Assess your property's <span className="gold-text">potential</span>
          </h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            Tell us about your property and we'll provide a detailed rental income estimate.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormField label="Full name" error={errors.name?.message}>
              <input {...register('name')} autoComplete="name" placeholder="Your full name" className="form-input" />
            </FormField>

            <FormField label="Email" error={errors.email?.message}>
              <input {...register('email')} type="email" autoComplete="email" placeholder="you@email.com" className="form-input" />
            </FormField>

            <FormField label="Phone" error={errors.phone?.message}>
              <input {...register('phone')} type="tel" autoComplete="tel" placeholder="+356 7900 0000" className="form-input" />
            </FormField>

            <FormField label="Locality" error={errors.locality?.message}>
              <select {...register('locality')} className="form-input">
                <option value="">Select locality...</option>
                {MALTA_LOCALITIES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Property type" error={errors.propertyType?.message}>
                <select {...register('propertyType')} className="form-input">
                  <option value="">Select...</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Bedrooms" error={errors.bedrooms?.message}>
                <select {...register('bedrooms')} className="form-input">
                  <option value="">Select...</option>
                  {BEDROOM_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField label="Message (optional)" error={errors.message?.message}>
              <textarea {...register('message')} rows={3} placeholder="Tell us about your goals..." className="form-input resize-y" />
            </FormField>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-sm font-semibold bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Get My Free Estimate'}
            </button>

            <p className="text-[0.65rem] text-muted-foreground text-center leading-relaxed">
              By submitting, you agree to our{' '}
              <a href="/privacy" className="text-primary underline">Privacy Policy</a>.
            </p>
          </form>
        </div>
      </section>
    </Layout>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function openMailto(data: FormData) {
  const body = `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nLocality: ${data.locality}\nType: ${data.propertyType}\nBedrooms: ${data.bedrooms}\nMessage: ${data.message || 'N/A'}`;
  window.location.href = `mailto:info@christianopm.com?subject=${encodeURIComponent('Property Estimate Request')}&body=${encodeURIComponent(body)}`;
}

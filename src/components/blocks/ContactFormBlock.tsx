import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { sanitizeObject } from '@/lib/utils';
import type { ContactFormData } from '@/lib/cms/types';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Valid email required').max(255),
  phone: z.string().regex(/^\+356\s?\d{4}\s?\d{4}$/, 'Valid Malta phone (+356 XXXX XXXX)').optional().or(z.literal('')),
  enquiryType: z.enum(['guest', 'owner', 'general']),
  message: z.string().trim().min(1, 'Message is required').max(1000),
});

type FormData = z.infer<typeof schema>;

const CONTACT_INFO = [
  { icon: Mail, label: 'Email', value: 'info@christianopm.com', href: 'mailto:info@christianopm.com' },
  { icon: Phone, label: 'Phone', value: '+356 7927 4688', href: 'tel:+35679274688' },
  { icon: MapPin, label: 'Location', value: 'Malta & Gozo' },
  { icon: Clock, label: 'Response Time', value: 'Within 24 hours' },
];

export default function ContactFormBlock({ data }: { data: ContactFormData }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { enquiryType: 'general' },
  });
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data: FormData) => {
    const sanitized = sanitizeObject(data);
    const body = `Type: ${sanitized.enquiryType}\nName: ${sanitized.name}\nEmail: ${sanitized.email}\nPhone: ${sanitized.phone || 'N/A'}\n\n${sanitized.message}`;
    window.location.href = `mailto:info@christianopm.com?subject=${encodeURIComponent(`${data.enquiryType.charAt(0).toUpperCase() + data.enquiryType.slice(1)} Enquiry — ${data.name}`)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="py-20 text-center">
        <div className="section-container">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-4">Message sent</h1>
            <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 satin-glow">
      <div className="section-container">
        <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              Let's <span className="gold-text">talk</span>
            </h2>
            <p className="text-muted-foreground mb-10 leading-relaxed">
              {data.body || "Whether you're an owner looking to maximise your property's potential or a guest with a question, we're here to help."}
            </p>

            <div className="space-y-5">
              {CONTACT_INFO.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-foreground hover:text-primary transition-colors">{item.value}</a>
                    ) : (
                      <span className="text-sm text-muted-foreground">{item.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit(onSubmit)}
            className="satin-surface rounded-2xl p-8 space-y-5"
          >
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">I am a</label>
              <div className="grid grid-cols-3 gap-2">
                {(['guest', 'owner', 'general'] as const).map(type => (
                  <label key={type} className="relative">
                    <input type="radio" value={type} {...register('enquiryType')} className="peer sr-only" />
                    <div className="cursor-pointer text-center py-2.5 px-3 text-xs font-semibold rounded-lg border border-border transition-colors peer-checked:border-primary peer-checked:text-primary peer-checked:bg-primary/5 text-muted-foreground hover:text-foreground">
                      {type === 'guest' ? 'Guest' : type === 'owner' ? 'Property Owner' : 'General'}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Field label="Name" error={errors.name?.message}>
              <input {...register('name')} autoComplete="name" placeholder="Your name" className="form-input" />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input {...register('email')} type="email" autoComplete="email" placeholder="you@email.com" className="form-input" />
            </Field>
            <Field label="Phone (optional)" error={errors.phone?.message}>
              <input {...register('phone')} type="tel" autoComplete="tel" placeholder="+356 7900 0000" className="form-input" />
            </Field>
            <Field label="Message" error={errors.message?.message}>
              <textarea {...register('message')} rows={4} placeholder="How can we help?" className="form-input resize-y" />
            </Field>
            <button type="submit" disabled={isSubmitting} className="w-full py-3.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Valid email required').max(255),
  phone: z.string().regex(/^\+356\s?\d{4}\s?\d{4}$/, 'Valid Malta phone (+356 XXXX XXXX)').optional().or(z.literal('')),
  enquiryType: z.enum(['guest', 'owner', 'general']),
  message: z.string().trim().min(1, 'Message is required').max(1000),
});

type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { enquiryType: 'general' },
  });
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data: FormData) => {
    const body = `Type: ${data.enquiryType}\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'N/A'}\n\n${data.message}`;
    window.location.href = `mailto:info@christianopm.com?subject=${encodeURIComponent(`${data.enquiryType.charAt(0).toUpperCase() + data.enquiryType.slice(1)} Enquiry — ${data.name}`)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-20">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
            {/* Info side */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="micro-type text-primary mb-4">Get in Touch</p>
              <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
                Let's <span className="gold-text">talk</span>
              </h1>
              <p className="text-muted-foreground mb-10 leading-relaxed">
                Whether you're an owner looking to maximise your property's potential or a guest with a question, we're here to help.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Email</p>
                    <a href="mailto:info@christianopm.com" className="text-sm text-foreground hover:text-primary transition-colors">info@christianopm.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Phone</p>
                    <a href="tel:+35679274688" className="text-sm text-foreground hover:text-primary transition-colors">+356 7927 4688</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Location</p>
                    <span className="text-sm text-muted-foreground">Malta &amp; Gozo</span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Response Time</p>
                    <span className="text-sm text-muted-foreground">Within 24 hours</span>
                  </div>
                </div>
              </div>

              {/* Map embed */}
              <div className="mt-10 rounded-xl overflow-hidden border border-border/50">
                <iframe
                  title="Office location"
                  src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Malta&zoom=10"
                  width="100%" height="200" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </motion.div>

            {/* Form side */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
    </Layout>
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

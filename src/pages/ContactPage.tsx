import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { SkipLink } from '@/components/ui/accessibility';
import { FadeInView } from '@/components/PageTransition';
import LeadModal from '@/components/LeadModal';

const contactInfo = [
  { icon: Phone, label: 'Phone', value: '+356 7979 0202', href: 'tel:+35679790202' },
  { icon: Mail, label: 'Email', value: 'info@christianovincenti.com', href: 'mailto:info@christianovincenti.com' },
  { icon: MapPin, label: 'Location', value: 'Malta & Gozo', href: null },
  { icon: Clock, label: 'Hours', value: 'Mon–Sun, 8am–10pm', href: null },
];

export default function ContactPage() {
  const [leadOpen, setLeadOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', type: 'owner' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // In production, POST to your webhook/supabase edge function
    await new Promise(r => setTimeout(r, 900));
    setSent(true);
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      <SEOHead
        title="Contact — Christiano Vincenti Property Management Malta"
        description="Get in touch with Malta's leading property management team. Call, email, or send an enquiry."
        keywords={['contact Malta property management', 'Christiano Vincenti contact', 'Malta rental management enquiry']}
      />
      <Navbar onOpenWizard={() => setLeadOpen(true)} />

      <main id="main-content">
        <section className="pt-28 pb-16 border-b border-border/20">
          <div className="section-container">
            <FadeInView>
              <p className="micro-type text-primary mb-4">Contact</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl leading-[1.1] mb-4">Let&apos;s Talk</h1>
              <p className="text-muted-foreground text-lg max-w-xl">Whether you own a property or planning a stay, we&apos;re here 7 days a week.</p>
            </FadeInView>
          </div>
        </section>

        <section className="py-16">
          <div className="section-container">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Contact info + quick CTA */}
              <FadeInView>
                <div className="space-y-8">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {contactInfo.map(c => (
                      <div key={c.label} className="p-5 border border-border/30 rounded-xl">
                        <c.icon className="w-5 h-5 text-primary mb-3" />
                        <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
                        {c.href ? (
                          <a href={c.href} className="font-medium hover:text-primary transition-colors text-sm">{c.value}</a>
                        ) : (
                          <p className="font-medium text-sm">{c.value}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl">
                    <MessageCircle className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Quick Enquiry — 2 Steps</h3>
                    <p className="text-sm text-muted-foreground mb-4">Tell us in two taps what you need. We reply within 2 hours.</p>
                    <button onClick={() => setLeadOpen(true)} className="btn-primary w-full">Open Quick Enquiry</button>
                  </div>
                </div>
              </FadeInView>

              {/* Full contact form */}
              <FadeInView delay={0.15}>
                <div className="bg-card border border-border/30 rounded-2xl p-8">
                  <h2 className="font-semibold text-xl mb-6">Send a Message</h2>
                  {sent ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Message received!</h3>
                      <p className="text-sm text-muted-foreground">We&apos;ll reply to {form.email} within 2 hours.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">I am a…</label>
                          <div className="flex gap-2">
                            {['owner', 'guest'].map(t => (
                              <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                                className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                                  form.type === t ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-primary/30'
                                }`}>
                                {t === 'owner' ? 'Property Owner' : 'Guest'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Full Name *</label>
                          <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name"
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Email *</label>
                        <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                        <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+356..."
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Message *</label>
                        <textarea required rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Tell us about your property or enquiry…"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                      </div>
                      <button type="submit" disabled={sending} className="btn-primary w-full">
                        {sending ? 'Sending…' : 'Send Message'}
                      </button>
                    </form>
                  )}
                </div>
              </FadeInView>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} context="general" />
    </div>
  );
}

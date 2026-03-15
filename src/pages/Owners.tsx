import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { SkipLink } from '@/components/ui/accessibility';
import { FadeInView } from '@/components/PageTransition';
import WizardModal from '@/components/WizardModal';
import {
  BarChart3, Shield, Clock, TrendingUp, Star, Users,
  ChevronRight, Smartphone, FileText, Wrench, Camera,
  Globe, HeadphonesIcon, ArrowRight
} from 'lucide-react';

const metrics = [
  { value: '€42k', label: 'Avg Annual Revenue', sub: 'per 2-bed property in Valletta' },
  { value: '94%', label: 'Average Occupancy', sub: 'across our full portfolio' },
  { value: '4.97', label: 'Guest Rating', sub: 'across all platforms' },
  { value: '48h', label: 'Max Response Time', sub: 'for maintenance issues' },
];

const services = [
  { icon: Camera, title: 'Professional Photography', desc: 'HDR photography and virtual staging to maximise listing click-through rates.' },
  { icon: Globe, title: 'Multi-Platform Listing', desc: 'Listed and optimised on Airbnb, Booking.com, VRBO, and our direct booking engine.' },
  { icon: TrendingUp, title: 'Dynamic Pricing', desc: 'AI-powered pricing that adjusts to seasonal demand, local events, and competitor rates in real time.' },
  { icon: HeadphonesIcon, title: '24/7 Guest Support', desc: 'Multilingual concierge handles all guest queries, from arrival to departure.' },
  { icon: Wrench, title: 'Maintenance Network', desc: 'Vetted local contractors for cleaning, repairs, and refurbishments at competitive rates.' },
  { icon: FileText, title: 'Monthly Reporting', desc: 'Detailed income statements, occupancy stats, and review summaries delivered every month.' },
  { icon: Smartphone, title: 'Owner Portal', desc: 'Real-time dashboard to view bookings, block dates, track earnings, and communicate with your manager.' },
  { icon: Shield, title: 'Compliance & Tax', desc: 'We ensure your property meets all Malta short-stay licensing requirements and assist with tax documentation.' },
];

const process = [
  { step: '01', title: 'Free Estimate', desc: 'Tell us about your property and get a personalised income projection within 24 hours — no obligation.' },
  { step: '02', title: 'Onboarding', desc: 'We handle everything: photography, listing creation, key handover logistics, and welcome pack setup.' },
  { step: '03', title: 'Go Live', desc: 'Your property goes live across all platforms within 5–7 days. Bookings start arriving immediately.' },
  { step: '04', title: 'Ongoing Management', desc: 'Sit back. We manage guests, cleaning, maintenance, and payments. You receive monthly reports and payouts.' },
];

const testimonials = [
  { name: 'Marco A.', location: 'Valletta', text: 'I was sceptical at first, but within the first month my apartment was earning more than I ever managed alone. The team is incredible.', rating: 5 },
  { name: 'Sandra M.', location: 'St Julian\'s', text: 'The owner portal is a game changer. I can see every booking, every payment in real time. Total transparency.', rating: 5 },
  { name: 'Joseph F.', location: 'Sliema', text: 'They handle absolutely everything. I haven\'t had to deal with a single guest issue in two years.', rating: 5 },
];

export default function Owners() {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      <SEOHead
        title="Property Owners — Earn More from Your Malta Property"
        description="Professional short-stay property management in Malta. Earn up to €60k+ per year from your apartment or villa. Commission-only, full service."
        keywords={['Malta property management owners', 'rent out apartment Malta', 'short stay management Malta', 'Airbnb management Malta']}
      />
      <Navbar onOpenWizard={() => setWizardOpen(true)} />

      <main id="main-content">
        {/* Hero */}
        <section className="pt-28 pb-20 border-b border-border/20">
          <div className="section-container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <FadeInView>
                <p className="micro-type text-primary mb-4">For Property Owners</p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                  Your Property.<br />Maximum Returns.
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  We manage your Malta property like it\'s our own — filling it with quality guests, maintaining it to a 5-star standard, and depositing your earnings every month.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => setWizardOpen(true)} className="btn-primary">
                    Get Free Estimate
                  </button>
                  <Link to="/owners/pricing" className="btn-secondary">
                    View Pricing
                  </Link>
                </div>
              </FadeInView>
              <FadeInView delay={0.2}>
                <div className="grid grid-cols-2 gap-4">
                  {metrics.map((m, i) => (
                    <div key={m.label} className="p-6 border border-border/30 rounded-xl bg-card/50">
                      <div className="text-3xl font-bold text-primary mb-1">{m.value}</div>
                      <div className="text-sm font-medium mb-1">{m.label}</div>
                      <div className="text-xs text-muted-foreground">{m.sub}</div>
                    </div>
                  ))}
                </div>
              </FadeInView>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 border-b border-border/20">
          <div className="section-container">
            <FadeInView>
              <p className="micro-type text-primary mb-4">What We Do</p>
              <h2 className="section-heading mb-12">Full-Service Management</h2>
            </FadeInView>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((s, i) => (
                <FadeInView key={s.title} delay={i * 0.07}>
                  <div className="p-6 border border-border/20 rounded-xl hover:border-primary/30 hover:bg-primary/[0.02] transition-all">
                    <s.icon className="w-7 h-7 text-primary mb-4" />
                    <h3 className="font-semibold text-[15px] mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-20 border-b border-border/20">
          <div className="section-container">
            <FadeInView>
              <p className="micro-type text-primary mb-4">How It Works</p>
              <h2 className="section-heading mb-12">From Sign-Up to Earnings in 7 Days</h2>
            </FadeInView>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {process.map((p, i) => (
                <FadeInView key={p.step} delay={i * 0.1}>
                  <div className="relative">
                    <div className="text-5xl font-black text-primary/10 mb-4">{p.step}</div>
                    <h3 className="font-semibold mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 border-b border-border/20 bg-muted/10">
          <div className="section-container">
            <FadeInView>
              <p className="micro-type text-primary mb-4">Owner Stories</p>
              <h2 className="section-heading mb-12">What Our Owners Say</h2>
            </FadeInView>
            <div className="grid sm:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <FadeInView key={t.name} delay={i * 0.1}>
                  <div className="p-6 bg-card border border-border/30 rounded-xl">
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(t.rating)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.location}</div>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        {/* Sub-page links */}
        <section className="py-16 border-b border-border/20">
          <div className="section-container">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { href: '/owners/estimate', label: 'Get Free Income Estimate', icon: BarChart3 },
                { href: '/owners/pricing', label: 'View Management Plans', icon: TrendingUp },
                { href: '/owners/standards', label: 'Our Property Standards', icon: Shield },
              ].map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center justify-between p-5 border border-border/30 rounded-xl hover:border-primary/30 hover:bg-primary/[0.02] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="w-5 h-5 text-primary" />
                    <span className="font-medium text-sm">{link.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="section-container text-center">
            <FadeInView>
              <h2 className="text-3xl font-bold mb-4">Ready to Maximise Your Property&apos;s Potential?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">Join 40+ property owners already earning more with Christiano Vincenti Property Management.</p>
              <button onClick={() => setWizardOpen(true)} className="btn-primary text-base px-8 py-4">
                Get Your Free Estimate
              </button>
            </FadeInView>
          </div>
        </section>
      </main>

      <Footer />
      <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
}

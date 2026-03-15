import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { SkipLink } from '@/components/ui/accessibility';
import { FadeInView } from '@/components/PageTransition';
import { useState } from 'react';
import LeadModal from '@/components/LeadModal';
import { Award, Users, Star, MapPin, Shield, Heart, TrendingUp, CheckCircle } from 'lucide-react';

const stats = [
  { label: 'Properties Managed', value: '40+', icon: MapPin },
  { label: 'Guest Reviews', value: '2,000+', icon: Star },
  { label: 'Average Rating', value: '4.97', icon: Award },
  { label: 'Years in Malta', value: '8+', icon: TrendingUp },
];

const values = [
  { icon: Shield, title: 'Trust & Transparency', description: 'Every owner receives full monthly statements, real-time booking visibility, and honest advice — always.' },
  { icon: Heart, title: 'Guest Obsession', description: 'We treat every guest as if they are visiting for the first time. 5-star hospitality is our only standard.' },
  { icon: Users, title: 'Owner Partnership', description: 'Your property is your asset. We manage it as stewards, maximising returns while protecting your investment.' },
  { icon: CheckCircle, title: 'Local Excellence', description: 'Deep roots in Malta mean the best suppliers, fastest response times, and a network no outsider can match.' },
];

const team = [
  { name: 'Christiano Vincenti', role: 'Founder & Director', bio: "Born and raised in Malta, Christiano has spent over a decade shaping the island's short-stay market. His vision: world-class hospitality, managed locally." },
  { name: 'Operations Team', role: 'Property Specialists', bio: 'Our on-the-ground team handles everything from linen changes to maintenance emergencies — available 7 days a week.' },
  { name: 'Guest Experience', role: 'Concierge & Support', bio: 'Multilingual support available 24/7 to ensure every guest feels looked after from arrival to departure.' },
];

export default function AboutPage() {
  const [leadOpen, setLeadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      <SEOHead
        title="About Us — Christiano Vincenti Property Management Malta"
        description="Meet the team behind Malta's most trusted short-stay property management company. 8+ years, 40+ properties, 4.97 star average."
        keywords={['Malta property management', 'Christiano Vincenti', 'Malta holiday rentals management']}
      />
      <Navbar onOpenWizard={() => setLeadOpen(true)} />

      <main id="main-content">
        {/* Hero */}
        <section className="pt-28 pb-20 border-b border-border/20">
          <div className="section-container">
            <FadeInView>
              <p className="micro-type text-primary mb-4">About Us</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl leading-[1.1] mb-6">
                Malta&apos;s Most Trusted Property Managers
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed mb-8">
                Christiano Vincenti Property Management was founded on a simple belief: property owners in Malta deserve a management partner who treats their investment with the same care and ambition they do.
              </p>
              <button onClick={() => setLeadOpen(true)} className="btn-primary" aria-label="Get a free property estimate">
                Get a Free Estimate
              </button>
            </FadeInView>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 border-b border-border/20">
          <div className="section-container">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <FadeInView key={stat.label} delay={i * 0.1}>
                  <div className="text-center">
                    <stat.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 border-b border-border/20">
          <div className="section-container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <FadeInView>
                <p className="micro-type text-primary mb-4">Our Story</p>
                <h2 className="section-heading mb-6">Built in Malta, for Malta</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>We started with a single apartment in Valletta and a conviction that short-stay guests in Malta deserved better — better-maintained properties, better communication, better experiences.</p>
                  <p>Over eight years we have grown that conviction into a portfolio of 40+ handpicked properties, a team of dedicated local specialists, and a reputation built entirely on word of mouth and 5-star reviews.</p>
                  <p>Every property we take on is chosen carefully. We don&apos;t chase volume — we chase excellence. That philosophy has made us the partner of choice for discerning property owners who want results they can trust.</p>
                </div>
              </FadeInView>
              <FadeInView delay={0.2}>
                <div className="grid grid-cols-2 gap-4">
                  {[0,1,2,3].map(i => (
                    <div key={i} className={`aspect-square bg-muted/40 rounded-lg overflow-hidden ${i === 0 ? 'col-span-2 aspect-video' : ''}`}>
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-primary/30" />
                      </div>
                    </div>
                  ))}
                </div>
              </FadeInView>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 border-b border-border/20">
          <div className="section-container">
            <FadeInView>
              <p className="micro-type text-primary mb-4">What We Stand For</p>
              <h2 className="section-heading mb-12">Our Values</h2>
            </FadeInView>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((v, i) => (
                <FadeInView key={v.title} delay={i * 0.1}>
                  <div className="p-6 border border-border/30 rounded-xl hover:border-primary/30 transition-colors">
                    <v.icon className="w-8 h-8 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 border-b border-border/20">
          <div className="section-container">
            <FadeInView>
              <p className="micro-type text-primary mb-4">The Team</p>
              <h2 className="section-heading mb-12">People Behind the Properties</h2>
            </FadeInView>
            <div className="grid sm:grid-cols-3 gap-8">
              {team.map((member, i) => (
                <FadeInView key={member.name} delay={i * 0.1}>
                  <div className="group">
                    <div className="aspect-square bg-muted/30 rounded-xl mb-5 overflow-hidden flex items-center justify-center">
                      <Users className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-primary text-sm mb-2">{member.role}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary/5">
          <div className="section-container text-center">
            <FadeInView>
              <h2 className="section-heading mb-4">Ready to Partner With Us?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">Get a free income estimate for your Malta property and see what we can achieve together.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={() => setLeadOpen(true)} className="btn-primary" aria-label="Get free property estimate">Get Free Estimate</button>
                <a href="tel:+35679790202" className="btn-secondary">Call +356 7979 0202</a>
              </div>
            </FadeInView>
          </div>
        </section>
      </main>

      <Footer />
      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} context="owner" />
    </div>
  );
}

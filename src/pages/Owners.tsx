import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardCheck, Camera, Rocket, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import { usePage } from '@/lib/content';

const STEPS = [
  { icon: ClipboardCheck, step: '01', title: 'Free Assessment', desc: 'We analyse your property and recommend the right plan for your goals.' },
  { icon: Camera, step: '02', title: 'We Set You Up', desc: 'Professional photography, listing setup, pricing strategy, and MTA licensing support.' },
  { icon: Rocket, step: '03', title: 'You Earn More', desc: 'We manage bookings, guests, cleaning, and maintenance. You receive monthly payouts.' },
];

export default function Owners() {
  const { data } = usePage('owners');

  return (
    <Layout>
      <section className="py-16 satin-glow">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-2xl mb-12"
          >
            <p className="micro-type text-primary mb-3">For Property Owners</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground leading-tight mb-4">
              Turn your property into a <span className="gold-text">performing asset</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Full-service short-let management across Malta and Gozo.
              We handle everything — you receive monthly payouts and transparent reports.
            </p>
          </motion.div>

          {data?.sections?.map((s, i) => (
            <div key={s.id || i} className="mt-12">
              {s.heading && <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">{s.heading}</h2>}
              {s.body && <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>}
            </div>
          ))}

          <div className="grid md:grid-cols-3 gap-5 mt-12">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.25 }}
                className="satin-surface rounded-lg p-5 relative group hover:border-primary/30 transition-colors satin-glow"
              >
                <span className="absolute top-4 right-4 font-serif text-4xl font-bold text-border/50 group-hover:text-primary/20 transition-colors">
                  {s.step}
                </span>
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                  <s.icon size={18} className="text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-14 satin-surface rounded-lg p-8 text-center satin-glow">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">
              Ready to get started?
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Get a free, no-obligation assessment of your property's rental potential.
            </p>
            <Link
              to="/owners/estimate"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Get Your Free Estimate <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

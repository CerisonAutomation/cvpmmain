import { motion } from 'framer-motion';
import { Gift, MessageCircle, Camera, TrendingUp, BedDouble, SprayCan, ShieldCheck, Wrench, FileBarChart, LayoutDashboard, CalendarCheck, BarChart3 } from 'lucide-react';
import Layout from '@/components/Layout';
import { usePage } from '@/lib/content';

const STANDARD_ICONS: Record<string, React.ReactNode> = {
  '5-Star Welcome Pack': <Gift size={20} />,
  'Sub-1-Hour Response': <MessageCircle size={20} />,
  'Professional Photography': <Camera size={20} />,
  'Smart Pricing': <TrendingUp size={20} />,
  'Hotel-Grade Linens': <BedDouble size={20} />,
  'Deep Clean Protocol': <SprayCan size={20} />,
  'Safety Compliance': <ShieldCheck size={20} />,
  'Maintenance at Cost': <Wrench size={20} />,
  'Monthly Owner Statements': <FileBarChart size={20} />,
  'Real-Time Dashboard': <LayoutDashboard size={20} />,
  'Quarterly Strategy Review': <CalendarCheck size={20} />,
  'Annual Performance Report': <BarChart3 size={20} />,
};

export default function OwnersStandards() {
  const { data } = usePage('owners_standards');

  return (
    <Layout>
      <section className="py-20 satin-glow">
        <div className="section-container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="micro-type text-primary mb-4">Standards</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              {data?.title || 'Our Standards'}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {data?.description || ''}
            </p>
          </motion.div>
        </div>
      </section>

      {data?.sections?.map((section, i) => (
        <section key={section.id || i} className="py-16 border-t border-border/30">
          <div className="section-container">
            <p className="micro-type text-primary mb-3">{section.heading}</p>
            {section.items && (
              <div className="grid sm:grid-cols-2 gap-5 mt-8">
                {section.items.map((item, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: j * 0.06 }}
                    className="satin-surface rounded-xl p-6 flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                      {STANDARD_ICONS[item.title] || <ShieldCheck size={18} />}
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </Layout>
  );
}

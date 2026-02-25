import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserCheck, FileText, Banknote, Wrench, Search, Scale } from 'lucide-react';
import Layout from '@/components/Layout';
import { usePage } from '@/lib/content';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'Tenant Sourcing & Vetting': <UserCheck size={20} />,
  'Lease Management': <FileText size={20} />,
  'Rent Collection': <Banknote size={20} />,
  'Property Maintenance': <Wrench size={20} />,
  'Periodic Inspections': <Search size={20} />,
  'Regulatory Compliance': <Scale size={20} />,
};

export default function Residential() {
  const { data } = usePage('residential');

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 satin-glow">
        <div className="section-container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="micro-type text-primary mb-4">Residential Services</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              {data?.title || 'Residential Services'}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {data?.description || ''}
            </p>
          </motion.div>
        </div>
      </section>

      {data?.sections?.map((section, i) => {
        if (section.items && section.items.length > 0) {
          return (
            <section key={section.id || i} className="py-16 border-t border-border/30">
              <div className="section-container">
                <p className="micro-type text-primary mb-3">{section.heading}</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
                  {section.items.map((item, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: j * 0.06 }}
                      className="satin-surface rounded-xl p-6"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                        {SERVICE_ICONS[item.title] || <Wrench size={18} />}
                      </div>
                      <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (section.id === 'cta') {
          return (
            <section key={section.id || i} className="py-16 border-t border-border/30">
              <div className="section-container max-w-2xl text-center">
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-4">{section.heading}</h2>
                <p className="text-muted-foreground leading-relaxed mb-8">{section.body}</p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Contact Our Residential Team
                </Link>
              </div>
            </section>
          );
        }

        return (
          <section key={section.id || i} className="py-16 border-t border-border/30">
            <div className="section-container max-w-3xl">
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-4">{section.heading}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.body}</p>
              </motion.div>
            </div>
          </section>
        );
      })}
    </Layout>
  );
}

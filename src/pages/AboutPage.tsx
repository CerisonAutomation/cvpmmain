import { motion } from 'framer-motion';
import { Shield, Sparkles, Clock, Lightbulb } from 'lucide-react';
import Layout from '@/components/Layout';
import { usePage } from '@/lib/content';

const VALUE_ICONS: Record<string, React.ReactNode> = {
  Transparency: <Shield size={20} />,
  Excellence: <Sparkles size={20} />,
  Accountability: <Clock size={20} />,
  Innovation: <Lightbulb size={20} />,
};

export default function AboutPage() {
  const { data } = usePage('about');

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 satin-glow">
        <div className="section-container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="micro-type text-primary mb-4">About Us</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              {data?.title || 'About Christiano Vincenti'}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {data?.description || ''}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sections */}
      {data?.sections?.map((section, i) => {
        const isValues = section.id === 'values';
        const isNumbers = section.id === 'numbers';

        if (isNumbers && section.items) {
          return (
            <section key={section.id || i} className="py-16 border-t border-border/30">
              <div className="section-container">
                <p className="micro-type text-primary mb-3">{section.heading}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                  {section.items.map((item, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: j * 0.1 }}
                      className="text-center"
                    >
                      <p className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-2">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (isValues && section.items) {
          return (
            <section key={section.id || i} className="py-16 border-t border-border/30 satin-glow">
              <div className="section-container">
                <p className="micro-type text-primary mb-3">{section.heading}</p>
                <div className="grid sm:grid-cols-2 gap-5 mt-8">
                  {section.items.map((item, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: j * 0.08 }}
                      className="satin-surface rounded-xl p-6 flex gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        {VALUE_ICONS[item.title] || <Sparkles size={18} />}
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        return (
          <section key={section.id || i} className="py-16 border-t border-border/30">
            <div className="section-container max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
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

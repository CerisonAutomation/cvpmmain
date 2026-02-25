import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useLegal } from '@/lib/content';

export default function TermsPage() {
  const { data } = useLegal('terms');

  const sections = data?.content?.split('\n\n').reduce<{ heading?: string; paragraphs: string[] }[]>((acc, para) => {
    const numbered = para.match(/^(\d+)\.\s+(.+)/);
    if (numbered) {
      acc.push({ heading: `${numbered[1]}. ${numbered[2]}`, paragraphs: [] });
    } else if (acc.length > 0) {
      acc[acc.length - 1].paragraphs.push(para);
    } else {
      acc.push({ paragraphs: [para] });
    }
    return acc;
  }, []) || [];

  return (
    <Layout>
      <section className="py-20">
        <div className="section-container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="micro-type text-primary mb-4">Legal</p>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-3">
              {data?.title || 'Terms of Service'}
            </h1>
            {data?.lastUpdated && (
              <p className="text-xs text-muted-foreground mb-10">Last updated: {data.lastUpdated}</p>
            )}
          </motion.div>

          <div className="space-y-8">
            {sections.map((s, i) => (
              <div key={i}>
                {s.heading && (
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-3">{s.heading}</h2>
                )}
                {s.paragraphs.map((p, j) => (
                  <p key={j} className="text-sm text-muted-foreground leading-relaxed mb-3">{p}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

import { motion } from 'framer-motion';

interface LogoStripData {
  heading?: string;
  logos: Array<{ name: string; url?: string }>;
}

interface Props {
  data: LogoStripData;
  className?: string;
}

export default function LogoStripBlock({ data, className = '' }: Props) {
  const { heading, logos } = data;

  return (
    <section className={`py-10 border-t border-border/30 ${className}`}>
      <div className="section-container">
        {heading && (
          <p className="micro-type text-muted-foreground text-center mb-6">{heading}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {logos.map((logo, i) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-2 opacity-50 hover:opacity-80 transition-opacity"
            >
              {logo.url ? (
                <img src={logo.url} alt={logo.name} className="h-8 w-auto object-contain grayscale" loading="lazy" />
              ) : (
                <span className="font-serif text-lg font-semibold text-muted-foreground tracking-wide">{logo.name}</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

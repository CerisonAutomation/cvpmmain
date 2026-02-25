import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useLegal, type CookieTableEntry } from '@/lib/content';
import { openCookieSettings } from '@/components/CookieConsentBanner';

export default function CookiesPage() {
  const { data } = useLegal('cookies');
  const cookies = data?.cookieTable || [];

  return (
    <Layout>
      <section className="py-20">
        <div className="section-container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="micro-type text-primary mb-4">Legal</p>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-3">
              {data?.title || 'Cookie Policy'}
            </h1>
          </motion.div>

          <p className="text-muted-foreground leading-relaxed mt-6 mb-4 max-w-2xl">
            This website uses cookies to ensure you get the best experience. Cookies help us understand how you interact with our site, remember your preferences, and improve our services. Under GDPR and the Maltese Data Protection Act, we require your consent for non-essential cookies.
          </p>

          <button
            onClick={openCookieSettings}
            className="px-6 py-2.5 text-sm font-semibold border border-border text-foreground rounded-lg hover:border-primary hover:text-primary transition-colors mb-12"
          >
            Manage Cookie Settings
          </button>

          {cookies.length > 0 && (
            <div>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Cookies We Use</h2>
              <div className="overflow-x-auto rounded-xl border border-border/50">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/50">
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Provider</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Purpose</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expiry</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cookies.map((c: CookieTableEntry, i: number) => (
                      <tr key={i} className="border-t border-border/30 hover:bg-secondary/20 transition-colors">
                        <td className="py-3 px-4 text-foreground font-mono text-xs">{c.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{c.provider}</td>
                        <td className="py-3 px-4 text-muted-foreground">{c.purpose}</td>
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">{c.expiry}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            c.type === 'Necessary' ? 'bg-primary/10 text-primary' :
                            c.type === 'Analytics' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-secondary text-muted-foreground'
                          }`}>
                            {c.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-12 satin-surface rounded-xl p-6">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Your Rights</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Under GDPR, you have the right to withdraw consent for non-essential cookies at any time using the button above.
              Essential cookies cannot be disabled as they are required for the website to function properly.
              For more information about how we handle your data, see our{' '}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

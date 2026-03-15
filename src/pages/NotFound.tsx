import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

const QUICK_LINKS = [
  { href: '/properties', label: 'Browse Properties' },
  { href: '/owners', label: 'Owner Services' },
  { href: '/owners/estimate', label: 'Free Estimate' },
  { href: '/contact', label: 'Contact Us' },
];

const NotFound = () => {
  const location = useLocation();
  useEffect(() => { console.error('404:', location.pathname); }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Page Not Found — Christiano Vincenti PM"
        description="The page you're looking for doesn't exist. Browse our Malta holiday properties or contact our team."
      />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full text-center">
          <p className="micro-type text-primary mb-4 tracking-widest">404</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4 leading-tight">
            Page not found
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed mb-10 max-w-sm mx-auto">
            The page{' '}
            <span className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">{location.pathname}</span>{' '}
            doesn't exist. Perhaps you were looking for one of these?
          </p>
          <div className="grid grid-cols-2 gap-3 mb-10">
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} to={link.href}
                className="flex items-center justify-center p-4 border border-border/40 rounded-xl text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/[0.03] transition-all">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
              <Home size={16} /> Back to Home
            </Link>
            <button onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border/50 rounded-lg font-semibold text-sm text-foreground hover:bg-accent transition-colors">
              <ArrowLeft size={16} /> Go Back
            </button>
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            Still lost?{' '}
            <Link to="/contact" className="text-primary hover:underline underline-offset-4">Contact our team</Link>
            {' '}— we respond within 24 hours.
          </p>
        </div>
      </main>
    </div>
  );
};
export default NotFound;

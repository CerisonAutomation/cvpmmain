import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { openCookieSettings } from './CookieConsentBanner';
import { Mail, Phone, MapPin } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/cms';

export default function Footer() {
  const { footerLinks, email, phone, address } = SITE_CONFIG;

  return (
    <footer className="relative border-t border-border/20 overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: 'linear-gradient(90deg,transparent,var(--gold-shimmer-2) 30%,var(--gold-shimmer-2) 70%,transparent)', opacity: 0.4 }}
      />
      <div className="noise-overlay absolute inset-0 pointer-events-none" />

      <div className="section-container py-14 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 md:col-span-2">
            <div className="satin-surface inline-block p-3 mb-5">
              <Link to="/"><Logo size="sm" /></Link>
            </div>
            <p className="text-small text-muted-foreground max-w-xs leading-relaxed mb-5">
              Full-service short-let management across Malta & Gozo. MTA licensed operator.
            </p>
            <div className="flex flex-col gap-2.5">
              <a href={`mailto:${email}`} className="flex items-center gap-2 text-small text-muted-foreground hover:text-primary transition-colors group">
                <Mail size={11} className="text-primary/60 group-hover:text-primary transition-colors" />{email}
              </a>
              <a href={`tel:${phone.replace(/\s/g,'')}`} className="flex items-center gap-2 text-small text-muted-foreground hover:text-primary transition-colors group">
                <Phone size={11} className="text-primary/60 group-hover:text-primary transition-colors" />{phone}
              </a>
              <span className="flex items-center gap-2 text-small text-muted-foreground">
                <MapPin size={11} className="text-primary/60" />{address}
              </span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="micro-type text-foreground/70 mb-4">{section}</h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link to={l.href} className="text-small text-muted-foreground hover:text-primary transition-colors">{l.label}</Link>
                  </li>
                ))}
                {section === 'legal' && (
                  <li><button onClick={openCookieSettings} className="text-small text-muted-foreground hover:text-primary transition-colors">Cookie Settings</button></li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border/15 glass-strong">
        <div className="section-container py-4 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-caption" style={{ color: 'var(--text-muted)' }}>© {new Date().getFullYear()} Christiano Property Management. All rights reserved.</p>
          <p className="text-caption" style={{ color: 'var(--text-muted)' }}>Malta · EUR</p>
        </div>
      </div>
    </footer>
  );
}

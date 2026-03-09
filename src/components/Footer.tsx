import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { openCookieSettings } from './CookieConsentBanner';
import { Mail, Phone, MapPin } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/cms';

export default function Footer() {
  const { footerLinks, email, phone, address } = SITE_CONFIG;

  return (
    <footer className="border-t border-border/30">
      <div className="section-container py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link to="/">
              <Logo size="sm" />
            </Link>
            <p className="text-[13px] text-muted-foreground mt-4 max-w-xs leading-relaxed">
              Full-service short-let management across Malta & Gozo. MTA licensed operator.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <a href={`mailto:${email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Mail size={12} /> {email}
              </a>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Phone size={12} /> {phone}
              </a>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin size={12} /> {address}
              </span>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground mb-4 font-display">
                {section}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link to={l.href} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
                {section === 'legal' && (
                  <li>
                    <button onClick={openCookieSettings} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                      Cookie Settings
                    </button>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border/20">
        <div className="section-container py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Christiano Property Management. All rights reserved.
          </p>
          <p className="text-[11px] text-muted-foreground">Malta · EUR</p>
        </div>
      </div>
    </footer>
  );
}

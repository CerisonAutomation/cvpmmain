import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { openCookieSettings } from './CookieConsentBanner';
import { Mail, Phone, MapPin } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/cms';

export default function Footer() {
  const { footerLinks, email, phone, address } = SITE_CONFIG;

  return (
    <footer className="border-t border-border/25">
      <div className="section-container py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link to="/">
              <Logo size="sm" />
            </Link>
            <p className="text-[12px] text-muted-foreground mt-3 max-w-xs leading-relaxed">
              Full-service short-let management across Malta & Gozo. MTA licensed operator.
            </p>
            <div className="mt-4 flex flex-col gap-1.5">
              <a href={`mailto:${email}`} className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors">
                <Mail size={10} /> {email}
              </a>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors">
                <Phone size={10} /> {phone}
              </a>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <MapPin size={10} /> {address}
              </span>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground mb-3 font-display">
                {section}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link to={l.href} className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
                {section === 'legal' && (
                  <li>
                    <button onClick={openCookieSettings} className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                      Cookie Settings
                    </button>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border/15">
        <div className="section-container py-3 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <p className="text-[10px] text-muted-foreground">
            © {new Date().getFullYear()} Christiano Property Management. All rights reserved.
          </p>
          <p className="text-[10px] text-muted-foreground">Malta · EUR</p>
        </div>
      </div>
    </footer>
  );
}

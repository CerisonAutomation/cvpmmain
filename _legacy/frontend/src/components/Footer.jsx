import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, Facebook, MessageCircle } from "lucide-react";
import { useCMS } from "@/context/CMSContext";
import { useModal } from "@/context/ModalContext";

export const Footer = () => {
  const { cms } = useCMS();
  const { openContactModal, openOwnerModal } = useModal();

  const SITE_LOGO = cms.brand?.logoWhite || cms.brand?.logo || "/logo-white.png";
  const { phone = "+356 7979 0202", email = "info@christianopropertymanagement.com" } = cms.contact || {};

  const guestLinks = cms.footer?.guestLinks || [
    { label: "Browse Properties", href: "/properties" },
    { label: "Book a Stay", href: "/properties" },
    { label: "Contact Us", action: "openContactModal" },
  ];
  const ownerLinks = cms.footer?.ownerLinks || [
    { label: "Our Services", href: "/property-owners" },
    { label: "List Your Property", action: "openOwnerModal" },
    { label: "Pricing Plans", href: "/property-owners#pricing" },
  ];
  const social = cms.footer?.social || {};
  const igUrl = social.instagram || "https://instagram.com/christianopropertymanagement";
  const fbUrl = social.facebook || "https://facebook.com/christianopropertymanagement";
  const waUrl = cms.contact?.whatsapp ? `https://wa.me/${cms.contact.whatsapp}` : "https://wa.me/35679790202";

  const handleLink = (link) => {
    if (link.action === "openContactModal") openContactModal(link.subject ? { subject: link.subject } : undefined);
    else if (link.action === "openOwnerModal") openOwnerModal();
  };

  return (
    <footer className="bg-[#0F0F10] border-t border-white/5" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <img src={SITE_LOGO} alt={cms.brand?.name} className="h-10 w-auto mb-3" style={{ filter: "brightness(0) invert(1)" }} />
            <p className="text-[#A1A1AA] text-xs leading-relaxed mb-2">{cms.brand?.tagline}</p>
            {cms.contact?.address && <p className="text-[#71717A] text-xs">{cms.contact.address}</p>}
          </div>

          <div>
            <h4 className="heading text-sm text-[#F5F5F0] mb-3 font-semibold">For Guests</h4>
            <nav className="flex flex-col gap-2">
              {guestLinks.map((link, i) =>
                link.href ? (
                  <Link key={i} to={link.href} className="text-xs text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">{link.label}</Link>
                ) : (
                  <button key={i} onClick={() => handleLink(link)} className="text-xs text-[#A1A1AA] hover:text-[#D4AF37] transition-colors text-left">{link.label}</button>
                )
              )}
            </nav>
          </div>

          <div>
            <h4 className="heading text-sm text-[#F5F5F0] mb-3 font-semibold">For Owners</h4>
            <nav className="flex flex-col gap-2">
              {ownerLinks.map((link, i) =>
                link.href ? (
                  <Link key={i} to={link.href} className="text-xs text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">{link.label}</Link>
                ) : (
                  <button key={i} onClick={() => handleLink(link)} className="text-xs text-[#A1A1AA] hover:text-[#D4AF37] transition-colors text-left">{link.label}</button>
                )
              )}
            </nav>
          </div>

          <div>
            <h4 className="heading text-sm text-[#F5F5F0] mb-3 font-semibold">Contact</h4>
            <div className="flex flex-col gap-2">
              <a href={`tel:${phone}`} className="flex items-center gap-2 text-xs text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">
                <Phone className="w-3 h-3" />{phone}
              </a>
              <a href={`mailto:${email}`} className="flex items-center gap-2 text-xs text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">
                <Mail className="w-3 h-3" />{email}
              </a>
              {cms.contact?.address && (
                <p className="flex items-start gap-2 text-xs text-[#71717A]">
                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{cms.contact.address}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-[#71717A]">&copy; {new Date().getFullYear()} {cms.brand?.name}. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <a href={igUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 flex items-center justify-center border border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all group" aria-label="Instagram">
                <Instagram className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#D4AF37] transition-colors" />
              </a>
              <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 flex items-center justify-center border border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all group" aria-label="Facebook">
                <Facebook className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#D4AF37] transition-colors" />
              </a>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 flex items-center justify-center border border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all group" aria-label="WhatsApp">
                <MessageCircle className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#D4AF37] transition-colors" />
              </a>
            </div>
            <div className="flex gap-3 text-xs">
              <Link to="/privacy-policy" className="text-[#71717A] hover:text-[#D4AF37] transition-colors">Privacy</Link>
              <span className="text-[#71717A]">·</span>
              <Link to="/terms" className="text-[#71717A] hover:text-[#D4AF37] transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

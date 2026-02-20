import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { label: "Properties", href: "/properties" },
  { label: "Owners", href: "/owners" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

interface NavbarProps {
  onOpenWizard?: () => void;
}

export default function Navbar({ onOpenWizard }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded">
        Skip to content
      </a>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm" : "bg-transparent"
        }`}
      >
        <nav className="section-container flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" aria-label="Home">
            <Logo size="sm" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-[13px] font-medium px-4 py-2 rounded-full transition-colors ${
                  isActive(link.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="w-px h-5 bg-border/50 mx-3" />

            {onOpenWizard && (
              <button
                onClick={onOpenWizard}
                className="px-4 py-2 text-[13px] font-medium text-primary hover:text-foreground transition-colors"
              >
                Free Estimate
              </button>
            )}

            <Link
              to="/book"
              className="ml-1 px-6 py-2.5 text-[13px] font-semibold bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-background border-l border-border flex flex-col"
              role="dialog"
              aria-label="Navigation menu"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/50">
                <Logo size="sm" />
                <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="p-1 text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col p-6 gap-1 overflow-y-auto flex-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`text-[15px] font-medium py-3 px-3 rounded-lg transition-colors ${
                      isActive(link.href) ? "text-primary bg-primary/5" : "text-foreground hover:bg-accent/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {onOpenWizard && (
                  <>
                    <div className="h-px bg-border/50 my-3" />
                    <button
                      onClick={() => { setDrawerOpen(false); onOpenWizard(); }}
                      className="text-[15px] font-medium py-3 px-3 rounded-lg text-primary hover:bg-primary/5 text-left transition-colors"
                    >
                      Free Estimate
                    </button>
                  </>
                )}

                <div className="mt-auto pt-6">
                  <Link
                    to="/book"
                    className="block w-full py-3.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl text-center hover:opacity-90 transition-opacity"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

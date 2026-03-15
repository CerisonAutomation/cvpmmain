import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { label: "Owners", href: "/owners", children: [
    { label: "How It Works", href: "/owners" },
    { label: "Pricing", href: "/owners/pricing" },
    { label: "Get Free Estimate", href: "/owners/estimate" },
    { label: "Our Standards", href: "/owners/standards" },
    { label: "Owner Portal", href: "/owners/portal" },
  ]},
  { label: "Properties", href: "/properties" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

interface NavbarProps {
  onOpenWizard?: () => void;
}

export default function Navbar({ onOpenWizard }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ownersOpen, setOwnersOpen] = useState(false);
  const [mobileOwnersOpen, setMobileOwnersOpen] = useState(false);
  const location = useLocation();

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 32);
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
    setOwnersOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) => location.pathname.startsWith(href) && href !== '/';

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-3 focus:py-1.5 focus:bg-primary focus:text-primary-foreground focus:text-xs">
        Skip to content
      </a>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled ? "bg-background/95 backdrop-blur-lg border-b border-border/40" : "bg-transparent"
        }`}
      >
        <nav className="section-container flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" aria-label="Home">
            <Logo size="sm" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              link.children ? (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setOwnersOpen(true)}
                  onMouseLeave={() => setOwnersOpen(false)}
                >
                  <button
                    className={`flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 transition-colors ${
                      isActive(link.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                    <ChevronDown size={11} className={`transition-transform ${ownersOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {ownersOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute top-full left-0 mt-0.5 w-48 bg-card border border-border/50 overflow-hidden py-1"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className={`block px-3 py-2 text-[12px] transition-colors ${
                              location.pathname === child.href
                                ? 'text-primary bg-primary/5'
                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-[12px] font-medium px-3 py-1.5 transition-colors ${
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}

            <div className="w-px h-4 bg-border/40 mx-2" />

            <Link
              to="/book"
              className="ml-1 px-4 py-1.5 text-[12px] font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-1.5 text-foreground"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
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
              className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 350 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-background border-l border-border flex flex-col"
              role="dialog"
              aria-label="Navigation menu"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/40">
                <Logo size="sm" />
                <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="p-1 text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col p-4 gap-0.5 overflow-y-auto flex-1">
                {NAV_LINKS.map((link) => (
                  link.children ? (
                    <div key={link.href}>
                      <button
                        onClick={() => setMobileOwnersOpen(!mobileOwnersOpen)}
                        className={`w-full flex items-center justify-between text-[13px] font-medium py-2.5 px-2 transition-colors ${
                          isActive(link.href) ? "text-primary bg-primary/5" : "text-foreground hover:bg-accent/50"
                        }`}
                      >
                        {link.label}
                        <ChevronDown size={13} className={`transition-transform ${mobileOwnersOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {mobileOwnersOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-2"
                          >
                            {link.children.map((child) => (
                              <Link
                                key={child.href}
                                to={child.href}
                                className={`block py-2 px-2 text-[12px] transition-colors ${
                                  location.pathname === child.href ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`text-[13px] font-medium py-2.5 px-2 transition-colors ${
                        location.pathname === link.href ? "text-primary bg-primary/5" : "text-foreground hover:bg-accent/50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                ))}

                <div className="mt-auto pt-4">
                  <Link
                    to="/book"
                    className="block w-full py-2.5 text-[13px] font-semibold bg-primary text-primary-foreground text-center hover:opacity-90 transition-opacity"
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

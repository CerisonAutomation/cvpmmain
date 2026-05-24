import "@/App.css";
import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StickyCallToAction } from "@/components/StickyCallToAction";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactModal } from "@/components/modals/ContactModal";
import { PropertyOwnerModal } from "@/components/modals/PropertyOwnerModal";
import { ModalProvider } from "@/context/ModalContext";
import { CMSProvider } from "@/context/CMSContext";
import { EditModeProvider } from "@/context/EditModeContext";
import { NotFoundPage } from "@/pages/NotFoundPage";

const LandingPage = lazy(() => import("@/pages/LandingPage").then((m) => ({ default: m.LandingPage })));
const PropertiesPage = lazy(() => import("@/pages/PropertiesPage").then((m) => ({ default: m.PropertiesPage })));
const PropertyDetailPage = lazy(() => import("@/pages/PropertyDetailPage").then((m) => ({ default: m.PropertyDetailPage })));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage })));
const ConfirmationPage = lazy(() => import("@/pages/ConfirmationPage").then((m) => ({ default: m.ConfirmationPage })));
const PropertyOwnersPage = lazy(() => import("@/pages/PropertyOwnersPage").then((m) => ({ default: m.PropertyOwnersPage })));
const MapPage = lazy(() => import("@/pages/MapPageLeaflet").then((m) => ({ default: m.MapPage })));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const CmsPage = lazy(() => import("@/pages/CmsPage").then((m) => ({ default: m.CmsPage })));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import("@/pages/TermsPage").then((m) => ({ default: m.TermsPage })));

function PageLoader() {
  return <div className="min-h-[40vh] flex items-center justify-center text-[#A1A1AA]">Loading…</div>;
}

function EnRedirect() {
  const location = useLocation();
  const to = location.pathname.replace(/^\/en/, "") || "/";
  return <Navigate to={`${to}${location.search}${location.hash}`} replace />;
}

function ScrollToHash() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
      return () => clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname, location.hash]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const isCheckout = location.pathname.startsWith("/checkout");

  return (
    <>
      <ScrollToHash />
      <Header />
      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
            <Route path="/checkout/:quoteId" element={<CheckoutPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/property-owners" element={<PropertyOwnersPage />} />
            <Route path="/for-owners" element={<PropertyOwnersPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/cms/:slug" element={<CmsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/en/*" element={<EnRedirect />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      {!isCheckout && <StickyCallToAction />}
      <Toaster position="top-right" richColors />
      <ContactModal />
      <PropertyOwnerModal />
    </>
  );
}

function App() {
  useEffect(() => {
    const key = import.meta.env.VITE_POSTHOG_KEY;
    if (key && window.posthog?.register) {
      window.posthog.register({ app: "cvpm", env: import.meta.env.MODE });
    }
  }, []);

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <CMSProvider>
          <ModalProvider>
            <div className="min-h-screen bg-[#0F0F10]">
              <BrowserRouter>
                <EditModeProvider>
                  <AppContent />
                </EditModeProvider>
              </BrowserRouter>
            </div>
          </ModalProvider>
        </CMSProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;

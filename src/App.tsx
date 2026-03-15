import { useState, Suspense, lazy } from "react";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import type { FallbackProps } from "react-error-boundary";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import LoadingScreen from "@/components/LoadingScreen";
import AiConcierge from "@/components/AiConcierge";
import AdminGuard from "@/components/AdminGuard";
import { SmartSearch } from "@/components/SmartSearch";
import { CmsPage } from "@/components/CmsPage";
import { useListingsRealtime } from "@/hooks/use-listings-realtime";

const Properties      = lazy(() => import("./pages/Properties"));
const PropertyDetail  = lazy(() => import("./pages/PropertyDetail"));
const Book            = lazy(() => import("./pages/Book"));
const OwnersEstimate  = lazy(() => import("./pages/OwnersEstimate"));
const OwnersStandards = lazy(() => import("./pages/OwnersStandards"));
const OwnersResults   = lazy(() => import("./pages/OwnersResults"));
const OwnersPack      = lazy(() => import("./pages/OwnersPack"));
const PrivacyPage     = lazy(() => import("./pages/PrivacyPage"));
const CookiesPage     = lazy(() => import("./pages/CookiesPage"));
const TermsPage       = lazy(() => import("./pages/TermsPage"));
const Admin           = lazy(() => import("./pages/Admin"));
const LocationPage    = lazy(() => import("./pages/LocationPage"));
const OwnerPortalPage = lazy(() => import("./pages/OwnerPortalPage"));
const NotFound        = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: (failureCount, error: unknown) => {
        const err = error as Error;
        if (err?.message?.includes('401') || err?.message?.includes('403')) return false;
        if (err?.message?.includes('429')) return failureCount < 1;
        return failureCount < 2;
      },
      retryDelay: (i) => Math.min(5000 * 2 ** i, 30_000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      placeholderData: (prev: unknown) => prev,
    },
    mutations: { retry: 1, retryDelay: 5000 },
  },
});

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const isProd = import.meta.env.PROD;
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full satin-surface p-10 text-center">
        <div
          className="w-14 h-14 mx-auto mb-5 flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <AlertTriangle className="w-7 h-7 text-destructive" />
        </div>
        <h2 className="font-serif text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
        <p className="text-small text-muted-foreground mb-8">
          {isProd ? "We're working on a fix. Please try again." : (error as Error)?.message}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={resetErrorBoundary} className="btn-gold btn-gold-glow inline-flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
          <a href="/" className="btn-outline inline-flex items-center gap-2">
            <Home className="w-3.5 h-3.5" /> Go Home
          </a>
        </div>
        {!isProd && (error as Error)?.stack && (
          <details className="mt-8 text-left">
            <summary className="text-caption text-muted-foreground cursor-pointer">Stack trace</summary>
            <pre className="mt-2 p-3 bg-muted text-[0.65rem] overflow-auto max-h-40 leading-relaxed">{(error as Error).stack}</pre>
          </details>
        )}
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5">
        <div
          className="w-10 h-10 border-2 rounded-full animate-spin"
          style={{
            borderColor: 'rgba(196,163,90,0.2)',
            borderTopColor: 'var(--gold-300)',
          }}
        />
        <p className="micro-type text-muted-foreground" style={{ fontSize: '0.6rem' }}>Loading</p>
      </div>
    </div>
  );
}

function SuspenseWrapper({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => queryClient.clear()}
        onError={(error, info) => {
          if (!import.meta.env.PROD) console.error('[ErrorBoundary]', error, info);
        }}
      >
        {children}
      </ErrorBoundary>
    </Suspense>
  );
}

export default function App() {
  useListingsRealtime();
  const [loaded, setLoaded] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
        <BrowserRouter>
          <SuspenseWrapper>
            <SmartSearch />
            <Routes>
              {/* CMS-driven pages */}
              <Route path="/"             element={<CmsPage slug="home" />} />
              <Route path="/about"        element={<CmsPage slug="about" />} />
              <Route path="/residential"  element={<CmsPage slug="residential" />} />
              <Route path="/owners"       element={<CmsPage slug="owners" />} />
              <Route path="/contact"      element={<CmsPage slug="contact" />} />
              <Route path="/faq"          element={<CmsPage slug="faq" />} />
              <Route path="/owners/pricing" element={<CmsPage slug="owners-pricing" />} />

              {/* Application routes */}
              <Route path="/properties"         element={<Properties />} />
              <Route path="/properties/:id"     element={<PropertyDetail />} />
              <Route path="/book"               element={<Book />} />

              {/* Owners sub-pages */}
              <Route path="/owners/estimate"    element={<OwnersEstimate />} />
              <Route path="/owners/standards"   element={<OwnersStandards />} />
              <Route path="/owners/results"     element={<OwnersResults />} />
              <Route path="/owners/owners-pack" element={<OwnersPack />} />
              <Route path="/owners/portal"      element={<OwnerPortalPage />} />

              {/* Location pages */}
              <Route path="/locations/:slug"    element={<LocationPage />} />

              {/* Legal */}
              <Route path="/privacy"  element={<PrivacyPage />} />
              <Route path="/cookies"  element={<CookiesPage />} />
              <Route path="/terms"    element={<TermsPage />} />

              {/* Admin */}
              <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </SuspenseWrapper>
        </BrowserRouter>
        <Suspense fallback={null}><AiConcierge /></Suspense>
        <CookieConsentBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

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

// Lazy-loaded pages
const Index            = lazy(() => import("./pages/Index"));
const Residential      = lazy(() => import("./pages/Residential"));
const Properties       = lazy(() => import("./pages/Properties"));
const PropertyDetail   = lazy(() => import("./pages/PropertyDetail"));
const Book             = lazy(() => import("./pages/Book"));
const Owners           = lazy(() => import("./pages/Owners"));
const OwnersEstimate   = lazy(() => import("./pages/OwnersEstimate"));
const OwnersStandards  = lazy(() => import("./pages/OwnersStandards"));
const OwnersResults    = lazy(() => import("./pages/OwnersResults"));
const OwnersPack       = lazy(() => import("./pages/OwnersPack"));
const PricingPage      = lazy(() => import("./pages/PricingPage"));
const AboutPage        = lazy(() => import("./pages/AboutPage"));
const FAQPage          = lazy(() => import("./pages/FAQPage"));
const ContactPage      = lazy(() => import("./pages/ContactPage"));
const PrivacyPage      = lazy(() => import("./pages/PrivacyPage"));
const CookiesPage      = lazy(() => import("./pages/CookiesPage"));
const TermsPage        = lazy(() => import("./pages/TermsPage"));
const Admin            = lazy(() => import("./pages/Admin"));
const LocationPage     = lazy(() => import("./pages/LocationPage"));
const OwnerPortalPage  = lazy(() => import("./pages/OwnerPortalPage"));
const NotFound         = lazy(() => import("./pages/NotFound"));

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
    mutations: {
      retry: 1,
      retryDelay: 5000,
    },
  },
});

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const isProd = import.meta.env.PROD;
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          {isProd ? "We're working on fixing this. Please try again." : (error as Error)?.message}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <a href="/" className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg font-medium hover:bg-accent transition-colors">
            <Home className="w-4 h-4" /> Go Home
          </a>
        </div>
        {!isProd && (error as Error)?.stack && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-muted-foreground cursor-pointer">Stack trace</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40">{(error as Error).stack}</pre>
          </details>
        )}
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading…</p>
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
          if (!import.meta.env.PROD) console.error('ErrorBoundary:', error, info);
        }}
      >
        {children}
      </ErrorBoundary>
    </Suspense>
  );
}

export default function App() {
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
              <Route path="/"                     element={<Index />} />
              <Route path="/residential"          element={<Residential />} />
              <Route path="/properties"           element={<Properties />} />
              <Route path="/properties/:id"       element={<PropertyDetail />} />
              <Route path="/book"                 element={<Book />} />
              <Route path="/owners"               element={<Owners />} />
              <Route path="/owners/estimate"      element={<OwnersEstimate />} />
              <Route path="/owners/pricing"       element={<PricingPage />} />
              <Route path="/owners/standards"     element={<OwnersStandards />} />
              <Route path="/owners/results"       element={<OwnersResults />} />
              <Route path="/owners/owners-pack"   element={<OwnersPack />} />
              <Route path="/owners/portal"        element={<OwnerPortalPage />} />
              <Route path="/pricing"              element={<PricingPage />} />
              <Route path="/about"                element={<AboutPage />} />
              <Route path="/faq"                  element={<FAQPage />} />
              <Route path="/contact"              element={<ContactPage />} />
              <Route path="/locations/:slug"      element={<LocationPage />} />
              <Route path="/privacy"              element={<PrivacyPage />} />
              <Route path="/cookies"              element={<CookiesPage />} />
              <Route path="/terms"                element={<TermsPage />} />
              <Route
                path="/admin"
                element={
                  <AdminGuard>
                    <Admin />
                  </AdminGuard>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SuspenseWrapper>
        </BrowserRouter>
        <AiConcierge />
        <CookieConsentBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

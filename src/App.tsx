import { useState, Suspense, lazy, Component, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import LoadingScreen from "@/components/LoadingScreen";

// Lazy load pages for better code splitting
const Index = lazy(() => import("./pages/Index"));
const Residential = lazy(() => import("./pages/Residential"));
const Properties = lazy(() => import("./pages/Properties"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const Book = lazy(() => import("./pages/Book"));
const Owners = lazy(() => import("./pages/Owners"));
const OwnersEstimate = lazy(() => import("./pages/OwnersEstimate"));
const OwnersStandards = lazy(() => import("./pages/OwnersStandards"));
const OwnersResults = lazy(() => import("./pages/OwnersResults"));
const OwnersPack = lazy(() => import("./pages/OwnersPack"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const CookiesPage = lazy(() => import("./pages/CookiesPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Enterprise-grade React Query config with retry logic, caching, and error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Refetch in background when window gains focus
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Don't refetch on mount if data exists
      refetchOnMount: false,
      // Keep previous data while fetching new data
      placeholderData: (previousData) => previousData,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // On mutation error, retry after 5 seconds
      retryDelay: 5000,
    },
  },
});

// Global error boundary fallback component
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const isProduction = import.meta.env.PROD;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          {isProduction 
            ? "We're working on fixing this issue. Please try again."
            : (error as Error)?.message || "An unexpected error occurred"}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </a>
        </div>
        {!isProduction && (error as Error)?.stack && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-muted-foreground cursor-pointer">Error Details</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
              {(error as Error).stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// Loading spinner component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Suspense wrapper with error boundary
function SuspenseWrapper({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          // Clear query cache on error reset
          queryClient.clear();
        }}
        onError={(error, errorInfo) => {
          // Log error to console in development
          if (!import.meta.env.PROD) {
            console.error("Error caught by boundary:", error, errorInfo);
          }
          // In production, this would send to Sentry
        }}
      >
        {children}
      </ErrorBoundary>
    </Suspense>
  );
}

function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
        <BrowserRouter>
          <SuspenseWrapper>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/residential" element={<Residential />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/book" element={<Book />} />
              <Route path="/owners" element={<Owners />} />
              <Route path="/owners/estimate" element={<OwnersEstimate />} />
              <Route path="/owners/pricing" element={<PricingPage />} />
              <Route path="/owners/standards" element={<OwnersStandards />} />
              <Route path="/owners/results" element={<OwnersResults />} />
              <Route path="/owners/owners-pack" element={<OwnersPack />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SuspenseWrapper>
        </BrowserRouter>
        <CookieConsentBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

/**
 * Accessible Skip Link Component
 * - Allows keyboard users to skip navigation
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground"
    >
      Skip to main content
    </a>
  );
}

/**
 * Screen Reader Only text
 */
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">{children}</span>
  );
}

/**
 * Announce changes to screen readers
 */
export function LiveRegion({ 
  children, 
  priority = 'polite' 
}: { 
  children: React.ReactNode; 
  priority?: 'polite' | 'assertive';
}) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  );
}

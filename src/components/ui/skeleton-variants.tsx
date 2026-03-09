/**
 * Enterprise Skeleton Loading Components
 * - Property cards, detail pages, forms
 * - Animated shimmer effect
 * - Accessibility: aria-busy, aria-label
 */
import { cn } from '@/lib/utils';

// Base animated skeleton
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-muted/60',
        'relative overflow-hidden',
        'before:absolute before:inset-0',
        'before:translate-x-[-100%]',
        'before:animate-[shimmer_2s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/5 before:to-transparent',
        className
      )}
      {...props}
    />
  );
}

// Property card skeleton
export function PropertyCardSkeleton({ className }: { className?: string }) {
  return (
    <article
      aria-busy="true"
      aria-label="Loading property"
      className={cn('border border-border/40 bg-card overflow-hidden', className)}
    >
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-2.5 w-2.5 rounded-full" />
          <Skeleton className="h-2.5 w-20" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-3">
          <Skeleton className="h-2.5 w-8" />
          <Skeleton className="h-2.5 w-8" />
          <Skeleton className="h-2.5 w-8" />
        </div>
        <div className="flex items-center justify-between pt-2.5 border-t border-border/20">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </article>
  );
}

// Property detail skeleton
export function PropertyDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading property details">
      {/* Gallery skeleton */}
      <Skeleton className="h-[50vh] md:h-[60vh] w-full rounded-none" />
      
      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-2/3" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Calendar */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border border-border/50 rounded-2xl p-6 space-y-5 bg-card">
            <div className="flex items-baseline justify-between">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Booking form skeleton
export function BookingFormSkeleton() {
  return (
    <div aria-busy="true" className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-busy="true" className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-3 bg-muted/30 border-b border-border">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 p-3 border-b border-border/50 last:border-0">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}

// Text block skeleton
export function TextBlockSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div aria-busy="true" className="space-y-2">
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: `${85 + Math.random() * 15}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Enhanced Error States
 * - Contextual error messaging
 * - Retry actions
 * - Fallback content
 */
import { AlertCircle, RefreshCw, Wifi, WifiOff, Clock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  type?: 'network' | 'auth' | 'notfound' | 'ratelimit' | 'generic';
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

const errorConfig = {
  network: {
    icon: WifiOff,
    title: 'Connection Issue',
    message: 'Please check your internet connection and try again.',
    retryLabel: 'Try Again',
  },
  auth: {
    icon: ShieldAlert,
    title: 'Authentication Required',
    message: 'Please sign in to access this content.',
    retryLabel: 'Sign In',
  },
  notfound: {
    icon: AlertCircle,
    title: 'Not Found',
    message: "We couldn't find what you're looking for.",
    retryLabel: 'Go Back',
  },
  ratelimit: {
    icon: Clock,
    title: 'Too Many Requests',
    message: 'Please wait a moment before trying again.',
    retryLabel: 'Try Again',
  },
  generic: {
    icon: AlertCircle,
    title: 'Something Went Wrong',
    message: "We're working on fixing this. Please try again.",
    retryLabel: 'Try Again',
  },
};

export function ErrorState({
  type = 'generic',
  title,
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-4',
        className
      )}
      role="alert"
    >
      <div className="w-12 h-12 mb-4 border border-destructive/30 flex items-center justify-center">
        <Icon className="w-6 h-6 text-destructive" />
      </div>
      <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
        {title || config.title}
      </h2>
      <p className="text-muted-foreground text-[13px] mb-6 max-w-sm">
        {message || config.message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="default"
          size="sm"
          className="gap-2"
        >
          <RefreshCw size={14} />
          {config.retryLabel}
        </Button>
      )}
    </div>
  );
}

// Inline error for forms
export function InlineError({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1.5 text-destructive text-[12px] mt-1" role="alert">
      <AlertCircle size={12} />
      {message}
    </p>
  );
}

// Empty state
export function EmptyState({
  icon: Icon = AlertCircle,
  title,
  message,
  action,
}: {
  icon?: React.ElementType;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-14 h-14 mb-4 border border-border/50 flex items-center justify-center rounded-full">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4 max-w-sm">{message}</p>
      {action}
    </div>
  );
}

// Loading spinner
export function LoadingSpinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div
      className={cn(
        'border-primary/30 border-t-primary rounded-full animate-spin',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

// Success state
export function SuccessState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="w-12 h-12 mb-4 bg-primary/10 border border-primary/30 flex items-center justify-center rounded-full">
        <svg
          className="w-6 h-6 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-[13px] mb-6 max-w-sm">{message}</p>
      {action}
    </div>
  );
}

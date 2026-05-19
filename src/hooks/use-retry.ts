/**
 * useRetry hook - Exponential backoff retry logic for API calls
 * Provides configurable retry with jitter to handle transient failures
 */
import { useState, useCallback } from 'react';

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  jitter?: boolean;
  backoffFactor?: number;
}

interface RetryState {
  attempt: number;
  isRetrying: boolean;
  lastError: Error | null;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  jitter: true,
  backoffFactor: 2,
};

function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const exponentialDelay = options.baseDelay * (options.backoffFactor ** attempt);
  const cappedDelay = Math.min(exponentialDelay, options.maxDelay);
  
  if (options.jitter) {
    const jitterAmount = cappedDelay * 0.1;
    return cappedDelay + (Math.random() * jitterAmount * 2 - jitterAmount);
  }
  
  return cappedDelay;
}

export function useRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): {
  execute: () => Promise<T>;
  state: RetryState;
  reset: () => void;
} {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [state, setState] = useState<RetryState>({
    attempt: 0,
    isRetrying: false,
    lastError: null,
  });

  const execute = useCallback(async (): Promise<T> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
      try {
        setState(prev => ({ ...prev, attempt, isRetrying: attempt > 0 }));
        const result = await fn();
        setState({ attempt: 0, isRetrying: false, lastError: null });
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        
        if (attempt < opts.maxRetries) {
          const delay = calculateDelay(attempt, opts);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    setState({ attempt: 0, isRetrying: false, lastError });
    throw lastError;
  }, [fn, opts]);

  const reset = useCallback(() => {
    setState({ attempt: 0, isRetrying: false, lastError: null });
  }, []);

  return { execute, state, reset };
}

export const exponentialBackoff = (
  attempt: number,
  baseDelay = 1000,
  maxDelay = 30000,
  factor = 2
): number => {
  const delay = baseDelay * (factor ** attempt);
  return Math.min(delay, maxDelay);
};

export const isRetryableError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  
  const retryableCodes = [
    'RATE_LIMIT_EXCEEDED',
    'QUOTA_EXCEEDED',
    'INTERNAL_ERROR',
    'SERVICE_UNAVAILABLE',
    'NETWORK_ERROR',
    'TIMEOUT',
  ];
  
  const retryableMessages = ['timeout', 'network', 'fetch', 'connection', 'rate limit'];
  
  const message = error.message.toLowerCase();
  return retryableCodes.some(code => message.includes(code.toLowerCase())) ||
    retryableMessages.some(msg => message.includes(msg));
};
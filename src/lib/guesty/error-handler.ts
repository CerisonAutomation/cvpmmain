/**
 * Guesty Error Handler
 */

export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ErrorCategory = 'AUTHENTICATION' | 'VALIDATION' | 'AVAILABILITY' | 'PAYMENT' | 'SYSTEM' | 'NETWORK';

export interface GuestyParsedError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  recoverable: boolean;
  retryable: boolean;
  userMessage: string;
  recoveryStrategy?: string;
  context?: Record<string, unknown>;
}

export class GuestyErrorHandler {
  private static instance: GuestyErrorHandler;

  static getInstance(): GuestyErrorHandler {
    if (!GuestyErrorHandler.instance) {
      GuestyErrorHandler.instance = new GuestyErrorHandler();
    }
    return GuestyErrorHandler.instance;
  }

  parseError(error: unknown, context?: Record<string, unknown>): GuestyParsedError {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return this.create('network_error', 'Network request failed', 'MEDIUM', 'NETWORK', true, true,
        'Network connection error. Please check your internet connection.', 'CHECK_CONNECTION', context);
    }

    if (error instanceof Error && error.name === 'AbortError') {
      return this.create('timeout', 'Request timed out', 'MEDIUM', 'NETWORK', true, true,
        'Request timed out. Please try again.', 'RETRY_REQUEST', context);
    }

    if (this.isApiError(error)) {
      return this.parseApiError(error, context);
    }

    if (error instanceof Error) {
      return this.create('internal_error', error.message, 'HIGH', 'SYSTEM', true, true,
        error.message, 'RETRY_REQUEST', context);
    }

    return this.create('internal_error', 'An unexpected error occurred', 'HIGH', 'SYSTEM', true, true,
      'An error occurred. Please try again.', 'RETRY_REQUEST', context);
  }

  private isApiError(error: unknown): error is { status: number; message?: string; error?: string } {
    return typeof error === 'object' && error !== null && 'status' in error && typeof (error as Record<string, unknown>).status === 'number';
  }

  private parseApiError(error: { status: number; message?: string; error?: string }, context?: Record<string, unknown>): GuestyParsedError {
    const msg = error.message || error.error || 'API error';
    const endpoint = context?.endpoint;

    switch (error.status) {
      case 401: return this.create('invalid_client', msg, 'CRITICAL', 'AUTHENTICATION', false, false, 'Authentication failed.', 'CHECK_CREDENTIALS', context);
      case 403: return this.create('unauthorized', msg, 'CRITICAL', 'AUTHENTICATION', false, false, 'Access denied.', 'CHECK_PERMISSIONS', context);
      case 404: return this.create('not_found', msg, 'MEDIUM', 'VALIDATION', false, false,
        typeof endpoint === 'string' && endpoint.includes('listing') ? 'Property not found.' : 'Resource not found.', 'REFRESH_DATA', context);
      case 409: return this.create('booking_conflict', msg, 'MEDIUM', 'AVAILABILITY', true, true, 'Booking conflict. Please try again.', 'REFRESH_DATA', context);
      case 429: return this.create('rate_limit', msg, 'MEDIUM', 'SYSTEM', true, true, 'Too many requests. Please wait.', 'WAIT_AND_RETRY', context);
      default:
        if (error.status >= 500) return this.create('service_unavailable', msg, 'HIGH', 'SYSTEM', true, true, 'Service temporarily unavailable.', 'WAIT_AND_RETRY', context);
        return this.create('internal_error', msg, 'HIGH', 'SYSTEM', true, true, msg, 'RETRY_REQUEST', context);
    }
  }

  private create(code: string, message: string, severity: ErrorSeverity, category: ErrorCategory,
    recoverable: boolean, retryable: boolean, userMessage: string, recoveryStrategy?: string,
    context?: Record<string, unknown>): GuestyParsedError {
    return { code, message, severity, category, recoverable, retryable, userMessage, recoveryStrategy, context };
  }

  getRetryConfig(error: GuestyParsedError): { maxRetries: number; baseDelay: number; maxDelay: number } | null {
    if (!error.retryable) return null;
    if (error.code === 'rate_limit') return { maxRetries: 3, baseDelay: 5000, maxDelay: 30000 };
    return { maxRetries: 3, baseDelay: 1000, maxDelay: 10000 };
  }

  logError(error: GuestyParsedError, context?: Record<string, unknown>) {
    const level = error.severity === 'CRITICAL' || error.severity === 'HIGH' ? 'error' : 'warn';
    console[level](`[Guesty ${error.category}] ${error.code}: ${error.message}`, context);
  }
}

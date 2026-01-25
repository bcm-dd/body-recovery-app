/**
 * Secure Error Handling Utilities
 *
 * Provides secure error handling that:
 * - Never exposes stack traces in production
 * - Sanitizes error messages for users
 * - Logs security events separately
 * - Provides consistent error responses
 */

// =============================================================================
// Types
// =============================================================================

export interface SafeError {
  /** User-friendly error message */
  message: string;
  /** Error code for programmatic handling */
  code: string;
  /** HTTP status code if applicable */
  statusCode?: number;
  /** Request ID for support tickets */
  requestId?: string;
  /** Whether this is a client error (4xx) vs server error (5xx) */
  isClientError: boolean;
  /** Timestamp of error */
  timestamp: string;
}

export interface ErrorLogEntry {
  /** Error code */
  code: string;
  /** Original error message (not shown to users) */
  originalMessage: string;
  /** Stack trace (production: redacted) */
  stack?: string;
  /** Request context */
  context?: ErrorContext;
  /** Timestamp */
  timestamp: string;
  /** Severity level */
  severity: ErrorSeverity;
  /** Whether this is a security event */
  isSecurityEvent: boolean;
}

export interface ErrorContext {
  /** Request URL */
  url?: string;
  /** Request method */
  method?: string;
  /** User ID if authenticated */
  userId?: string;
  /** Request ID */
  requestId?: string;
  /** User agent */
  userAgent?: string;
  /** IP address (for server-side) */
  ip?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type SecurityEventType =
  | 'AUTH_FAILURE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_TOKEN'
  | 'SUSPICIOUS_INPUT'
  | 'CSRF_MISMATCH'
  | 'PERMISSION_DENIED'
  | 'DATA_TAMPERING'
  | 'BRUTE_FORCE_DETECTED';

// =============================================================================
// Constants
// =============================================================================

const isProduction = typeof process !== 'undefined'
  ? process.env.NODE_ENV === 'production'
  : true; // Default to production safety

/**
 * User-friendly error messages by code
 * Never expose internal details to users
 */
const USER_FRIENDLY_MESSAGES: Record<string, string> = {
  // Authentication errors
  AUTH_FAILED: 'Authentication failed. Please check your credentials.',
  AUTH_EXPIRED: 'Your session has expired. Please log in again.',
  AUTH_REQUIRED: 'Please log in to continue.',
  INVALID_TOKEN: 'Your session is invalid. Please log in again.',

  // Authorization errors
  FORBIDDEN: 'You do not have permission to perform this action.',
  RESOURCE_NOT_FOUND: 'The requested resource was not found.',

  // Rate limiting
  RATE_LIMITED: 'Too many requests. Please try again later.',
  QUOTA_EXCEEDED: 'You have exceeded your quota. Please try again later.',

  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again.',
  INVALID_INPUT: 'The provided input is invalid.',
  MISSING_FIELD: 'Required information is missing.',

  // Server errors
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again later.',
  SERVICE_UNAVAILABLE: 'The service is temporarily unavailable. Please try again later.',
  TIMEOUT: 'The request timed out. Please try again.',

  // Network errors
  NETWORK_ERROR: 'A network error occurred. Please check your connection.',
  CONNECTION_FAILED: 'Unable to connect to the server. Please try again.',

  // Generic fallback
  UNKNOWN: 'An error occurred. Please try again.',
};

// =============================================================================
// Safe Error Handler
// =============================================================================

/**
 * Converts any error into a safe, user-friendly error object
 *
 * SECURITY: Never expose internal error details, stack traces,
 * or sensitive information to users in production
 */
export function toSafeError(
  error: unknown,
  context?: Partial<ErrorContext>
): SafeError {
  const timestamp = new Date().toISOString();
  const requestId = context?.requestId || generateRequestId();

  // Handle known error types
  if (error instanceof AppError) {
    return {
      message: getUserFriendlyMessage(error.code),
      code: error.code,
      statusCode: error.statusCode,
      requestId,
      isClientError: error.statusCode ? error.statusCode < 500 : false,
      timestamp,
    };
  }

  // Handle native errors
  if (error instanceof Error) {
    // Log the original error for debugging
    logError(error, 'INTERNAL_ERROR', context, 'high', false);

    return {
      message: getUserFriendlyMessage('INTERNAL_ERROR'),
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      requestId,
      isClientError: false,
      timestamp,
    };
  }

  // Handle unknown error types
  return {
    message: getUserFriendlyMessage('UNKNOWN'),
    code: 'UNKNOWN',
    statusCode: 500,
    requestId,
    isClientError: false,
    timestamp,
  };
}

/**
 * Gets user-friendly message for error code
 */
export function getUserFriendlyMessage(code: string): string {
  return USER_FRIENDLY_MESSAGES[code] || USER_FRIENDLY_MESSAGES.UNKNOWN;
}

// =============================================================================
// Application Error Class
// =============================================================================

/**
 * Custom application error with code and status
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: ErrorContext;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    context?: ErrorContext
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true; // Indicates expected error vs bug
    this.context = context;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Creates common error types
 */
export const Errors = {
  badRequest: (message: string, code = 'VALIDATION_ERROR') =>
    new AppError(message, code, 400),

  unauthorized: (message = 'Authentication required', code = 'AUTH_REQUIRED') =>
    new AppError(message, code, 401),

  forbidden: (message = 'Access denied', code = 'FORBIDDEN') =>
    new AppError(message, code, 403),

  notFound: (message = 'Resource not found', code = 'RESOURCE_NOT_FOUND') =>
    new AppError(message, code, 404),

  rateLimited: (message = 'Rate limit exceeded', code = 'RATE_LIMITED') =>
    new AppError(message, code, 429),

  internal: (message = 'Internal server error', code = 'INTERNAL_ERROR') =>
    new AppError(message, code, 500),

  serviceUnavailable: (message = 'Service unavailable', code = 'SERVICE_UNAVAILABLE') =>
    new AppError(message, code, 503),
} as const;

// =============================================================================
// Error Logging
// =============================================================================

const errorLog: ErrorLogEntry[] = [];
const securityLog: ErrorLogEntry[] = [];
const MAX_LOG_SIZE = 1000;

/**
 * Logs an error for debugging/monitoring
 *
 * SECURITY: In production, stack traces are not stored
 */
export function logError(
  error: Error | unknown,
  code: string,
  context?: Partial<ErrorContext>,
  severity: ErrorSeverity = 'medium',
  isSecurityEvent: boolean = false
): void {
  const entry: ErrorLogEntry = {
    code,
    originalMessage: error instanceof Error ? error.message : String(error),
    stack: isProduction ? undefined : (error instanceof Error ? error.stack : undefined),
    context: context as ErrorContext,
    timestamp: new Date().toISOString(),
    severity,
    isSecurityEvent,
  };

  // Add to appropriate log
  if (isSecurityEvent) {
    securityLog.push(entry);
    if (securityLog.length > MAX_LOG_SIZE) {
      securityLog.shift();
    }
  }

  errorLog.push(entry);
  if (errorLog.length > MAX_LOG_SIZE) {
    errorLog.shift();
  }

  // Console output (in production, use proper logging service)
  if (isSecurityEvent) {
    console.warn('[SECURITY]', sanitizeLogMessage(entry));
  } else if (severity === 'critical' || severity === 'high') {
    console.error('[ERROR]', sanitizeLogMessage(entry));
  } else if (!isProduction) {
    console.warn('[WARN]', entry);
  }
}

/**
 * Logs a security event
 */
export function logSecurityEvent(
  type: SecurityEventType,
  details: string,
  context?: Partial<ErrorContext>,
  severity: ErrorSeverity = 'high'
): void {
  logError(
    new Error(details),
    type,
    context,
    severity,
    true
  );
}

/**
 * Sanitizes log message for production output
 */
function sanitizeLogMessage(entry: ErrorLogEntry): Partial<ErrorLogEntry> {
  if (isProduction) {
    return {
      code: entry.code,
      timestamp: entry.timestamp,
      severity: entry.severity,
      isSecurityEvent: entry.isSecurityEvent,
      // Redact potentially sensitive info
      context: entry.context ? {
        url: entry.context.url,
        method: entry.context.method,
        requestId: entry.context.requestId,
        // Don't log userId, IP, userAgent in detail
      } : undefined,
    };
  }
  return entry;
}

// =============================================================================
// Error Boundary Helpers
// =============================================================================

/**
 * Wraps an async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: Partial<ErrorContext>
): Promise<{ data: T; error: null } | { data: null; error: SafeError }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: toSafeError(error, context) };
  }
}

/**
 * Creates an error boundary wrapper for sync functions
 */
export function withSyncErrorHandling<T>(
  fn: () => T,
  context?: Partial<ErrorContext>
): { data: T; error: null } | { data: null; error: SafeError } {
  try {
    const data = fn();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: toSafeError(error, context) };
  }
}

// =============================================================================
// Request ID Generation
// =============================================================================

/**
 * Generates a unique request ID for error tracking
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

// =============================================================================
// Error Reporting
// =============================================================================

export interface ErrorReporter {
  report(error: SafeError, context?: ErrorContext): void;
}

let errorReporter: ErrorReporter | null = null;

/**
 * Sets the error reporter (e.g., Sentry, LogRocket)
 */
export function setErrorReporter(reporter: ErrorReporter): void {
  errorReporter = reporter;
}

/**
 * Reports an error to the configured reporter
 */
export function reportError(error: SafeError, context?: ErrorContext): void {
  errorReporter?.report(error, context);
}

// =============================================================================
// React Error Boundary Props (for future use)
// =============================================================================

export interface ErrorBoundaryProps {
  /** Fallback UI to show on error */
  fallback?: React.ReactNode;
  /** Callback when error occurs */
  onError?: (error: SafeError) => void;
  /** Whether to reset on navigation */
  resetOnNavigation?: boolean;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Determines if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('offline')
    );
  }
  return false;
}

/**
 * Determines if error is a timeout
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('timeout') || message.includes('timed out');
  }
  return false;
}

/**
 * Determines if error should trigger retry
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return [500, 502, 503, 504, 429].includes(error.statusCode);
  }
  return isNetworkError(error) || isTimeoutError(error);
}

/**
 * Extracts status code from error if available
 */
export function getErrorStatusCode(error: unknown): number | undefined {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    if (typeof errorObj.status === 'number') return errorObj.status;
    if (typeof errorObj.statusCode === 'number') return errorObj.statusCode;
  }

  return undefined;
}

// =============================================================================
// Global Error Handler
// =============================================================================

/**
 * Sets up global error handlers
 * Call this once during app initialization
 */
export function setupGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  // Handle uncaught errors
  window.onerror = (message, source, lineno, colno, error) => {
    logError(
      error || new Error(String(message)),
      'UNCAUGHT_ERROR',
      {
        metadata: {
          source,
          lineno,
          colno,
        },
      },
      'critical'
    );

    // Don't show default error dialog in production
    return isProduction;
  };

  // Handle unhandled promise rejections
  window.onunhandledrejection = (event) => {
    logError(
      event.reason,
      'UNHANDLED_REJECTION',
      undefined,
      'critical'
    );
  };
}

// =============================================================================
// Debug Utilities (Development Only)
// =============================================================================

/**
 * Gets recent errors (development only)
 */
export function getRecentErrors(): ErrorLogEntry[] {
  if (isProduction) {
    return [];
  }
  return [...errorLog].reverse().slice(0, 50);
}

/**
 * Gets security events (development only)
 */
export function getSecurityEvents(): ErrorLogEntry[] {
  if (isProduction) {
    return [];
  }
  return [...securityLog].reverse().slice(0, 50);
}

/**
 * Clears error logs (development only)
 */
export function clearErrorLogs(): void {
  if (!isProduction) {
    errorLog.length = 0;
    securityLog.length = 0;
  }
}

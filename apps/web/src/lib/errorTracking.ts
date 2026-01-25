/**
 * Error Tracking Library with Rate Limiting
 *
 * A privacy-respecting error tracking system that:
 * - Rate limits error submissions to prevent flooding
 * - Deduplicates similar errors
 * - Provides error grouping and fingerprinting
 * - Enriches error context without PII
 * - Integrates with error-monitoring.ts
 *
 * @module errorTracking
 */

import {
  errorMonitoring,
  captureError as baseCaptureError,
  captureMessage as baseCaptureMessage,
  addBreadcrumb,
  type ErrorContext,
  type BreadcrumbLevel,
  type ErrorReport,
} from './error-monitoring';

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

export interface RateLimitConfig {
  /** Maximum errors per window */
  maxErrors: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum unique error fingerprints to track */
  maxFingerprints: number;
  /** Time to wait before retrying after rate limit (ms) */
  backoffMs: number;
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxErrors: 10,       // 10 errors
  windowMs: 60000,     // per minute
  maxFingerprints: 100, // track up to 100 unique errors
  backoffMs: 30000,    // 30 second backoff
};

// ============================================================================
// Error Fingerprinting
// ============================================================================

interface ErrorFingerprint {
  fingerprint: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  sampleError?: ErrorReport;
}

interface RateLimitState {
  errors: { timestamp: number; fingerprint: string }[];
  fingerprints: Map<string, ErrorFingerprint>;
  isRateLimited: boolean;
  rateLimitedUntil: number;
  droppedCount: number;
}

// ============================================================================
// Error Tracker Class
// ============================================================================

class ErrorTracker {
  private config: RateLimitConfig;
  private state: RateLimitState;
  private initialized = false;

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = { ...DEFAULT_RATE_LIMIT, ...config };
    this.state = {
      errors: [],
      fingerprints: new Map(),
      isRateLimited: false,
      rateLimitedUntil: 0,
      droppedCount: 0,
    };
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  init(config?: Partial<RateLimitConfig>): void {
    if (this.initialized) return;

    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Start cleanup interval
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), this.config.windowMs);
    }

    this.initialized = true;
  }

  // ============================================================================
  // Error Fingerprinting
  // ============================================================================

  /**
   * Generate a fingerprint for error deduplication
   */
  private generateFingerprint(error: Error, context?: Partial<ErrorContext>): string {
    const components = [
      error.name,
      error.message.replace(/\d+/g, 'N'), // Normalize numbers
      context?.route || 'unknown',
    ];

    // Add first line of stack trace (most relevant)
    if (error.stack) {
      const firstStackLine = error.stack.split('\n')[1]?.trim() || '';
      // Normalize the stack line
      const normalizedLine = firstStackLine
        .replace(/:\d+:\d+/g, ':N:N') // Normalize line/column numbers
        .replace(/[a-f0-9]{8,}/gi, 'HASH'); // Normalize hashes
      components.push(normalizedLine);
    }

    // Create a simple hash
    const str = components.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `err_${Math.abs(hash).toString(36)}`;
  }

  // ============================================================================
  // Rate Limiting
  // ============================================================================

  /**
   * Check if we're currently rate limited
   */
  private isRateLimited(): boolean {
    const now = Date.now();

    // Check if backoff period has passed
    if (this.state.isRateLimited) {
      if (now >= this.state.rateLimitedUntil) {
        this.state.isRateLimited = false;
        this.state.droppedCount = 0;
        addBreadcrumb({
          type: 'info',
          category: 'error_tracking',
          message: 'Rate limit lifted',
          level: 'info',
        });
      } else {
        return true;
      }
    }

    // Clean old errors from window
    const windowStart = now - this.config.windowMs;
    this.state.errors = this.state.errors.filter((e) => e.timestamp >= windowStart);

    // Check if over limit
    if (this.state.errors.length >= this.config.maxErrors) {
      this.state.isRateLimited = true;
      this.state.rateLimitedUntil = now + this.config.backoffMs;

      addBreadcrumb({
        type: 'info',
        category: 'error_tracking',
        message: `Rate limit triggered: ${this.state.errors.length} errors in window`,
        level: 'warning',
      });

      return true;
    }

    return false;
  }

  /**
   * Record an error occurrence
   */
  private recordError(fingerprint: string): void {
    const now = Date.now();

    this.state.errors.push({ timestamp: now, fingerprint });

    // Update fingerprint tracking
    const existing = this.state.fingerprints.get(fingerprint);
    if (existing) {
      existing.count++;
      existing.lastSeen = now;
    } else {
      // Trim fingerprints if at max
      if (this.state.fingerprints.size >= this.config.maxFingerprints) {
        // Remove oldest fingerprint
        let oldest: { key: string; time: number } | null = null;
        for (const [key, fp] of this.state.fingerprints) {
          if (!oldest || fp.lastSeen < oldest.time) {
            oldest = { key, time: fp.lastSeen };
          }
        }
        if (oldest) {
          this.state.fingerprints.delete(oldest.key);
        }
      }

      this.state.fingerprints.set(fingerprint, {
        fingerprint,
        count: 1,
        firstSeen: now,
        lastSeen: now,
      });
    }
  }

  // ============================================================================
  // Error Capture
  // ============================================================================

  /**
   * Capture an error with rate limiting and deduplication
   */
  captureError(
    error: Error,
    extra?: Record<string, unknown>,
    options?: {
      /** Force capture even if rate limited */
      force?: boolean;
      /** Custom fingerprint */
      fingerprint?: string;
      /** Error level */
      level?: 'error' | 'warning' | 'info';
    }
  ): string | null {
    // Generate fingerprint
    const fingerprint = options?.fingerprint || this.generateFingerprint(error, extra);

    // Check rate limit (unless forced)
    if (!options?.force && this.isRateLimited()) {
      this.state.droppedCount++;

      // Log dropped error in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('[ErrorTracking] Dropped due to rate limit:', error.message);
      }

      return null;
    }

    // Record error occurrence
    this.recordError(fingerprint);

    // Check if this is a duplicate
    const fingerprintData = this.state.fingerprints.get(fingerprint);
    const isDuplicate = fingerprintData && fingerprintData.count > 1;

    // Enrich context
    const enrichedExtra = {
      ...extra,
      fingerprint,
      occurrenceCount: fingerprintData?.count || 1,
      firstSeen: fingerprintData?.firstSeen ? new Date(fingerprintData.firstSeen).toISOString() : undefined,
      isDuplicate,
      droppedErrors: this.state.droppedCount,
    };

    // Capture with base error monitoring
    const errorId = baseCaptureError(error, enrichedExtra);

    return errorId;
  }

  /**
   * Capture a message with rate limiting
   */
  captureMessage(
    message: string,
    level: BreadcrumbLevel = 'info',
    extra?: Record<string, unknown>
  ): void {
    // Simple rate limit check for messages
    if (level !== 'error' && this.isRateLimited()) {
      return;
    }

    baseCaptureMessage(message, level, extra);
  }

  /**
   * Capture an error from async operations
   */
  async captureAsync<T>(
    operation: () => Promise<T>,
    context?: {
      operationName?: string;
      extra?: Record<string, unknown>;
    }
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Error) {
        this.captureError(error, {
          operation: context?.operationName,
          ...context?.extra,
        });
      }
      throw error;
    }
  }

  // ============================================================================
  // Error Aggregation
  // ============================================================================

  /**
   * Get aggregated error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    uniqueErrors: number;
    droppedErrors: number;
    isRateLimited: boolean;
    topErrors: Array<{
      fingerprint: string;
      count: number;
      firstSeen: Date;
      lastSeen: Date;
    }>;
  } {
    const topErrors = Array.from(this.state.fingerprints.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((fp) => ({
        fingerprint: fp.fingerprint,
        count: fp.count,
        firstSeen: new Date(fp.firstSeen),
        lastSeen: new Date(fp.lastSeen),
      }));

    return {
      totalErrors: this.state.errors.length,
      uniqueErrors: this.state.fingerprints.size,
      droppedErrors: this.state.droppedCount,
      isRateLimited: this.state.isRateLimited,
      topErrors,
    };
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  /**
   * Clean up old data
   */
  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Clean old errors
    this.state.errors = this.state.errors.filter((e) => e.timestamp >= windowStart);

    // Clean old fingerprints (keep for 24 hours)
    const dayAgo = now - 24 * 60 * 60 * 1000;
    for (const [key, fp] of this.state.fingerprints) {
      if (fp.lastSeen < dayAgo) {
        this.state.fingerprints.delete(key);
      }
    }
  }

  /**
   * Reset all tracking state
   */
  reset(): void {
    this.state = {
      errors: [],
      fingerprints: new Map(),
      isRateLimited: false,
      rateLimitedUntil: 0,
      droppedCount: 0,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): RateLimitConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const errorTracker = new ErrorTracker();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Capture an error with rate limiting
 */
export function captureError(
  error: Error,
  extra?: Record<string, unknown>,
  options?: {
    force?: boolean;
    fingerprint?: string;
    level?: 'error' | 'warning' | 'info';
  }
): string | null {
  return errorTracker.captureError(error, extra, options);
}

/**
 * Capture a message with rate limiting
 */
export function captureMessage(
  message: string,
  level: BreadcrumbLevel = 'info',
  extra?: Record<string, unknown>
): void {
  errorTracker.captureMessage(message, level, extra);
}

/**
 * Wrap an async function with error capture
 */
export async function captureAsync<T>(
  operation: () => Promise<T>,
  context?: {
    operationName?: string;
    extra?: Record<string, unknown>;
  }
): Promise<T> {
  return errorTracker.captureAsync(operation, context);
}

/**
 * Get error statistics
 */
export function getErrorStats() {
  return errorTracker.getErrorStats();
}

// ============================================================================
// Error Boundary Helper with Rate Limiting
// ============================================================================

/**
 * Create an error boundary handler with rate limiting
 */
export function createRateLimitedErrorBoundaryHandler() {
  return {
    onError: (error: Error, info: { componentStack?: string }) => {
      return errorTracker.captureError(error, {
        componentStack: info.componentStack,
        type: 'react_error_boundary',
      });
    },
    onReset: () => {
      addBreadcrumb({
        type: 'user',
        category: 'error_boundary',
        message: 'Error boundary reset by user',
        level: 'info',
      });
    },
    getStats: () => errorTracker.getErrorStats(),
  };
}

// ============================================================================
// Network Error Helpers
// ============================================================================

/**
 * Capture fetch errors with context
 */
export function captureFetchError(
  error: Error,
  request: {
    url: string;
    method: string;
    status?: number;
  }
): string | null {
  return errorTracker.captureError(error, {
    type: 'fetch_error',
    url: sanitizeUrl(request.url),
    method: request.method,
    status: request.status,
  });
}

/**
 * Sanitize URL to remove sensitive data
 */
function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove sensitive query params
    const sensitiveParams = ['token', 'key', 'secret', 'password', 'auth'];
    for (const param of sensitiveParams) {
      if (parsed.searchParams.has(param)) {
        parsed.searchParams.set(param, '[REDACTED]');
      }
    }
    // Remove path segments that look like IDs
    parsed.pathname = parsed.pathname.replace(
      /\/[a-f0-9]{8,}(-[a-f0-9]+)*/gi,
      '/[ID]'
    );
    return parsed.toString();
  } catch {
    // If URL parsing fails, return sanitized version
    return url.replace(/[?&](token|key|secret|password|auth)=[^&]*/gi, '$1=[REDACTED]');
  }
}

// ============================================================================
// Re-exports from error-monitoring
// ============================================================================

export {
  errorMonitoring,
  addBreadcrumb,
  type ErrorContext,
  type BreadcrumbLevel,
  type ErrorReport,
} from './error-monitoring';

// ============================================================================
// Initialize on import
// ============================================================================

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  errorTracker.init();
}

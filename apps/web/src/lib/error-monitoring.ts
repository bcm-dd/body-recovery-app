/**
 * Error Monitoring Library
 *
 * A privacy-respecting error monitoring system that:
 * - Captures unhandled errors and promise rejections
 * - Maintains breadcrumb trail for debugging
 * - Integrates with React Error Boundaries
 * - Console-only mode for MVP (ready for Sentry integration)
 */

import { analytics, AnalyticsEvents } from './analytics';

// ============================================================================
// Types
// ============================================================================

export interface ErrorContext {
  userId?: string;
  route?: string;
  componentStack?: string;
  userAgent?: string;
  timestamp: number;
  sessionId?: string;
  appVersion?: string;
  environment?: string;
  [key: string]: unknown;
}

export interface Breadcrumb {
  type: BreadcrumbType;
  category: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: number;
  level: BreadcrumbLevel;
}

export type BreadcrumbType =
  | 'navigation'
  | 'http'
  | 'user'
  | 'ui'
  | 'error'
  | 'info'
  | 'debug';

export type BreadcrumbLevel = 'debug' | 'info' | 'warning' | 'error';

export interface ErrorReport {
  id: string;
  name: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  breadcrumbs: Breadcrumb[];
  tags: Record<string, string>;
  extra: Record<string, unknown>;
}

export interface ErrorMonitoringConfig {
  enabled: boolean;
  debug: boolean;
  maxBreadcrumbs: number;
  captureUnhandledErrors: boolean;
  captureUnhandledRejections: boolean;
  beforeSend?: (report: ErrorReport) => ErrorReport | null;
}

export interface ErrorMonitoringProvider {
  name: string;
  init: (config: ErrorMonitoringConfig) => void;
  captureError: (error: Error, context?: Partial<ErrorContext>) => string;
  captureMessage: (message: string, level: BreadcrumbLevel, context?: Partial<ErrorContext>) => void;
  setContext: (context: Partial<ErrorContext>) => void;
  addBreadcrumb: (breadcrumb: Omit<Breadcrumb, 'timestamp'>) => void;
  flush: () => Promise<void>;
}

// ============================================================================
// Console Provider (Default for MVP)
// ============================================================================

const consoleProvider: ErrorMonitoringProvider = {
  name: 'console',

  init: (config) => {
    if (config.debug) {
      console.log('[ErrorMonitoring] Initialized with config:', config);
    }
  },

  captureError: (error, context) => {
    const errorId = generateErrorId();
    console.error('[ErrorMonitoring] Error captured:', {
      id: errorId,
      error: error.message,
      stack: error.stack,
      context,
    });
    return errorId;
  },

  captureMessage: (message, level, context) => {
    const logMethod = level === 'error' ? console.error :
                      level === 'warning' ? console.warn :
                      level === 'debug' ? console.debug : console.info;
    logMethod('[ErrorMonitoring] Message:', message, context);
  },

  setContext: (context) => {
    console.log('[ErrorMonitoring] Context updated:', context);
  },

  addBreadcrumb: (breadcrumb) => {
    console.log('[ErrorMonitoring] Breadcrumb:', breadcrumb);
  },

  flush: async () => {
    console.log('[ErrorMonitoring] Flushed');
  },
};

// ============================================================================
// Error ID Generator
// ============================================================================

function generateErrorId(): string {
  return `err_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// Error Monitoring Class
// ============================================================================

class ErrorMonitoring {
  private config: ErrorMonitoringConfig = {
    enabled: true,
    debug: process.env.NODE_ENV === 'development',
    maxBreadcrumbs: 50,
    captureUnhandledErrors: true,
    captureUnhandledRejections: true,
  };

  private provider: ErrorMonitoringProvider = consoleProvider;
  private context: ErrorContext = {
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
  };
  private breadcrumbs: Breadcrumb[] = [];
  private initialized = false;
  private tags: Record<string, string> = {};

  // ============================================================================
  // Initialization
  // ============================================================================

  init(config?: Partial<ErrorMonitoringConfig>, provider?: ErrorMonitoringProvider): void {
    if (this.initialized) return;

    if (config) {
      this.config = { ...this.config, ...config };
    }

    if (provider) {
      this.provider = provider;
    }

    // Initialize provider
    this.provider.init(this.config);

    // Set up global error handlers
    if (typeof window !== 'undefined') {
      if (this.config.captureUnhandledErrors) {
        this.setupErrorHandler();
      }

      if (this.config.captureUnhandledRejections) {
        this.setupRejectionHandler();
      }

      // Capture browser context
      this.context.userAgent = navigator.userAgent;
    }

    this.initialized = true;

    if (this.config.debug) {
      console.log('[ErrorMonitoring] Initialized:', {
        enabled: this.config.enabled,
        provider: this.provider.name,
      });
    }
  }

  private setupErrorHandler(): void {
    const originalHandler = window.onerror;

    window.onerror = (message, source, lineno, colno, error) => {
      if (error) {
        this.captureError(error, {
          source,
          lineno,
          colno,
        });
      } else {
        this.captureMessage(String(message), 'error', {
          source,
          lineno,
          colno,
        });
      }

      if (originalHandler) {
        return originalHandler.call(window, message, source, lineno, colno, error);
      }

      return false;
    };
  }

  private setupRejectionHandler(): void {
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));

      this.captureError(error, { type: 'unhandledRejection' });
    });
  }

  // ============================================================================
  // Configuration
  // ============================================================================

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  // ============================================================================
  // Context Management
  // ============================================================================

  setContext(context: Partial<ErrorContext>): void {
    this.context = { ...this.context, ...context, timestamp: Date.now() };
    this.provider.setContext(context);
  }

  setUser(userId?: string): void {
    this.context.userId = userId;
    this.provider.setContext({ userId });
  }

  setRoute(route: string): void {
    this.context.route = route;
    this.addBreadcrumb({
      type: 'navigation',
      category: 'navigation',
      message: `Navigated to ${route}`,
      level: 'info',
    });
  }

  setTag(key: string, value: string): void {
    this.tags[key] = value;
  }

  setTags(tags: Record<string, string>): void {
    this.tags = { ...this.tags, ...tags };
  }

  // ============================================================================
  // Breadcrumbs
  // ============================================================================

  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    const crumb: Breadcrumb = {
      ...breadcrumb,
      timestamp: Date.now(),
    };

    this.breadcrumbs.push(crumb);

    // Trim to max breadcrumbs
    if (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.config.maxBreadcrumbs);
    }

    this.provider.addBreadcrumb(breadcrumb);
  }

  clearBreadcrumbs(): void {
    this.breadcrumbs = [];
  }

  // ============================================================================
  // Error Capture
  // ============================================================================

  captureError(error: Error, extra?: Record<string, unknown>): string {
    if (!this.config.enabled) return '';

    const errorId = generateErrorId();
    const report = this.buildErrorReport(errorId, error, extra);

    // Apply beforeSend hook
    const processedReport = this.config.beforeSend
      ? this.config.beforeSend(report)
      : report;

    if (!processedReport) return '';

    // Capture via provider
    this.provider.captureError(error, { ...this.context, ...extra });

    // Also track in analytics
    analytics.trackEvent(AnalyticsEvents.ERROR_OCCURRED, {
      errorId,
      errorName: error.name,
      errorMessage: this.sanitizeErrorMessage(error.message),
      route: this.context.route,
    });

    return errorId;
  }

  captureMessage(message: string, level: BreadcrumbLevel = 'info', extra?: Record<string, unknown>): void {
    if (!this.config.enabled) return;

    this.provider.captureMessage(message, level, { ...this.context, ...extra });
  }

  // ============================================================================
  // Error Boundary Integration
  // ============================================================================

  captureErrorBoundary(
    error: Error,
    errorInfo: { componentStack?: string }
  ): string {
    const errorId = this.captureError(error, {
      componentStack: errorInfo.componentStack,
      type: 'react_error_boundary',
    });

    // Track in analytics
    analytics.trackEvent(AnalyticsEvents.ERROR_BOUNDARY_TRIGGERED, {
      errorId,
      errorName: error.name,
      route: this.context.route,
    });

    return errorId;
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private buildErrorReport(
    id: string,
    error: Error,
    extra?: Record<string, unknown>
  ): ErrorReport {
    return {
      id,
      name: error.name,
      message: this.sanitizeErrorMessage(error.message),
      stack: this.sanitizeStack(error.stack),
      context: { ...this.context, timestamp: Date.now() },
      breadcrumbs: [...this.breadcrumbs],
      tags: { ...this.tags },
      extra: extra || {},
    };
  }

  private sanitizeErrorMessage(message: string): string {
    // Remove potential PII from error messages
    return message
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
      .replace(/\b\d{16,19}\b/g, '[CARD]');
  }

  private sanitizeStack(stack?: string): string | undefined {
    if (!stack) return undefined;

    // Remove file paths that might contain usernames
    return stack.replace(/\/Users\/[^/]+\//g, '/Users/[USER]/');
  }

  async flush(): Promise<void> {
    await this.provider.flush();
  }

  getConfig(): ErrorMonitoringConfig {
    return { ...this.config };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const errorMonitoring = new ErrorMonitoring();

// ============================================================================
// Convenience Functions
// ============================================================================

export function captureError(error: Error, extra?: Record<string, unknown>): string {
  return errorMonitoring.captureError(error, extra);
}

export function captureMessage(
  message: string,
  level: BreadcrumbLevel = 'info',
  extra?: Record<string, unknown>
): void {
  errorMonitoring.captureMessage(message, level, extra);
}

export function addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
  errorMonitoring.addBreadcrumb(breadcrumb);
}

export function setErrorContext(context: Partial<ErrorContext>): void {
  errorMonitoring.setContext(context);
}

export function setErrorUser(userId?: string): void {
  errorMonitoring.setUser(userId);
}

export function setErrorRoute(route: string): void {
  errorMonitoring.setRoute(route);
}

// ============================================================================
// React Error Boundary Helper
// ============================================================================

export function createErrorBoundaryHandler() {
  return {
    onError: (error: Error, info: { componentStack?: string }) => {
      return errorMonitoring.captureErrorBoundary(error, info);
    },
    onReset: () => {
      errorMonitoring.addBreadcrumb({
        type: 'user',
        category: 'error_boundary',
        message: 'Error boundary reset',
        level: 'info',
      });
    },
  };
}

// ============================================================================
// Performance Breadcrumb Helpers
// ============================================================================

export function addHttpBreadcrumb(
  method: string,
  url: string,
  statusCode?: number,
  duration?: number
): void {
  errorMonitoring.addBreadcrumb({
    type: 'http',
    category: 'http',
    message: `${method} ${url}`,
    level: statusCode && statusCode >= 400 ? 'error' : 'info',
    data: { method, url, statusCode, duration },
  });
}

export function addUIBreadcrumb(
  action: string,
  element: string,
  data?: Record<string, unknown>
): void {
  errorMonitoring.addBreadcrumb({
    type: 'ui',
    category: 'ui.click',
    message: `${action} on ${element}`,
    level: 'info',
    data,
  });
}

export function addUserBreadcrumb(
  action: string,
  data?: Record<string, unknown>
): void {
  errorMonitoring.addBreadcrumb({
    type: 'user',
    category: 'user',
    message: action,
    level: 'info',
    data,
  });
}

// ============================================================================
// Wrap Function for Error Capture
// ============================================================================

export function wrapWithErrorCapture<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context?: Record<string, unknown>
): T {
  return ((...args: unknown[]) => {
    try {
      const result = fn(...args);

      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error: Error) => {
          captureError(error, context);
          throw error;
        });
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        captureError(error, context);
      }
      throw error;
    }
  }) as T;
}

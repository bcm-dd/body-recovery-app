/**
 * Rate Limiting Utilities
 *
 * Provides client-side rate limiting, request throttling, and
 * exponential backoff for API calls. Ready for future API integration.
 */

// =============================================================================
// Types
// =============================================================================

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Identifier for the rate limit (e.g., endpoint name) */
  key?: string;
}

export interface ThrottleConfig {
  /** Minimum time between requests in milliseconds */
  minInterval: number;
  /** Whether to queue requests that come in too fast */
  queue?: boolean;
  /** Maximum queue size (only if queue is true) */
  maxQueueSize?: number;
}

export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Initial delay in milliseconds */
  initialDelay: number;
  /** Maximum delay in milliseconds */
  maxDelay: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier?: number;
  /** Jitter factor (0-1) to randomize delay */
  jitter?: number;
  /** Status codes that should trigger a retry */
  retryableStatusCodes?: number[];
  /** Function to determine if error is retryable */
  isRetryable?: (error: unknown) => boolean;
}

export interface RateLimitState {
  requests: number;
  windowStart: number;
  blocked: boolean;
  resetTime: number;
}

// =============================================================================
// Rate Limiter Class
// =============================================================================

/**
 * Client-side rate limiter to prevent excessive API calls
 */
export class RateLimiter {
  private state: Map<string, RateLimitState> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Checks if a request is allowed and updates the state
   */
  checkLimit(key?: string): { allowed: boolean; remaining: number; resetIn: number } {
    const limitKey = key || this.config.key || 'default';
    const now = Date.now();

    let state = this.state.get(limitKey);

    // Initialize or reset window if expired
    if (!state || now - state.windowStart >= this.config.windowMs) {
      state = {
        requests: 0,
        windowStart: now,
        blocked: false,
        resetTime: now + this.config.windowMs,
      };
      this.state.set(limitKey, state);
    }

    const remaining = Math.max(0, this.config.maxRequests - state.requests);
    const resetIn = state.resetTime - now;

    if (state.requests >= this.config.maxRequests) {
      return { allowed: false, remaining: 0, resetIn };
    }

    state.requests++;
    return { allowed: true, remaining: remaining - 1, resetIn };
  }

  /**
   * Wraps an async function with rate limiting
   */
  async execute<T>(
    fn: () => Promise<T>,
    key?: string
  ): Promise<T> {
    const { allowed, resetIn } = this.checkLimit(key);

    if (!allowed) {
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${Math.ceil(resetIn / 1000)} seconds.`,
        resetIn
      );
    }

    return fn();
  }

  /**
   * Gets the current state for a key
   */
  getState(key?: string): RateLimitState | undefined {
    return this.state.get(key || this.config.key || 'default');
  }

  /**
   * Resets the rate limit for a key
   */
  reset(key?: string): void {
    this.state.delete(key || this.config.key || 'default');
  }

  /**
   * Resets all rate limits
   */
  resetAll(): void {
    this.state.clear();
  }
}

/**
 * Custom error for rate limit violations
 */
export class RateLimitError extends Error {
  public readonly resetIn: number;

  constructor(message: string, resetIn: number) {
    super(message);
    this.name = 'RateLimitError';
    this.resetIn = resetIn;
  }
}

// =============================================================================
// Throttle Utility
// =============================================================================

/**
 * Creates a throttled version of a function
 * Ensures minimum time between calls
 */
export function createThrottle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  config: ThrottleConfig
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  const { minInterval, queue = false, maxQueueSize = 10 } = config;

  let lastCall = 0;
  const pendingQueue: Array<{
    args: Parameters<T>;
    resolve: (value: ReturnType<T>) => void;
    reject: (error: Error) => void;
  }> = [];
  let processing = false;

  async function processQueue(): Promise<void> {
    if (processing || pendingQueue.length === 0) return;

    processing = true;

    while (pendingQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastCall = now - lastCall;

      if (timeSinceLastCall < minInterval) {
        await sleep(minInterval - timeSinceLastCall);
      }

      const item = pendingQueue.shift();
      if (item) {
        try {
          lastCall = Date.now();
          const result = fn(...item.args);
          if (result instanceof Promise) {
            item.resolve(await result);
          } else {
            item.resolve(result);
          }
        } catch (error) {
          item.reject(error instanceof Error ? error : new Error(String(error)));
        }
      }
    }

    processing = false;
  }

  return async function throttled(...args: Parameters<T>): Promise<ReturnType<T>> {
    if (queue) {
      if (pendingQueue.length >= maxQueueSize) {
        throw new Error('Throttle queue is full');
      }

      return new Promise<ReturnType<T>>((resolve, reject) => {
        pendingQueue.push({ args, resolve, reject });
        processQueue();
      });
    }

    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall < minInterval) {
      await sleep(minInterval - timeSinceLastCall);
    }

    lastCall = Date.now();
    return fn(...args);
  };
}

// =============================================================================
// Exponential Backoff
// =============================================================================

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: 0.1,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Calculates delay with exponential backoff and optional jitter
 */
export function calculateBackoffDelay(
  attempt: number,
  config: Partial<RetryConfig> = {}
): number {
  const {
    initialDelay = DEFAULT_RETRY_CONFIG.initialDelay,
    maxDelay = DEFAULT_RETRY_CONFIG.maxDelay,
    backoffMultiplier = DEFAULT_RETRY_CONFIG.backoffMultiplier,
    jitter = DEFAULT_RETRY_CONFIG.jitter,
  } = config;

  // Exponential backoff
  let delay = initialDelay * Math.pow(backoffMultiplier!, attempt);

  // Apply jitter
  if (jitter && jitter > 0) {
    const jitterAmount = delay * jitter;
    delay += (Math.random() - 0.5) * 2 * jitterAmount;
  }

  // Cap at max delay
  return Math.min(delay, maxDelay);
}

/**
 * Wraps an async function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const {
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    retryableStatusCodes = DEFAULT_RETRY_CONFIG.retryableStatusCodes,
    isRetryable,
  } = config;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      const shouldRetry = attempt < maxRetries && (
        isRetryable?.(error) ??
        isRetryableError(error, retryableStatusCodes!)
      );

      if (!shouldRetry) {
        throw lastError;
      }

      // Wait before retrying
      const delay = calculateBackoffDelay(attempt, config);
      await sleep(delay);
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Checks if an error is retryable based on status code
 */
function isRetryableError(error: unknown, retryableStatusCodes: number[]): boolean {
  if (error instanceof Error) {
    // Check for network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return true;
    }

    // Check for response status in error
    const errorWithStatus = error as Error & { status?: number; statusCode?: number };
    const status = errorWithStatus.status || errorWithStatus.statusCode;

    if (status && retryableStatusCodes.includes(status)) {
      return true;
    }
  }

  return false;
}

// =============================================================================
// Request Deduplication
// =============================================================================

/**
 * Deduplicates concurrent identical requests
 * Multiple calls with the same key will share the same promise
 */
export class RequestDeduplicator<T> {
  private pending: Map<string, Promise<T>> = new Map();

  /**
   * Executes a request with deduplication
   */
  async execute(key: string, fn: () => Promise<T>): Promise<T> {
    // Check if there's already a pending request
    const existing = this.pending.get(key);
    if (existing) {
      return existing;
    }

    // Create new request
    const promise = fn().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }

  /**
   * Checks if a request is currently pending
   */
  isPending(key: string): boolean {
    return this.pending.has(key);
  }

  /**
   * Clears all pending requests
   */
  clear(): void {
    this.pending.clear();
  }
}

// =============================================================================
// Circuit Breaker
// =============================================================================

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

export interface CircuitBreakerConfig {
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time in ms to wait before testing recovery */
  resetTimeout: number;
  /** Number of successes needed to close from half-open */
  successThreshold?: number;
}

/**
 * Circuit breaker pattern for handling service failures
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailure: number = 0;
  private config: Required<CircuitBreakerConfig>;

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      ...config,
      successThreshold: config.successThreshold || 1,
    };
  }

  /**
   * Gets the current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Executes a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailure >= this.config.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successes = 0;
      } else {
        throw new CircuitBreakerError('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Records a successful call
   */
  private onSuccess(): void {
    this.failures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
      }
    }
  }

  /**
   * Records a failed call
   */
  private onFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
    } else if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  /**
   * Resets the circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailure = 0;
  }
}

/**
 * Custom error for circuit breaker
 */
export class CircuitBreakerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a debounced version of a function
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Creates a rate limiter with common presets
 */
export const rateLimitPresets = {
  /** 10 requests per second */
  fast: () => new RateLimiter({ maxRequests: 10, windowMs: 1000 }),
  /** 60 requests per minute */
  standard: () => new RateLimiter({ maxRequests: 60, windowMs: 60000 }),
  /** 100 requests per minute */
  relaxed: () => new RateLimiter({ maxRequests: 100, windowMs: 60000 }),
  /** 1000 requests per hour */
  hourly: () => new RateLimiter({ maxRequests: 1000, windowMs: 3600000 }),
} as const;

/**
 * Creates a circuit breaker with common presets
 */
export const circuitBreakerPresets = {
  /** Aggressive: Opens after 3 failures, 10s reset */
  aggressive: () => new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 10000,
    successThreshold: 2,
  }),
  /** Standard: Opens after 5 failures, 30s reset */
  standard: () => new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 30000,
    successThreshold: 1,
  }),
  /** Relaxed: Opens after 10 failures, 60s reset */
  relaxed: () => new CircuitBreaker({
    failureThreshold: 10,
    resetTimeout: 60000,
    successThreshold: 1,
  }),
} as const;

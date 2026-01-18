/**
 * Rate Limiting - Movement & Recovery Companion
 *
 * Simple rate limiting using Vercel KV with in-memory fallback.
 */

import { kv } from '@vercel/kv';

interface RateLimitConfig {
  interval: number;  // Time window in seconds
  limit: number;     // Max requests per interval
}

const defaultConfig: RateLimitConfig = {
  interval: 60,  // 1 minute
  limit: 60,     // 60 requests per minute
};

// In-memory fallback for local development
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if request should be rate limited
 * @returns { limited: boolean, remaining: number, resetAt: number }
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = defaultConfig
): Promise<{ limited: boolean; remaining: number; resetAt: number }> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const resetAt = now + config.interval * 1000;

  try {
    // Try using Vercel KV
    const current = await kv.get<{ count: number; resetAt: number }>(key);

    if (!current || current.resetAt < now) {
      // New window
      await kv.set(key, { count: 1, resetAt }, { ex: config.interval });
      return { limited: false, remaining: config.limit - 1, resetAt };
    }

    if (current.count >= config.limit) {
      return { limited: true, remaining: 0, resetAt: current.resetAt };
    }

    // Increment count
    await kv.set(key, { count: current.count + 1, resetAt: current.resetAt }, { ex: config.interval });
    return { limited: false, remaining: config.limit - current.count - 1, resetAt: current.resetAt };
  } catch {
    // Fallback to in-memory for local dev
    const stored = inMemoryStore.get(key);

    if (!stored || stored.resetAt < now) {
      inMemoryStore.set(key, { count: 1, resetAt });
      return { limited: false, remaining: config.limit - 1, resetAt };
    }

    if (stored.count >= config.limit) {
      return { limited: true, remaining: 0, resetAt: stored.resetAt };
    }

    stored.count++;
    return { limited: false, remaining: config.limit - stored.count, resetAt: stored.resetAt };
  }
}

/**
 * Create rate limit response headers
 */
export function rateLimitHeaders(remaining: number, resetAt: number): HeadersInit {
  return {
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetAt / 1000).toString(),
  };
}

/**
 * Rate limited response
 */
export function rateLimitedResponse(resetAt: number): Response {
  return new Response(
    JSON.stringify({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
      },
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((resetAt - Date.now()) / 1000).toString(),
        ...rateLimitHeaders(0, resetAt),
      },
    }
  );
}

// Preset configurations
export const rateLimitConfigs = {
  strict: { interval: 60, limit: 10 },    // 10 per minute (auth endpoints)
  standard: { interval: 60, limit: 60 },  // 60 per minute (general API)
  relaxed: { interval: 60, limit: 120 },  // 120 per minute (read-heavy)
} as const;

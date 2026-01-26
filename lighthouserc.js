/* eslint-env node */
/**
 * Lighthouse CI configuration
 * @see https://github.com/GoogleChrome/lighthouse-ci
 */
module.exports = {
  ci: {
    collect: {
      // Number of times to run Lighthouse
      numberOfRuns: 3,
      // URLs to test (can be overridden via CLI)
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/body',
        'http://localhost:3000/progress',
        'http://localhost:3000/settings',
      ],
      // Start server command (optional, for local testing)
      startServerCommand: 'cd apps/web && pnpm start',
      startServerReadyPattern: 'ready',
      startServerReadyTimeout: 30000,
      // Chrome flags for better performance
      settings: {
        chromeFlags: '--no-sandbox --disable-gpu --disable-dev-shm-usage',
        preset: 'desktop',
      },
    },
    assert: {
      // Use lighthouse:recommended as base
      preset: 'lighthouse:recommended',
      assertions: {
        // ============================================
        // PERFORMANCE TARGET: 90+ SCORE
        // ============================================
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],

        // Core Web Vitals - Strict thresholds for 90+ score
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],

        // Accessibility - strict enforcement
        'color-contrast': 'error',
        'image-alt': 'error',
        'button-name': 'error',
        'link-name': 'error',
        'html-has-lang': 'error',
        'document-title': 'error',
        'meta-viewport': 'error',

        // Best practices
        'uses-https': 'off', // Allow for localhost testing
        'is-on-https': 'off', // Allow for localhost testing
        'errors-in-console': 'warn',
        'deprecations': 'warn',

        // Resource optimization
        'uses-text-compression': 'warn',
        'uses-responsive-images': 'warn',
        'offscreen-images': 'warn',
        'unused-javascript': 'warn',
        'modern-image-formats': 'warn',
      },
    },
    upload: {
      // Upload to temporary public storage by default
      target: 'temporary-public-storage',
      // Alternative: upload to a LHCI server
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.example.com',
      // token: process.env.LHCI_TOKEN,
    },
  },
};

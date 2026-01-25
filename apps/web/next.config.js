/* eslint-env node */
/** @type {import('next').NextConfig} */

// Bundle analyzer for production build analysis
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// next-intl plugin for internationalization
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig = {
  // ============================================
  // MONOREPO & TRANSPILATION
  // ============================================
  transpilePackages: [
    '@app/ui',
    '@app/domain',
    '@app/data',
    '@app/copy',
    'tamagui',
    '@tamagui/config',
    '@tamagui/core',
    '@tamagui/web',
  ],

  // ============================================
  // EXPERIMENTAL OPTIMIZATIONS
  // Target: 90+ Lighthouse Performance Score
  // ============================================
  experimental: {
    // Tree-shake package imports for smaller bundles
    optimizePackageImports: [
      '@app/ui',
      'tamagui',
      'lucide-react',
      'recharts',
      '@tanstack/react-query',
      'd3-shape',
      'd3-scale',
      'd3-interpolate',
    ],
    // Enable CSS optimization
    optimizeCss: true,
  },

  // ============================================
  // COMPILER OPTIMIZATIONS
  // ============================================
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // ============================================
  // IMAGE OPTIMIZATION
  // ============================================
  images: {
    // Remote patterns for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Modern image formats for better compression
    formats: ['image/avif', 'image/webp'],
    // Responsive image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimize layout shift with longer cache
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // ============================================
  // PERFORMANCE FLAGS
  // Target: 90+ Lighthouse Performance Score
  // ============================================
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,

  // Standalone output for optimized Docker/Vercel deployments
  output: 'standalone',

  // Generate ETags for better caching
  generateEtags: true,

  // Enable HTTP Keep-Alive for better connection reuse
  httpAgentOptions: {
    keepAlive: true,
  },

  // ============================================
  // SECURITY & CACHING HEADERS
  // ============================================
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          // DNS prefetch for performance
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // HTTP Strict Transport Security
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Disable unused browser APIs
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://blob.vercel-storage.com https://*.public.blob.vercel-storage.com",
              "font-src 'self' data:",
              "connect-src 'self' https://*.vercel-storage.com https://*.vercel.app wss://*.vercel.app",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          // XSS Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        // Cache static assets aggressively (1 year)
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache optimized images (1 day, stale-while-revalidate 7 days)
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        // Cache static JS/CSS chunks (immutable, 1 year)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Don't cache service worker and manifest
        source: '/(manifest.json|sw.js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },

  // ============================================
  // REDIRECTS
  // ============================================
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // ============================================
  // WEBPACK OPTIMIZATIONS
  // ============================================
  webpack: (config, { dev, isServer }) => {
    // Handle tamagui and react-native-web
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
    };

    // Ignore native modules that aren't needed on web
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    // Production optimizations
    if (!dev && !isServer) {
      // Enable tree shaking for side-effect-free modules
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true,
      };

      // Split chunks more aggressively for better caching
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          // Vendor chunk for node_modules
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // Separate chunk for recharts (large charting library)
          recharts: {
            test: /[\\/]node_modules[\\/](recharts|d3-.*)[\\/]/,
            name: 'recharts',
            chunks: 'all',
            priority: 20,
          },
          // Separate chunk for tamagui
          tamagui: {
            test: /[\\/]node_modules[\\/](@tamagui|tamagui)[\\/]/,
            name: 'tamagui',
            chunks: 'all',
            priority: 20,
          },
          // Common chunk for shared code
          common: {
            minChunks: 2,
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },

  // ============================================
  // MODULAR IMPORTS (Tree-shaking helpers)
  // ============================================
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },

  // ============================================
  // BUILD INDICATORS
  // ============================================
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
};

// Compose plugins: withNextIntl wraps the config, then withBundleAnalyzer
module.exports = withBundleAnalyzer(withNextIntl(nextConfig));

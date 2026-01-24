/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,

  // Image optimization
  images: {
    domains: [],
    unoptimized: true, // Static export compatibility
  },

  // Rewrites to serve the Vite SPA for all non-API routes
  async rewrites() {
    return {
      beforeFiles: [
        // Serve static assets from /assets
        {
          source: '/assets/:path*',
          destination: '/assets/:path*',
        },
      ],
      afterFiles: [
        // All non-API routes serve the SPA
        {
          source: '/:path((?!api|_next|assets|favicon).*)',
          destination: '/index.html',
        },
      ],
      fallback: [
        // Catch-all fallback to SPA
        {
          source: '/:path*',
          destination: '/index.html',
        },
      ],
    };
  },

  // Skip the default page
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone for standard Vercel deployment
  reactStrictMode: true,
  poweredByHeader: false,

  // Ensure trailing slashes are handled consistently
  trailingSlash: false,

  // Image optimization
  images: {
    domains: [],
    unoptimized: false,
  },

  // Rewrites for React Native Web app
  async rewrites() {
    return [
      {
        // Serve /app/ and /app (with or without trailing slash)
        source: '/app',
        destination: '/app/index.html',
      },
      {
        source: '/app/',
        destination: '/app/index.html',
      },
    ];
  },
};

module.exports = nextConfig;

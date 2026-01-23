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
};

module.exports = nextConfig;

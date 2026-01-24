/** @type {import('next').NextConfig} */
const nextConfig = {
  // Monorepo package transpilation
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

  // Experimental features
  experimental: {
    optimizePackageImports: ['@app/ui', 'tamagui', 'lucide-react'],
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },

  // Vercel deployment optimizations
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,

  // Headers for security (also in vercel.json, but good for local dev)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Webpack configuration
  webpack: (config) => {
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
    };

    return config;
  },

  // Output configuration for Vercel
  output: 'standalone',
};

module.exports = nextConfig;

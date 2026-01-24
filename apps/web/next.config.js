/** @type {import('next').NextConfig} */
const nextConfig = {
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
  experimental: {
    optimizePackageImports: ['@app/ui', 'tamagui', 'lucide-react'],
  },
  images: {
    domains: ['blob.vercel-storage.com'],
  },
  webpack: (config) => {
    // Handle tamagui
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
    };
    return config;
  },
};

module.exports = nextConfig;

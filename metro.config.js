/**
 * Metro configuration for React Native
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    // Add .web.js extension resolution for React Native Web
    sourceExts: [...defaultConfig.resolver.sourceExts, 'web.js', 'web.jsx', 'web.ts', 'web.tsx'],
  },
};

module.exports = mergeConfig(defaultConfig, config);

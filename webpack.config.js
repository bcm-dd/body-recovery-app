/**
 * Webpack configuration for React Native Web
 *
 * This enables the React Native app to run in web browsers.
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const appDirectory = path.resolve(__dirname);
const { presets, plugins } = require('./babel.config.js');

// Babel loader configuration for React Native Web
const babelLoaderConfiguration = {
  test: /\.(js|jsx|ts|tsx)$/,
  include: [
    path.resolve(appDirectory, 'index.web.js'),
    path.resolve(appDirectory, 'App.tsx'),
    path.resolve(appDirectory, 'src'),
    // Include react-native packages that need transpilation
    path.resolve(appDirectory, 'node_modules/react-native-reanimated'),
    path.resolve(appDirectory, 'node_modules/react-native-gesture-handler'),
    path.resolve(appDirectory, 'node_modules/react-native-svg'),
    path.resolve(appDirectory, 'node_modules/react-native-vector-icons'),
    path.resolve(appDirectory, 'node_modules/@react-navigation'),
    path.resolve(appDirectory, 'node_modules/@react-native'),
    path.resolve(appDirectory, 'node_modules/react-native-health-connect'),
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      presets: [
        ['@babel/preset-env', { targets: { browsers: ['last 2 versions'] } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript',
      ],
      plugins: [
        'react-native-web',
        'react-native-reanimated/plugin',
        [
          'module-resolver',
          {
            root: ['./src'],
            extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js', '.json'],
            alias: {
              '@': './src',
              '@components': './src/components',
              '@features': './src/features',
              '@hooks': './src/hooks',
              '@lib': './src/lib',
              '@navigation': './src/navigation',
              '@store': './src/store',
              '@theme': './src/theme',
              '@types': './src/types',
              '@utils': './src/utils',
              '@api': './src/api',
            },
          },
        ],
      ],
    },
  },
};

// Image loader configuration
const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/,
  type: 'asset/resource',
  generator: {
    filename: 'images/[hash][ext][query]',
  },
};

// Font loader configuration
const fontLoaderConfiguration = {
  test: /\.(woff|woff2|eot|ttf|otf)$/,
  type: 'asset/resource',
  generator: {
    filename: 'fonts/[hash][ext][query]',
  },
};

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const apiUrl = process.env.API_BASE_URL || (isProduction ? '' : 'http://localhost:3000');

  return {
    entry: path.resolve(appDirectory, 'index.web.js'),
    output: {
      // In production, output to backend/public so Next.js serves static files
      // In development, output to dist for local dev server
      path: isProduction
        ? path.resolve(appDirectory, 'backend/public/app')
        : path.resolve(appDirectory, 'dist'),
      publicPath: isProduction ? '/app/' : '/',
      filename: isProduction ? 'js/[name].[contenthash].js' : 'static/js/bundle.js',
      chunkFilename: isProduction ? 'js/[name].[contenthash].chunk.js' : 'static/js/[name].chunk.js',
      clean: true,
    },
    resolve: {
      // Resolve .web.js extensions first for React Native Web
      extensions: [
        '.web.tsx',
        '.web.ts',
        '.web.js',
        '.tsx',
        '.ts',
        '.js',
        '.json',
      ],
      alias: {
        // React Native Web aliases
        'react-native$': 'react-native-web',
        'react-native-linear-gradient': 'react-native-web-linear-gradient',
        // Path aliases matching tsconfig
        '@': path.resolve(appDirectory, 'src'),
        '@components': path.resolve(appDirectory, 'src/components'),
        '@features': path.resolve(appDirectory, 'src/features'),
        '@hooks': path.resolve(appDirectory, 'src/hooks'),
        '@lib': path.resolve(appDirectory, 'src/lib'),
        '@navigation': path.resolve(appDirectory, 'src/navigation'),
        '@store': path.resolve(appDirectory, 'src/store'),
        '@theme': path.resolve(appDirectory, 'src/theme'),
        '@types': path.resolve(appDirectory, 'src/types'),
        '@utils': path.resolve(appDirectory, 'src/utils'),
        '@api': path.resolve(appDirectory, 'src/api'),
      },
    },
    module: {
      rules: [
        babelLoaderConfiguration,
        imageLoaderConfiguration,
        fontLoaderConfiguration,
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(appDirectory, 'web/index.html'),
        filename: 'index.html',
        inject: true,
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),
      // Copy static assets
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(appDirectory, 'web/static'),
            to: 'static',
            noErrorOnMissing: true,
          },
        ],
      }),
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
    devServer: {
      static: {
        directory: path.resolve(appDirectory, 'dist'),
      },
      port: 8080,
      hot: true,
      historyApiFallback: true, // For SPA routing
      proxy: [
        {
          context: ['/api'],
          target: apiUrl,
          changeOrigin: true,
        },
      ],
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
  };
};

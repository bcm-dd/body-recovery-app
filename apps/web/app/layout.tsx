import type { Metadata, Viewport } from 'next';

import './globals.css';
import { Providers } from './providers';

// PWA Metadata Configuration
export const metadata: Metadata = {
  title: 'Body Recovery Companion',
  description: 'Your personal movement and recovery companion - track pain, plan recovery sessions, and monitor your progress.',
  keywords: ['recovery', 'rehabilitation', 'pain management', 'mobility', 'exercises'],
  manifest: '/manifest.json',
  applicationName: 'Body Recovery',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Body Recovery',
    startupImage: [
      {
        url: '/icons/icon-512x512.svg',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-72x72.svg', sizes: '72x72', type: 'image/svg+xml' },
      { url: '/icons/icon-96x96.svg', sizes: '96x96', type: 'image/svg+xml' },
      { url: '/icons/icon-128x128.svg', sizes: '128x128', type: 'image/svg+xml' },
      { url: '/icons/icon-144x144.svg', sizes: '144x144', type: 'image/svg+xml' },
      { url: '/icons/icon-152x152.svg', sizes: '152x152', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-384x384.svg', sizes: '384x384', type: 'image/svg+xml' },
      { url: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon-152x152.svg', sizes: '152x152', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
    shortcut: '/icons/icon-96x96.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'Body Recovery',
    title: 'Body Recovery Companion',
    description: 'Your personal movement and recovery companion - track pain, plan recovery sessions, and monitor your progress.',
  },
  twitter: {
    card: 'summary',
    title: 'Body Recovery Companion',
    description: 'Your personal movement and recovery companion',
  },
};

// Viewport configuration for PWA
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6366f1' },
    { media: '(prefers-color-scheme: dark)', color: '#6366f1' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note: The lang and dir attributes are updated dynamically by Providers
  // based on the user's locale preference. suppressHydrationWarning prevents
  // React warnings when these attributes change on the client side.
  // For RTL languages (Arabic, Hebrew, etc.), dir="rtl" will be applied.
  return (
    <html lang="en" dir="ltr" className="dark" suppressHydrationWarning>
      <head>
        {/* PWA Essential Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* PWA Splash Screen Colors */}
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.svg" />

        {/* ============================================
            PERFORMANCE OPTIMIZATION - Resource Hints
            ============================================ */}

        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://blob.vercel-storage.com" />

        {/* DNS Prefetch for non-critical origins */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://blob.vercel-storage.com" />

        {/* Preload critical fonts for faster LCP */}
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Prefetch likely next pages for faster navigation */}
        <link rel="prefetch" href="/body" />
        <link rel="prefetch" href="/progress" />

        {/* Critical rendering hints */}
        <meta name="color-scheme" content="light dark" />
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

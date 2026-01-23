import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navigation } from './components/Navigation';
import { Providers } from './components/Providers';

export const metadata: Metadata = {
  title: 'Movement & Recovery Companion',
  description: 'AI-driven movement coaching with clinical context',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Movement',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {/* Skip link for keyboard navigation - accessibility */}
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>
          <div className="app-container">
            <main
              id="main-content"
              className="main-content"
              role="main"
              aria-label="Main content"
              tabIndex={-1}
            >
              {children}
            </main>
            <Navigation />
          </div>
        </Providers>
      </body>
    </html>
  );
}

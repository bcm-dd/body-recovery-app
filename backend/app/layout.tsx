import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navigation } from './components/Navigation';

export const metadata: Metadata = {
  title: 'Movement & Recovery Companion',
  description: 'AI-driven movement coaching with clinical context',
  manifest: '/manifest.json',
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
        <div className="app-container">
          <main className="main-content">
            {children}
          </main>
          <Navigation />
        </div>
      </body>
    </html>
  );
}

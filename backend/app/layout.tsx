/**
 * Root Layout - Movement & Recovery Companion (API Backend)
 *
 * Minimal layout for API-only Next.js backend.
 * The main web UI is served via React Native Web.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Movement & Recovery API',
  description: 'API backend for Movement & Recovery Companion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

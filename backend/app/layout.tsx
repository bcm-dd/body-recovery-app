/**
 * Root Layout - Body Recovery API
 *
 * Minimal layout for API-only backend.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Body Recovery',
  description: 'An AI that knows your body and helps you take care of it.',
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

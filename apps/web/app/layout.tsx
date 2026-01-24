import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Body Recovery Companion',
  description: 'Your personal movement and recovery companion - track pain, plan recovery sessions, and monitor your progress.',
  keywords: ['recovery', 'rehabilitation', 'pain management', 'mobility', 'exercises'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

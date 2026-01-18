import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Movement & Recovery Companion',
  description: 'AI-driven movement coaching with clinical context',
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

/**
 * Root Page - Movement & Recovery Companion (API Backend)
 *
 * Landing page with link to the React Native Web app.
 */

import Link from 'next/link';

export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      padding: '20px',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>
        Movement & Recovery
      </h1>
      <p style={{ color: '#888', maxWidth: '400px', lineHeight: 1.6, marginBottom: '2rem' }}>
        AI-driven movement coaching with clinical context
      </p>

      <Link
        href="/app/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem 2rem',
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          borderRadius: '12px',
          fontSize: '1.125rem',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'background-color 0.2s',
        }}
      >
        Launch App
      </Link>

      <div style={{
        marginTop: '3rem',
        padding: '1rem 2rem',
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        fontSize: '0.875rem',
      }}>
        <p style={{ color: '#22c55e', margin: 0 }}>API Status: Online</p>
      </div>

      <p style={{
        marginTop: '2rem',
        color: '#666',
        fontSize: '0.75rem',
      }}>
        Also available on iOS and Android
      </p>
    </main>
  );
}

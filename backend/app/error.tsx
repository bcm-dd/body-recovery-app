'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Root Error Boundary
 *
 * Catches unhandled errors and provides a user-friendly recovery interface.
 * Logs errors for debugging without exposing internal details to users.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging - in production, send to error reporting service
    // Never log sensitive information like user data or auth tokens
    const errorInfo = {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    // In production, this would be sent to Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Production: Send to error monitoring service
      console.error('[Error Boundary]', errorInfo);
    } else {
      // Development: Full error for debugging
      console.error('[Error Boundary]', error);
    }
  }, [error]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="animate-fade-in"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'var(--error-subtle, #FEE2E2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
        aria-hidden="true"
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--error, #EF4444)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Something went wrong
      </h1>

      <p
        style={{
          color: 'var(--text-secondary)',
          marginBottom: '1.5rem',
          maxWidth: '400px',
        }}
      >
        We encountered an unexpected error. This has been logged and we&apos;ll look into it.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={() => reset()}
          aria-label="Try again to reload the page"
        >
          Try Again
        </button>
        <Link href="/" className="btn btn-secondary">
          Go Home
        </Link>
      </div>

      {/* Show error digest in development for debugging */}
      {process.env.NODE_ENV !== 'production' && error.digest && (
        <p
          style={{
            marginTop: '2rem',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            fontFamily: 'monospace',
          }}
        >
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}

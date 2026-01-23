'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Body Map Error Boundary
 *
 * Handles errors specific to the body tracking feature.
 * Provides contextual recovery options.
 */
export default function BodyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error with context
    console.error('[Body Map Error]', {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="animate-fade-in"
      style={{
        padding: '2rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <header className="screen-header">
        <h1 className="screen-title">Body Map</h1>
      </header>

      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--error-subtle, #FEE2E2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
          aria-hidden="true"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--error, #EF4444)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a10 10 0 1 0 10 10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Unable to load body data
        </h2>

        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
            maxWidth: '300px',
            lineHeight: 1.5,
          }}
        >
          We couldn&apos;t load your injury tracking data. Your data is safe - please try again.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={() => reset()}
            aria-label="Retry loading body map"
          >
            Try Again
          </button>
          <Link href="/" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {process.env.NODE_ENV !== 'production' && error.digest && (
        <p
          style={{
            marginTop: '1.5rem',
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

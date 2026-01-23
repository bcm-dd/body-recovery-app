'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Workout Error Boundary
 *
 * Handles errors specific to workout execution and planning.
 * Ensures users can recover from errors without losing workout progress.
 */
export default function WorkoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error with context
    console.error('[Workout Error]', {
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
    >
      <header className="screen-header">
        <Link
          href="/"
          style={{
            color: 'var(--brand-primary)',
            textDecoration: 'none',
            fontSize: '0.875rem',
          }}
        >
          &larr; Back
        </Link>
        <h1 className="screen-title">Workout</h1>
      </header>

      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
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
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--error, #EF4444)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6.5 6.5h11v11h-11z" />
            <path d="M6.5 6.5L3 3" />
            <path d="M17.5 6.5L21 3" />
            <path d="M17.5 17.5l3.5 3.5" />
            <path d="M6.5 17.5L3 21" />
          </svg>
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Workout Error
        </h2>

        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
            maxWidth: '300px',
            lineHeight: 1.5,
          }}
        >
          We couldn&apos;t load your workout. If you were in the middle of a session, your progress has been saved locally.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={() => reset()}
            aria-label="Retry loading workout"
          >
            Try Again
          </button>
          <Link href="/" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>

        {/* Recovery tip */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'var(--bg-secondary)',
            borderRadius: 12,
            width: '100%',
            maxWidth: '300px',
          }}
        >
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem',
            }}
          >
            <strong>Need to log a workout manually?</strong>
          </p>
          <Link
            href="/chat"
            style={{
              color: 'var(--brand-primary)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Ask Coach for help &rarr;
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
            textAlign: 'center',
          }}
        >
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}

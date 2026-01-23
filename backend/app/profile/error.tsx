'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Profile Error Boundary
 *
 * Handles errors specific to user profile and settings.
 * Provides recovery options for profile data issues.
 */
export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error with context
    console.error('[Profile Error]', {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  // Check if it's likely an auth-related error
  const isAuthError = error.message?.toLowerCase().includes('auth') ||
    error.message?.toLowerCase().includes('session') ||
    error.message?.toLowerCase().includes('unauthorized');

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="animate-fade-in"
    >
      <header className="screen-header">
        <h1 className="screen-title">Profile</h1>
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
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: isAuthError ? 'var(--warning-subtle, #FEF3C7)' : 'var(--error-subtle, #FEE2E2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
          aria-hidden="true"
        >
          {isAuthError ? (
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--warning, #F59E0B)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          ) : (
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
              <line x1="18" y1="8" x2="23" y2="13" />
              <line x1="23" y1="8" x2="18" y2="13" />
            </svg>
          )}
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          {isAuthError ? 'Session Issue' : 'Profile Unavailable'}
        </h2>

        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
            maxWidth: '300px',
            lineHeight: 1.5,
          }}
        >
          {isAuthError
            ? 'Your session may have expired. Please sign in again to access your profile.'
            : 'We couldn\'t load your profile data. Your settings and progress are safe.'}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {isAuthError ? (
            <Link href="/login" className="btn btn-primary">
              Sign In
            </Link>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => reset()}
              aria-label="Retry loading profile"
            >
              Try Again
            </button>
          )}
          <Link href="/" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Stats section with error state */}
      <div className="section">
        <h3 className="section-title">Your Stats</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: 12,
                padding: '1rem',
                opacity: 0.5,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'var(--bg-tertiary)',
                  marginBottom: '0.5rem',
                }}
              />
              <div
                style={{
                  width: '60%',
                  height: 20,
                  borderRadius: 4,
                  background: 'var(--bg-tertiary)',
                  marginBottom: '0.25rem',
                }}
              />
              <div
                style={{
                  width: '40%',
                  height: 12,
                  borderRadius: 4,
                  background: 'var(--bg-tertiary)',
                }}
              />
            </div>
          ))}
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

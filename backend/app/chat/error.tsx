'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Chat Error Boundary
 *
 * Handles errors specific to the AI coach chat feature.
 * Provides offline fallback messaging and recovery options.
 */
export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error with context
    console.error('[Chat Error]', {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  // Check if it's likely a network/API error
  const isNetworkError = error.message?.toLowerCase().includes('network') ||
    error.message?.toLowerCase().includes('fetch') ||
    error.message?.toLowerCase().includes('api');

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <header className="screen-header">
        <h1 className="screen-title">Coach</h1>
        <p className="screen-subtitle">AI-powered movement guidance</p>
      </header>

      <div
        style={{
          flex: 1,
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
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: isNetworkError ? 'var(--warning-subtle, #FEF3C7)' : 'var(--error-subtle, #FEE2E2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
          aria-hidden="true"
        >
          {isNetworkError ? (
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
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="9" y1="10" x2="15" y2="10" />
            </svg>
          )}
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          {isNetworkError ? 'Connection Issue' : 'Chat Unavailable'}
        </h2>

        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
            maxWidth: '300px',
            lineHeight: 1.5,
          }}
        >
          {isNetworkError
            ? 'Unable to connect to the AI coach. Please check your connection and try again.'
            : 'The AI coach encountered an issue. Your conversation history is preserved.'}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={() => reset()}
            aria-label="Retry connecting to coach"
          >
            Try Again
          </button>
          <Link href="/" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>

        {/* Helpful tip */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'var(--bg-secondary)',
            borderRadius: 12,
            maxWidth: '300px',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <strong>Tip:</strong> While offline, you can still access your workout and body map features.
          </p>
        </div>
      </div>

      {process.env.NODE_ENV !== 'production' && error.digest && (
        <p
          style={{
            padding: '1rem',
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

import Link from 'next/link';

/**
 * 404 Not Found Page
 *
 * Displayed when a user navigates to a non-existent route.
 * Provides helpful navigation options to get back on track.
 */
export default function NotFound() {
  return (
    <div
      role="main"
      aria-labelledby="not-found-title"
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
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
        aria-hidden="true"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-secondary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
          <path d="M11 8v2" />
          <path d="M11 14h.01" />
        </svg>
      </div>

      <h1
        id="not-found-title"
        style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}
      >
        Page Not Found
      </h1>

      <p
        style={{
          color: 'var(--text-secondary)',
          marginBottom: '2rem',
          maxWidth: '360px',
          lineHeight: 1.6,
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" className="btn btn-primary">
          Go to Dashboard
        </Link>
      </div>

      {/* Quick navigation links */}
      <nav
        aria-label="Quick navigation"
        style={{ marginTop: '2.5rem' }}
      >
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-tertiary)',
            marginBottom: '0.75rem',
          }}
        >
          Or try one of these:
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/workout"
            style={{
              color: 'var(--brand-primary)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Workout
          </Link>
          <Link
            href="/body"
            style={{
              color: 'var(--brand-primary)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Body Map
          </Link>
          <Link
            href="/chat"
            style={{
              color: 'var(--brand-primary)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Coach
          </Link>
          <Link
            href="/profile"
            style={{
              color: 'var(--brand-primary)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Profile
          </Link>
        </div>
      </nav>
    </div>
  );
}

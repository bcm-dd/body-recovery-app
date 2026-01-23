import { Skeleton, LoadingSpinner } from '../components/LoadingSpinner';

/**
 * Workout Loading State
 *
 * Displays skeleton loaders that match the workout page structure.
 * Shows exercise list placeholders matching the actual layout.
 */
export default function WorkoutLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading workout"
      className="animate-fade-in"
    >
      {/* Header skeleton */}
      <header className="screen-header">
        <Skeleton width={60} height={16} style={{ marginBottom: 12 }} />
        <Skeleton width="70%" height={28} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={16} />
      </header>

      {/* Exercise list section */}
      <div className="section">
        <Skeleton width="30%" height={14} style={{ marginBottom: '1rem' }} />

        {/* Exercise list item skeletons */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="list-item"
            style={{
              cursor: 'default',
              opacity: 1 - (i * 0.1),
            }}
          >
            {/* Exercise number */}
            <Skeleton width={40} height={40} borderRadius={10} />

            {/* Exercise details */}
            <div style={{ flex: 1 }}>
              <Skeleton
                width={`${80 - (i * 5)}%`}
                height={16}
                style={{ marginBottom: 6 }}
              />
              <Skeleton width="50%" height={12} />
            </div>
          </div>
        ))}
      </div>

      {/* Start button skeleton */}
      <div
        style={{
          padding: '1rem 1.5rem',
          position: 'sticky',
          bottom: 80,
          background: 'var(--bg-primary)',
        }}
      >
        <Skeleton
          width="100%"
          height={52}
          borderRadius="var(--radius-md)"
        />
      </div>

      {/* Centered loading indicator for initial load */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          padding: '1.5rem',
          background: 'var(--bg-primary)',
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        <LoadingSpinner size="medium" />
        <span
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}
        >
          Loading workout...
        </span>
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading your workout session...</span>
    </div>
  );
}

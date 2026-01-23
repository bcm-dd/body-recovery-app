/**
 * Root Loading State
 *
 * Displays a centered loading spinner with accessibility announcements.
 * Uses CSS animations that run on the GPU for smooth performance.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading content"
      className="animate-fade-in"
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-md, 1rem)',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          position: 'relative',
        }}
      >
        {/* Background track */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="var(--bg-tertiary)"
            strokeWidth="4"
          />
        </svg>
        {/* Spinning indicator */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            animation: 'spin 1s linear infinite',
          }}
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="var(--brand-primary)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="125.6"
            strokeDashoffset="94.2"
          />
        </svg>
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Loading, please wait...</span>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

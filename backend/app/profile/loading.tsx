import { Skeleton, StatCardSkeleton, LoadingListItem } from '../components/LoadingSpinner';

/**
 * Profile Loading State
 *
 * Displays skeleton loaders that match the profile page structure.
 * Includes user info, stats grid, and progress chart placeholders.
 */
export default function ProfileLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading profile"
      className="animate-fade-in"
    >
      {/* Header */}
      <header className="screen-header">
        <Skeleton width="30%" height={28} />
      </header>

      {/* User info card skeleton */}
      <div
        className="card"
        style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
      >
        {/* Avatar skeleton */}
        <Skeleton width={64} height={64} borderRadius="50%" />

        {/* User details */}
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height={20} style={{ marginBottom: 8 }} />
          <Skeleton width="80%" height={14} />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div
        style={{
          display: 'flex',
          margin: '0 1.5rem',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div style={{ flex: 1, padding: '1rem', borderBottom: '2px solid var(--brand-primary)' }}>
          <Skeleton width="60%" height={16} style={{ margin: '0 auto' }} />
        </div>
        <div style={{ flex: 1, padding: '1rem' }}>
          <Skeleton width="60%" height={16} style={{ margin: '0 auto' }} />
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>

      {/* Weekly chart skeleton */}
      <div className="section">
        <Skeleton width="40%" height={14} style={{ marginBottom: '1rem' }} />
        <div
          className="card"
          style={{ margin: 0, padding: '1rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', height: 120, alignItems: 'flex-end' }}>
            {[65, 80, 45, 70, 85, 55, 75].map((height, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  gap: 8,
                }}
              >
                <div
                  className="skeleton"
                  style={{
                    width: '60%',
                    height: `${height}%`,
                    borderRadius: 4,
                  }}
                />
                <Skeleton width={24} height={10} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personal bests skeleton */}
      <div className="section">
        <Skeleton width="45%" height={14} style={{ marginBottom: '1rem' }} />
        <LoadingListItem />
        <LoadingListItem />
        <LoadingListItem />
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading your profile and stats...</span>
    </div>
  );
}

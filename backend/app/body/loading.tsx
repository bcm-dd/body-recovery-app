import { Skeleton } from '../components/LoadingSpinner';

/**
 * Body Map Loading State
 *
 * Displays skeleton loaders that match the body map page structure.
 * Includes body silhouette placeholder and injury list skeletons.
 */
export default function BodyLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading body map"
      className="animate-fade-in"
    >
      {/* Header skeleton */}
      <header className="screen-header">
        <Skeleton width="40%" height={28} style={{ marginBottom: 8 }} />
        <Skeleton width="70%" height={16} />
      </header>

      {/* Body map card skeleton */}
      <div className="card" style={{ padding: '2rem' }}>
        {/* Body silhouette placeholder */}
        <div
          style={{
            width: '100%',
            maxWidth: 300,
            height: 280,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {/* Head */}
          <Skeleton width={60} height={50} borderRadius="50%" />
          {/* Body */}
          <div style={{ display: 'flex', gap: 4 }}>
            <Skeleton width={30} height={100} borderRadius={8} />
            <Skeleton width={70} height={120} borderRadius={8} />
            <Skeleton width={30} height={100} borderRadius={8} />
          </div>
          {/* Legs */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Skeleton width={40} height={100} borderRadius={8} />
            <Skeleton width={40} height={100} borderRadius={8} />
          </div>
        </div>

        {/* Legend skeleton */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Skeleton width={12} height={12} borderRadius="50%" />
            <Skeleton width={32} height={12} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Skeleton width={12} height={12} borderRadius="50%" />
            <Skeleton width={52} height={12} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Skeleton width={12} height={12} borderRadius="50%" />
            <Skeleton width={40} height={12} />
          </div>
        </div>
      </div>

      {/* Active injuries section skeleton */}
      <div className="section">
        <Skeleton width="50%" height={16} style={{ marginBottom: '1rem' }} />

        {/* Injury list item skeletons */}
        {[1, 2].map((i) => (
          <div
            key={i}
            className="list-item"
            style={{ cursor: 'default' }}
          >
            <Skeleton width={40} height={40} borderRadius={10} />
            <div style={{ flex: 1 }}>
              <Skeleton width="60%" height={16} style={{ marginBottom: 6 }} />
              <Skeleton width="80%" height={12} />
            </div>
            <Skeleton width={60} height={24} borderRadius={12} />
          </div>
        ))}
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading body map and injury data...</span>
    </div>
  );
}

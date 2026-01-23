'use client';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  label?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'medium',
  color = 'var(--brand-primary)',
  label,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 64,
  };

  const strokeWidthMap = {
    small: 3,
    medium: 4,
    large: 5,
  };

  const dimension = sizeMap[size];
  const strokeWidth = strokeWidthMap[size];
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const spinnerContent = (
    <div
      role="status"
      aria-live="polite"
      aria-label={label || 'Loading'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-md)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: dimension,
          height: dimension,
          position: 'relative',
        }}
      >
        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          style={{
            animation: 'spin 1s linear infinite',
          }}
        >
          {/* Background track */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke="var(--bg-tertiary)"
            strokeWidth={strokeWidth}
          />
          {/* Animated arc */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.75}
            style={{
              transformOrigin: 'center',
            }}
          />
        </svg>
      </div>
      {label && (
        <span
          className="text-secondary"
          style={{
            fontSize: size === 'small' ? '0.75rem' : '0.875rem',
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      )}
      {/* Screen reader only text */}
      <span className="sr-only">{label || 'Loading, please wait...'}</span>
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label || 'Loading'}
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          zIndex: 100,
        }}
      >
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
}

// Skeleton loader component for content placeholders
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 'var(--radius-md)',
  style,
}: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

// Loading card component for card-sized placeholders
export function LoadingCard() {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
        <Skeleton width={48} height={48} borderRadius={12} />
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
      <Skeleton width="100%" height={40} />
    </div>
  );
}

// Loading list item component
export function LoadingListItem() {
  return (
    <div className="list-item" style={{ cursor: 'default' }}>
      <Skeleton width={40} height={40} borderRadius={10} />
      <div style={{ flex: 1 }}>
        <Skeleton width="70%" height={14} style={{ marginBottom: 6 }} />
        <Skeleton width="50%" height={12} />
      </div>
    </div>
  );
}

// Stat card skeleton for profile page
export function StatCardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-primary)',
      border: '1px solid var(--border-light)',
      borderRadius: 12,
      padding: '1rem',
    }}>
      <Skeleton width={32} height={32} borderRadius={8} style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="60%" height={24} style={{ marginBottom: '0.25rem' }} />
      <Skeleton width="80%" height={12} />
    </div>
  );
}

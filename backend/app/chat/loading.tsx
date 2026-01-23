import { Skeleton } from '../components/LoadingSpinner';

/**
 * Chat Loading State
 *
 * Displays skeleton loaders that match the chat interface structure.
 * Shows message bubbles and input area placeholders.
 */
export default function ChatLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading chat"
      className="animate-fade-in"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Header */}
      <header className="screen-header">
        <Skeleton width="30%" height={28} style={{ marginBottom: 8 }} />
        <Skeleton width="60%" height={16} />
      </header>

      {/* Messages area skeleton */}
      <div
        style={{
          flex: 1,
          padding: '0 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Assistant message skeleton */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div
            style={{
              maxWidth: '80%',
              padding: '0.75rem 1rem',
              borderRadius: '16px 16px 16px 4px',
              background: 'var(--bg-tertiary)',
            }}
          >
            <Skeleton width={220} height={16} style={{ marginBottom: 8 }} />
            <Skeleton width={180} height={16} style={{ marginBottom: 8 }} />
            <Skeleton width={140} height={16} />
          </div>
        </div>

        {/* User message skeleton */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Skeleton
            width={160}
            height={44}
            borderRadius="16px 16px 4px 16px"
            style={{ background: 'var(--brand-primary)', opacity: 0.3 }}
          />
        </div>

        {/* Another assistant message */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div
            style={{
              maxWidth: '80%',
              padding: '0.75rem 1rem',
              borderRadius: '16px 16px 16px 4px',
              background: 'var(--bg-tertiary)',
            }}
          >
            <Skeleton width={200} height={16} style={{ marginBottom: 8 }} />
            <Skeleton width={160} height={16} />
          </div>
        </div>
      </div>

      {/* Quick suggestions skeleton */}
      <div
        style={{
          padding: '0.5rem 1rem',
          display: 'flex',
          gap: '0.5rem',
          background: 'var(--bg-primary)',
        }}
      >
        <Skeleton width={120} height={32} borderRadius={16} />
        <Skeleton width={140} height={32} borderRadius={16} />
        <Skeleton width={100} height={32} borderRadius={16} />
      </div>

      {/* Input area skeleton */}
      <div
        style={{
          padding: '1rem',
          background: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        <Skeleton width="100%" height={44} borderRadius="var(--radius-md)" />
        <Skeleton width={50} height={44} borderRadius="var(--radius-md)" />
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading AI coach chat...</span>
    </div>
  );
}

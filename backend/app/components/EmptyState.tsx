'use client';

import Link from 'next/link';

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  compact?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
}: EmptyStateProps) {
  const renderAction = (actionData: EmptyStateAction, isSecondary = false) => {
    const variant = actionData.variant || (isSecondary ? 'ghost' : 'primary');
    const buttonClassName = `btn btn-${variant}${!isSecondary ? ' btn-full' : ''}`;

    const buttonContent = (
      <button
        className={buttonClassName}
        onClick={actionData.onClick}
        style={{
          marginTop: isSecondary ? 'var(--spacing-sm)' : 0,
        }}
      >
        {actionData.label}
      </button>
    );

    if (actionData.href) {
      return (
        <Link href={actionData.href} style={{ textDecoration: 'none', width: isSecondary ? 'auto' : '100%' }}>
          {buttonContent}
        </Link>
      );
    }

    return buttonContent;
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: compact ? 'var(--spacing-xl)' : 'var(--spacing-2xl)',
        minHeight: compact ? 'auto' : 300,
      }}
    >
      {/* Icon container */}
      <div
        style={{
          width: compact ? 64 : 80,
          height: compact ? 64 : 80,
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: compact ? '2rem' : '2.5rem',
          marginBottom: 'var(--spacing-lg)',
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: compact ? '1rem' : '1.25rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 'var(--spacing-sm)',
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="text-secondary"
        style={{
          fontSize: compact ? '0.875rem' : '1rem',
          maxWidth: 280,
          lineHeight: 1.5,
          marginBottom: action ? 'var(--spacing-lg)' : 0,
        }}
      >
        {description}
      </p>

      {/* Actions */}
      {action && (
        <div style={{ width: '100%', maxWidth: 240 }}>
          {renderAction(action)}
          {secondaryAction && renderAction(secondaryAction, true)}
        </div>
      )}
    </div>
  );
}

// Pre-configured empty states for common scenarios
export function NoWorkoutScheduled({ onSchedule }: { onSchedule?: () => void }) {
  return (
    <EmptyState
      icon="📅"
      title="No Workout Scheduled"
      description="You don't have a workout planned for today. Take a rest day or add a custom workout."
      action={{
        label: 'Schedule Workout',
        onClick: onSchedule,
      }}
      secondaryAction={{
        label: 'Browse Workouts',
        href: '/workout',
        variant: 'ghost',
      }}
    />
  );
}

export function NoInjuriesTracked() {
  return (
    <EmptyState
      icon="✨"
      title="No Active Issues"
      description="Great news! You don't have any pain or injuries logged. Tap the body map to log any new discomfort."
      compact
    />
  );
}

export function NoPreviousWorkouts() {
  return (
    <EmptyState
      icon="💪"
      title="No Workout History"
      description="You haven't completed any workouts yet. Start your first workout to track your progress!"
      action={{
        label: 'Start First Workout',
        href: '/workout',
      }}
    />
  );
}

export function NoDataAvailable({ message }: { message?: string }) {
  return (
    <EmptyState
      icon="📊"
      title="No Data Available"
      description={message || "We don't have enough data to show you insights yet. Keep training to unlock analytics!"}
      compact
    />
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an error loading your data. Please try again.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon="⚠️"
      title={title}
      description={description}
      action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
    />
  );
}

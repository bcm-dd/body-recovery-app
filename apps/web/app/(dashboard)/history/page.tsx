'use client';

import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Activity,
  TrendingDown,
  TrendingUp,
  Sparkles,
  History,
  Zap,
} from 'lucide-react';
import { useState, useMemo, useId } from 'react';

import { VisuallyHidden } from '../../../src/components/A11y';
import { useAppState } from '../../providers';

interface SessionDetail {
  id: string;
  date: Date;
  duration: number;
  exercises: {
    id: string;
    name: string;
    setsCompleted: number;
    setsTarget: number;
  }[];
  painBefore: number;
  painAfter: number;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(date);
}

function SessionCard({
  session,
  isExpanded,
  onToggle,
}: {
  session: SessionDetail;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const completedCount = session.exercises.filter(
    (e) => e.setsCompleted === e.setsTarget
  ).length;
  const totalCount = session.exercises.length;
  const completionPercent = Math.round((completedCount / totalCount) * 100);
  const painReduction = session.painBefore - session.painAfter;
  const cardId = useId();

  return (
    <article
      className="session-card-premium"
      aria-labelledby={`${cardId}-title`}
    >
      {/* Session Header */}
      <button
        onClick={onToggle}
        className="session-header w-full text-left touch-target"
        aria-expanded={isExpanded}
        aria-controls={`${cardId}-details`}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div
            className="icon-badge-premium flex-shrink-0"
            aria-hidden="true"
          >
            <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--primary)]" />
          </div>
          <div className="min-w-0">
            <h3
              id={`${cardId}-title`}
              className="font-semibold text-foreground text-sm sm:text-base truncate"
            >
              {formatRelativeDate(session.date)}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] truncate">
              {formatDate(session.date)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
          {/* Duration - Hidden on mobile */}
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-1.5 text-foreground">
              <Clock className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
              <span className="font-medium text-sm">{session.duration} min</span>
            </div>
          </div>

          {/* Completion */}
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              <span className="font-medium text-foreground text-sm">
                {completedCount}/{totalCount}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] hidden sm:block">{completionPercent}% complete</p>
          </div>

          {/* Pain Change */}
          <div className="text-right min-w-[60px] sm:min-w-[80px]">
            <span
              className={`flex items-center justify-end gap-1 font-medium text-sm ${
                painReduction > 0
                  ? 'text-emerald-500'
                  : painReduction < 0
                  ? 'text-rose-500'
                  : 'text-[var(--text-muted)]'
              }`}
              aria-label={`Pain ${painReduction > 0 ? 'reduced by' : painReduction < 0 ? 'increased by' : 'unchanged'} ${Math.abs(painReduction)}`}
            >
              {painReduction > 0 ? (
                <>
                  <TrendingDown className="h-4 w-4" aria-hidden="true" />-{painReduction}
                </>
              ) : painReduction < 0 ? (
                <>
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />+{Math.abs(painReduction)}
                </>
              ) : (
                '--'
              )}
            </span>
            <p className="text-xs text-[var(--text-muted)] hidden sm:block">
              {session.painBefore} to {session.painAfter}
            </p>
          </div>

          {/* Expand Icon */}
          <div className="text-[var(--text-muted)] ml-1">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 transition-transform duration-300" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-5 w-5 transition-transform duration-300" aria-hidden="true" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div
          id={`${cardId}-details`}
          className="session-details animate-fadeInUp"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            <h4 className="text-sm font-medium text-[var(--text-muted)]">
              Exercises Completed
            </h4>
          </div>
          <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {session.exercises.map((exercise) => {
              const isComplete = exercise.setsCompleted === exercise.setsTarget;
              return (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between glass-panel-subtle rounded-xl p-3 sm:p-4 micro-bounce"
                  role="listitem"
                  aria-label={`${exercise.name}: ${exercise.setsCompleted} of ${exercise.setsTarget} sets ${isComplete ? 'complete' : 'incomplete'}`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    {isComplete ? (
                      <div className="relative flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                        <div className="absolute inset-0 bg-emerald-500/30 blur-md rounded-full" aria-hidden="true" />
                      </div>
                    ) : (
                      <XCircle className="h-5 w-5 text-amber-500 flex-shrink-0" aria-hidden="true" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {exercise.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {exercise.setsCompleted}/{exercise.setsTarget} sets
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Session Stats */}
          <div className="mt-4 sm:mt-6 grid gap-2 sm:gap-4 grid-cols-3">
            <div className="glass-panel-subtle rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xs text-[var(--text-muted)] mb-1">Duration</p>
              <p className="text-base sm:text-lg font-semibold text-foreground">
                {session.duration}<span className="text-xs sm:text-sm font-normal text-[var(--text-muted)]"> min</span>
              </p>
            </div>
            <div className="glass-panel-subtle rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xs text-[var(--text-muted)] mb-1">Pain Before</p>
              <p className="text-base sm:text-lg font-semibold text-foreground">
                {session.painBefore}<span className="text-xs sm:text-sm font-normal text-[var(--text-muted)]">/10</span>
              </p>
            </div>
            <div className="glass-panel-subtle rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xs text-[var(--text-muted)] mb-1">Pain After</p>
              <p className="text-base sm:text-lg font-semibold text-foreground">
                {session.painAfter}<span className="text-xs sm:text-sm font-normal text-[var(--text-muted)]">/10</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default function HistoryPage() {
  const appState = useAppState();
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '90d'>(
    'all'
  );
  const filterGroupId = useId();

  const filteredSessions = useMemo(() => {
    if (dateFilter === 'all') return appState.sessions;

    const days =
      dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : 90;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return appState.sessions.filter((s) => new Date(s.date) >= cutoff);
  }, [appState.sessions, dateFilter]);

  // Stats
  const totalSessions = filteredSessions.length;
  const totalMinutes = filteredSessions.reduce((acc, s) => acc + s.duration, 0);
  const avgPainReduction =
    filteredSessions.length > 0
      ? filteredSessions.reduce(
          (acc, s) => acc + (s.painBefore - s.painAfter),
          0
        ) / filteredSessions.length
      : 0;
  const completionRate =
    filteredSessions.length > 0
      ? filteredSessions.reduce((acc, s) => {
          const completed = s.exercises.filter(
            (e) => e.setsCompleted === e.setsTarget
          ).length;
          return acc + completed / s.exercises.length;
        }, 0) / filteredSessions.length
      : 0;

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Page Header - Premium Glass Effect */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-xl bg-[var(--primary)]/10 group">
            <History className="h-6 w-6 text-[var(--primary)] transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
            <div className="absolute inset-0 rounded-xl bg-[var(--primary)] opacity-20 blur-sm group-hover:opacity-40 transition-opacity duration-300" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Session History</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Review your past recovery sessions
            </p>
          </div>
        </div>

        {/* Date Filter - Premium Styling */}
        <fieldset className="filter-premium" role="group" aria-labelledby={filterGroupId}>
          <legend id={filterGroupId} className="sr-only">Filter sessions by date range</legend>
          <Filter className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
          <select
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(e.target.value as 'all' | '7d' | '30d' | '90d')
            }
            aria-label="Filter by time period"
          >
            <option value="all">All time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </fieldset>
      </header>

      {/* Stats Summary - Premium Glass Cards */}
      <section aria-labelledby="stats-summary-heading">
        <VisuallyHidden as="h2" id="stats-summary-heading">
          Session Statistics Summary
        </VisuallyHidden>
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 stagger-in">
          <article className="glass-stat-card-premium p-4 sm:p-6 hover-lift" aria-labelledby="total-sessions-stat">
            <div className="flex items-center gap-2.5 sm:gap-3 relative z-10">
              <div className="icon-badge-premium p-2 sm:p-2.5" aria-hidden="true">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p id="total-sessions-stat" className="text-xl sm:text-2xl font-bold text-foreground">
                  {totalSessions}
                </p>
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">Total Sessions</p>
              </div>
            </div>
          </article>

          <article className="glass-stat-card-premium p-4 sm:p-6 hover-lift" aria-labelledby="total-minutes-stat">
            <div className="flex items-center gap-2.5 sm:gap-3 relative z-10">
              <div className="icon-badge-premium p-2 sm:p-2.5 !bg-cyan-500/15" aria-hidden="true">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-500" />
              </div>
              <div>
                <p id="total-minutes-stat" className="text-xl sm:text-2xl font-bold text-foreground">
                  {totalMinutes}
                </p>
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">Total Minutes</p>
              </div>
            </div>
          </article>

          <article className="glass-stat-card-premium p-4 sm:p-6 hover-lift" aria-labelledby="pain-reduction-stat">
            <div className="flex items-center gap-2.5 sm:gap-3 relative z-10">
              <div className="icon-badge-premium p-2 sm:p-2.5 !bg-emerald-500/15" aria-hidden="true">
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
              </div>
              <div>
                <p id="pain-reduction-stat" className="text-xl sm:text-2xl font-bold text-foreground">
                  -{avgPainReduction.toFixed(1)}
                </p>
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">Avg Pain Reduction</p>
              </div>
            </div>
          </article>

          <article className="glass-stat-card-premium p-4 sm:p-6 hover-lift" aria-labelledby="completion-rate-stat">
            <div className="flex items-center gap-2.5 sm:gap-3 relative z-10">
              <div className="icon-badge-premium p-2 sm:p-2.5 !bg-amber-500/15" aria-hidden="true">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
              </div>
              <div>
                <p id="completion-rate-stat" className="text-xl sm:text-2xl font-bold text-foreground">
                  {Math.round(completionRate * 100)}%
                </p>
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">Completion Rate</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Sessions List - Premium Glass Cards */}
      <section aria-labelledby="sessions-list-heading">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          <h2 id="sessions-list-heading" className="text-base sm:text-lg font-semibold text-foreground">
            All Sessions
          </h2>
          {filteredSessions.length > 0 && (
            <span className="glass-badge-primary text-xs">
              {filteredSessions.length}
            </span>
          )}
        </div>

        <div className="space-y-3 sm:space-y-4" role="list" aria-label="Recovery sessions">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isExpanded={expandedSession === session.id}
                onToggle={() =>
                  setExpandedSession(
                    expandedSession === session.id ? null : session.id
                  )
                }
              />
            ))
          ) : (
            <div className="empty-state-premium">
              <div className="icon-container" aria-hidden="true">
                <Calendar className="h-10 w-10 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 relative z-10">
                No sessions found
              </h3>
              <p className="text-sm text-[var(--text-muted)] max-w-sm relative z-10">
                {dateFilter === 'all'
                  ? 'Start your first recovery session to see it here. Your progress will be tracked automatically.'
                  : 'No sessions in the selected time period. Try expanding the date range to see more history.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

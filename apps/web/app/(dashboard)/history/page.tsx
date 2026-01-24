'use client';

import { useState, useMemo } from 'react';
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
} from 'lucide-react';
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

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden card-shadow">
      {/* Session Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-6 text-left hover:bg-surface/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {formatRelativeDate(session.date)}
            </h3>
            <p className="text-sm text-muted">
              {formatDate(session.date)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Duration */}
          <div className="text-right">
            <div className="flex items-center gap-1 text-foreground">
              <Clock className="h-4 w-4 text-muted" />
              <span className="font-medium">{session.duration} min</span>
            </div>
          </div>

          {/* Completion */}
          <div className="text-right">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="font-medium text-foreground">
                {completedCount}/{totalCount}
              </span>
            </div>
            <p className="text-xs text-muted">{completionPercent}% complete</p>
          </div>

          {/* Pain Change */}
          <div className="text-right min-w-[80px]">
            <span
              className={`flex items-center justify-end gap-1 font-medium ${
                painReduction > 0
                  ? 'text-success'
                  : painReduction < 0
                  ? 'text-error'
                  : 'text-muted'
              }`}
            >
              {painReduction > 0 ? (
                <>
                  <TrendingDown className="h-4 w-4" />-{painReduction}
                </>
              ) : painReduction < 0 ? (
                <>+{Math.abs(painReduction)}</>
              ) : (
                'No change'
              )}
            </span>
            <p className="text-xs text-muted">
              {session.painBefore} to {session.painAfter}
            </p>
          </div>

          {/* Expand Icon */}
          <div className="text-muted">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-border bg-surface/50 p-6">
          <h4 className="text-sm font-medium text-muted mb-4">
            Exercises Completed
          </h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {session.exercises.map((exercise) => {
              const isComplete = exercise.setsCompleted === exercise.setsTarget;
              return (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-warning" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {exercise.name}
                      </p>
                      <p className="text-xs text-muted">
                        {exercise.setsCompleted}/{exercise.setsTarget} sets
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Session Stats */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted">Duration</p>
              <p className="text-lg font-semibold text-foreground">
                {session.duration} minutes
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted">Pain Before</p>
              <p className="text-lg font-semibold text-foreground">
                {session.painBefore}/10
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted">Pain After</p>
              <p className="text-lg font-semibold text-foreground">
                {session.painAfter}/10
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const appState = useAppState();
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '90d'>(
    'all'
  );

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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Session History</h1>
          <p className="mt-1 text-muted">
            Review your past recovery sessions and exercises.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Filter */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
            <Filter className="h-4 w-4 text-muted" />
            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value as 'all' | '7d' | '30d' | '90d')
              }
              className="bg-transparent text-sm text-foreground outline-none"
            >
              <option value="all">All time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6 card-shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {totalSessions}
              </p>
              <p className="text-sm text-muted">Total Sessions</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 card-shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {totalMinutes}
              </p>
              <p className="text-sm text-muted">Total Minutes</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 card-shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <TrendingDown className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                -{avgPainReduction.toFixed(1)}
              </p>
              <p className="text-sm text-muted">Avg Pain Reduction</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 card-shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {Math.round(completionRate * 100)}%
              </p>
              <p className="text-sm text-muted">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
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
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              No sessions found
            </h3>
            <p className="mt-2 text-sm text-muted">
              {dateFilter === 'all'
                ? 'Start your first recovery session to see it here.'
                : 'No sessions in the selected time period. Try expanding the date range.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

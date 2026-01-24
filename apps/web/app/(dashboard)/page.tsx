'use client';

import {
  Activity,
  Calendar,
  TrendingDown,
  CheckCircle2,
  Clock,
  ArrowRight,
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';
import { useAppState } from '../providers';

// Calculate statistics from mock data
function useStats() {
  const appState = useAppState();
  const { sessions, bodyRegions } = appState;

  // Sessions this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const sessionsThisWeek = sessions.filter(
    (s) => new Date(s.date) >= oneWeekAgo
  );

  // Completion rate
  const totalExercises = sessions.reduce(
    (acc, s) => acc + s.exercises.length,
    0
  );
  const completedExercises = sessions.reduce(
    (acc, s) =>
      acc +
      s.exercises.filter((e) => e.setsCompleted === e.setsTarget).length,
    0
  );
  const completionRate =
    totalExercises > 0
      ? Math.round((completedExercises / totalExercises) * 100)
      : 0;

  // Average pain trend (comparing first vs recent sessions)
  const avgPainBefore =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + s.painBefore, 0) / sessions.length
        )
      : 0;
  const avgPainAfter =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + s.painAfter, 0) / sessions.length
        )
      : 0;
  const painReduction = avgPainBefore - avgPainAfter;

  // Total minutes this week
  const totalMinutes = sessionsThisWeek.reduce((acc, s) => acc + s.duration, 0);

  // Active pain areas
  const activePainAreas = bodyRegions.filter((r) => r.painLevel > 0).length;

  return {
    sessionsThisWeek: sessionsThisWeek.length,
    completionRate,
    painReduction,
    totalMinutes,
    activePainAreas,
    avgPainLevel: Math.round(
      bodyRegions.reduce((acc, r) => acc + r.painLevel, 0) / bodyRegions.length
    ),
  };
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 card-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <div
          className={`rounded-lg p-3 ${
            trend === 'down'
              ? 'bg-success/10 text-success'
              : trend === 'up'
              ? 'bg-warning/10 text-warning'
              : 'bg-primary/10 text-primary'
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function RecentSessionCard({
  session,
}: {
  session: {
    id: string;
    date: Date;
    duration: number;
    exercises: { setsCompleted: number; setsTarget: number }[];
    painBefore: number;
    painAfter: number;
  };
}) {
  const completedExercises = session.exercises.filter(
    (e) => e.setsCompleted === e.setsTarget
  ).length;
  const totalExercises = session.exercises.length;
  const painDiff = session.painBefore - session.painAfter;

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 hover:bg-card transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Activity className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">
            {new Date(session.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p className="text-sm text-muted">
            {session.duration} min - {completedExercises}/{totalExercises}{' '}
            exercises
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`text-sm font-medium ${
            painDiff > 0 ? 'text-success' : 'text-muted'
          }`}
        >
          {painDiff > 0 ? `Pain -${painDiff}` : 'Pain unchanged'}
        </p>
        <p className="text-xs text-muted">
          {session.painBefore} to {session.painAfter}
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const appState = useAppState();
  const stats = useStats();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {appState.user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-muted">
          Here&apos;s your recovery summary for this week.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Sessions This Week"
          value={stats.sessionsThisWeek}
          subtitle="of 7 recommended"
          icon={Calendar}
          trend="neutral"
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          subtitle="exercises completed"
          icon={CheckCircle2}
          trend="neutral"
        />
        <StatCard
          title="Avg Pain Reduction"
          value={`-${stats.painReduction}`}
          subtitle="points per session"
          icon={TrendingDown}
          trend="down"
        />
        <StatCard
          title="Total Time"
          value={`${stats.totalMinutes}`}
          subtitle="minutes this week"
          icon={Clock}
          trend="neutral"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Sessions */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card card-shadow">
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Sessions
              </h2>
              <Link
                href="/history"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3 p-6">
              {appState.sessions.slice(0, 4).map((session) => (
                <RecentSessionCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions & Body Status */}
        <div className="space-y-6">
          {/* Body Status */}
          <div className="rounded-xl border border-border bg-card p-6 card-shadow">
            <h2 className="text-lg font-semibold text-foreground">
              Body Status
            </h2>
            <p className="mt-1 text-sm text-muted">
              {stats.activePainAreas} areas need attention
            </p>

            <div className="mt-4 space-y-3">
              {appState.bodyRegions
                .filter((r) => r.painLevel > 0)
                .sort((a, b) => b.painLevel - a.painLevel)
                .slice(0, 4)
                .map((region) => (
                  <div
                    key={region.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-foreground">{region.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-surface">
                        <div
                          className={`h-full rounded-full ${
                            region.painLevel >= 7
                              ? 'bg-error'
                              : region.painLevel >= 4
                              ? 'bg-warning'
                              : 'bg-success'
                          }`}
                          style={{ width: `${region.painLevel * 10}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted w-4">
                        {region.painLevel}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            <Link
              href="/body"
              className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-medium text-foreground hover:bg-surface transition-colors"
            >
              Update Body Map
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile App Link */}
          <div className="rounded-xl border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Mobile App</h3>
                <p className="text-sm text-muted">
                  Best for daily check-ins and workouts
                </p>
              </div>
            </div>
            <a
              href="#"
              className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              Download for iOS/Android
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

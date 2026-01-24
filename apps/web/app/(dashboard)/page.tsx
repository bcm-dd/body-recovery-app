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
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-shadow">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-muted truncate">{title}</p>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-foreground">{value}</p>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted truncate">{subtitle}</p>
        </div>
        <div
          className={`rounded-lg p-2 sm:p-3 ml-2 flex-shrink-0 ${
            trend === 'down'
              ? 'bg-success/10 text-success'
              : trend === 'up'
              ? 'bg-warning/10 text-warning'
              : 'bg-primary/10 text-primary'
          }`}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
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
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 sm:p-4 hover:bg-card transition-colors touch-target">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground text-sm sm:text-base truncate">
            {new Date(session.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p className="text-xs sm:text-sm text-muted truncate">
            {session.duration} min - {completedExercises}/{totalExercises}{' '}
            exercises
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-2">
        <p
          className={`text-xs sm:text-sm font-medium ${
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
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          Welcome back, {appState.user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm sm:text-base text-muted">
          Here&apos;s your recovery summary for this week.
        </p>
      </div>

      {/* Stats Grid - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
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

      {/* Content Grid - Stack on mobile */}
      <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3">
        {/* Recent Sessions */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="rounded-xl border border-border bg-card card-shadow">
            <div className="flex items-center justify-between border-b border-border p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Recent Sessions
              </h2>
              <Link
                href="/history"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline touch-target"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-2 sm:space-y-3 p-4 sm:p-6">
              {appState.sessions.slice(0, 4).map((session) => (
                <RecentSessionCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions & Body Status */}
        <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
          {/* Body Status */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-shadow">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Body Status
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted">
              {stats.activePainAreas} areas need attention
            </p>

            <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
              {appState.bodyRegions
                .filter((r) => r.painLevel > 0)
                .sort((a, b) => b.painLevel - a.painLevel)
                .slice(0, 4)
                .map((region) => (
                  <div
                    key={region.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs sm:text-sm text-foreground truncate mr-2">{region.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="h-2 w-12 sm:w-16 rounded-full bg-surface">
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
              className="mt-3 sm:mt-4 flex items-center justify-center gap-2 rounded-lg border border-border py-2.5 sm:py-2 text-sm font-medium text-foreground hover:bg-surface transition-colors touch-target"
            >
              Update Body Map
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile App Link */}
          <div className="rounded-xl border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary text-white flex-shrink-0">
                <Smartphone className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Mobile App</h3>
                <p className="text-xs sm:text-sm text-muted truncate">
                  Best for daily check-ins and workouts
                </p>
              </div>
            </div>
            <a
              href="#"
              className="mt-3 sm:mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 sm:py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors touch-target"
            >
              Download for iOS/Android
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

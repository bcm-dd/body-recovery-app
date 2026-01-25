'use client';

import {
  Activity,
  Calendar,
  TrendingDown,
  CheckCircle2,
  Clock,
  ArrowRight,
  Smartphone,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

import {
  AIAssistant,
  SmartSuggestion,
  AIPresenceIndicator,
  ReadinessCard,
  EncouragementBanner,
  TimeAwareGreeting,
} from '../../src/components';
import { VisuallyHidden } from '../../src/components/A11y';
import { useAmbientAI, useAmbientGreeting, usePatternInsights, useReadinessInsight } from '../../src/hooks';
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
  glowColor,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  glowColor?: 'primary' | 'cyan' | 'success' | 'warning';
}) {
  const glowClasses = {
    primary: 'from-[var(--primary)] to-[#818cf8]',
    cyan: 'from-cyan-500 to-blue-500',
    success: 'from-emerald-500 to-green-500',
    warning: 'from-amber-500 to-orange-500',
  };

  const bgClasses = {
    primary: 'bg-[var(--primary)]/10',
    cyan: 'bg-cyan-500/10',
    success: 'bg-emerald-500/10',
    warning: 'bg-amber-500/10',
  };

  const textClasses = {
    primary: 'text-[var(--primary)]',
    cyan: 'text-cyan-500',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
  };

  const auroraClasses = {
    primary: 'from-[var(--aurora-1)] to-transparent',
    cyan: 'from-[var(--aurora-2)] to-transparent',
    success: 'from-[var(--aurora-5)] to-transparent',
    warning: 'from-[var(--aurora-6)] to-transparent',
  };

  const color = glowColor || 'primary';
  const statId = `stat-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <article
      className="glass-stat-card p-4 sm:p-6 hover-lift micro-bounce relative overflow-hidden group"
      aria-labelledby={statId}
    >
      {/* Aurora background effect */}
      <div
        className={`absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br ${auroraClasses[color]} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-60`}
        aria-hidden="true"
      />

      {/* Specular highlight */}
      <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[var(--specular-soft)] to-transparent opacity-50" aria-hidden="true" />

      <div className="flex items-start justify-between relative z-10">
        <div className="min-w-0 flex-1">
          <h3
            id={statId}
            className="text-xs sm:text-sm font-medium text-[var(--text-muted)] truncate"
          >
            {title}
          </h3>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-foreground transition-transform duration-300 group-hover:scale-105 origin-left">
            {value}
          </p>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[var(--text-muted)] truncate">
            {subtitle}
          </p>
        </div>
        <div
          className={`relative rounded-xl p-2.5 sm:p-3.5 ml-2 flex-shrink-0 ${bgClasses[color]} transition-all duration-300 group-hover:scale-110`}
          aria-hidden="true"
        >
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 relative z-10 ${textClasses[color]} transition-transform duration-300 group-hover:rotate-12`} />
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-br ${glowClasses[color]} opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-40`}
          />
          {/* Inner specular */}
          <div className="absolute top-0 left-[20%] right-[20%] h-px rounded-full bg-white/20" />
        </div>
      </div>
    </article>
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

  const formattedDate = new Date(session.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <article
      className="glass-panel-subtle flex items-center justify-between rounded-xl p-3 sm:p-4 hover:bg-[var(--glass-bg)] transition-all duration-300 touch-target micro-bounce relative overflow-hidden group"
      aria-label={`Session on ${formattedDate}: ${completedExercises} of ${totalExercises} exercises completed, pain ${painDiff > 0 ? `reduced by ${painDiff}` : 'unchanged'}`}
    >
      {/* Hover glow effect */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[var(--aurora-1)] via-transparent to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
        aria-hidden="true"
      />

      <div className="flex items-center gap-3 sm:gap-4 min-w-0 relative z-10">
        <div
          className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[#818cf8]/20 flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
          aria-hidden="true"
        >
          <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--primary)] transition-transform duration-300 group-hover:rotate-6" />
          {/* Pulse indicator on hover */}
          <div className="absolute inset-0 rounded-xl bg-[var(--primary)]/20 animate-ping opacity-0 group-hover:opacity-50" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground text-sm sm:text-base truncate">
            {formattedDate}
          </p>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] truncate">
            {session.duration} min - {completedExercises}/{totalExercises}{' '}
            exercises
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-2 relative z-10">
        <p
          className={`text-xs sm:text-sm font-medium transition-all duration-300 ${
            painDiff > 0 ? 'text-emerald-500 group-hover:scale-110' : 'text-[var(--text-muted)]'
          }`}
        >
          {painDiff > 0 ? `Pain -${painDiff}` : 'Pain unchanged'}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          {session.painBefore} to {session.painAfter}
        </p>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const appState = useAppState();
  const stats = useStats();

  // Use ambient AI for contextual insights
  const {
    allInsights,
    dismissInsight,
    context,
    dailyInsight,
    readinessScore,
    suggestedIntensity,
    suggestedDuration,
    trackInsightClick,
  } = useAmbientAI({
    sessions: appState.sessions,
    bodyRegions: appState.bodyRegions,
    location: 'dashboard',
  });

  // Enhanced greeting with context
  const { greeting, subtext } = useAmbientGreeting(appState.user?.name, context);

  // Get pattern insights
  const patternInsights = usePatternInsights(context);

  // Get readiness insight
  const readinessInsight = useReadinessInsight(context);

  // Get the primary insight for the banner (use daily insight if available)
  const primaryInsight = dailyInsight || allInsights.find((i) => i.priority === 'high' || i.priority === 'medium');
  const secondaryInsights = allInsights.filter((i) => i !== primaryInsight).slice(0, 2);

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Page Header with Context-Aware Greeting */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {greeting}
            </h1>
            <Sparkles
              className="h-5 w-5 text-[var(--primary)] animate-pulse"
              aria-hidden="true"
            />
          </div>
          <p className="mt-1 text-sm sm:text-base text-[var(--text-muted)]">
            {subtext}
          </p>
          {/* Pattern insights - subtle display */}
          {patternInsights.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {patternInsights.slice(0, 2).map((insight, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-xs text-muted bg-surface/50 px-2 py-1 rounded-full"
                >
                  <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
                  {insight}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* Readiness Quick View */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
            readinessScore >= 70 ? 'bg-emerald-500/10' :
            readinessScore >= 40 ? 'bg-amber-500/10' : 'bg-rose-500/10'
          }`}>
            <div className={`text-lg font-bold ${
              readinessScore >= 70 ? 'text-emerald-500' :
              readinessScore >= 40 ? 'text-amber-500' : 'text-rose-500'
            }`}>
              {readinessScore}
            </div>
            <div className="text-xs">
              <p className={`font-medium ${
                readinessScore >= 70 ? 'text-emerald-500' :
                readinessScore >= 40 ? 'text-amber-500' : 'text-rose-500'
              }`}>
                {readinessInsight.readinessLabel}
              </p>
              <p className="text-muted">Readiness</p>
            </div>
          </div>
        </div>
      </header>

      {/* Primary AI Insight Banner */}
      {primaryInsight && (
        <section aria-label="AI Insight">
          <SmartSuggestion
            insight={primaryInsight}
            onDismiss={dismissInsight}
            onActionClick={trackInsightClick}
            variant="banner"
          />
        </section>
      )}

      {/* Encouragement Banner - Shows when appropriate */}
      {context.sessionStreak >= 3 || context.painTrend === 'improving' ? (
        <EncouragementBanner context={context} />
      ) : null}

      {/* Stats Grid - Glass Cards with Glow */}
      <section aria-labelledby="stats-heading">
        <VisuallyHidden as="h2" id="stats-heading">
          Weekly Statistics
        </VisuallyHidden>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4 stagger-in">
          <StatCard
            title="Sessions This Week"
            value={stats.sessionsThisWeek}
            subtitle="of 7 recommended"
            icon={Calendar}
            trend="neutral"
            glowColor="primary"
          />
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            subtitle="exercises completed"
            icon={CheckCircle2}
            trend="neutral"
            glowColor="success"
          />
          <StatCard
            title="Avg Pain Reduction"
            value={`-${stats.painReduction}`}
            subtitle="points per session"
            icon={TrendingDown}
            trend="down"
            glowColor="cyan"
          />
          <StatCard
            title="Total Time"
            value={`${stats.totalMinutes}`}
            subtitle="minutes this week"
            icon={Clock}
            trend="neutral"
            glowColor="warning"
          />
        </div>
      </section>

      {/* Content Grid - Stack on mobile */}
      <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3">
        {/* Recent Sessions - Glass Card */}
        <section
          className="lg:col-span-2 order-2 lg:order-1"
          aria-labelledby="recent-sessions-heading"
        >
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--glass-border)] p-4 sm:p-6 relative z-10">
              <div className="flex items-center gap-2">
                <Zap
                  className="h-5 w-5 text-[var(--primary)]"
                  aria-hidden="true"
                />
                <h2
                  id="recent-sessions-heading"
                  className="text-base sm:text-lg font-semibold text-foreground"
                >
                  Recent Sessions
                </h2>
              </div>
              <Link
                href="/history"
                className="flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors touch-target group"
              >
                View all sessions
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
            <div className="space-y-2 sm:space-y-3 p-4 sm:p-6 relative z-10">
              {appState.sessions.length > 0 ? (
                appState.sessions.slice(0, 4).map((session) => (
                  <RecentSessionCard key={session.id} session={session} />
                ))
              ) : (
                <p className="text-center text-[var(--text-muted)] py-8">
                  No sessions recorded yet. Start your first recovery session to
                  see your progress here.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions & Body Status */}
        <aside className="space-y-4 sm:space-y-6 order-1 lg:order-2">
          {/* AI Assistant - Contextual Insights with Chat */}
          <AIAssistant
            insights={secondaryInsights}
            onDismiss={dismissInsight}
            userName={appState.user?.name}
            context={context}
            showChat={true}
          />

          {/* Body Status - Glass Card with Glow Border */}
          <section
            className="glass-card-glow p-4 sm:p-6"
            aria-labelledby="body-status-heading"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <h2
                  id="body-status-heading"
                  className="text-base sm:text-lg font-semibold text-foreground"
                >
                  Body Status
                </h2>
                <span
                  className="glass-badge-primary"
                  aria-label={`${stats.activePainAreas} areas need attention`}
                >
                  {stats.activePainAreas} areas
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-[var(--text-muted)]">
                Areas needing attention
              </p>

              <div
                className="mt-3 sm:mt-4 space-y-2 sm:space-y-3"
                role="list"
                aria-label="Pain levels by body region"
              >
                {appState.bodyRegions
                  .filter((r) => r.painLevel > 0)
                  .sort((a, b) => b.painLevel - a.painLevel)
                  .slice(0, 4)
                  .map((region) => (
                    <div
                      key={region.id}
                      className="flex items-center justify-between"
                      role="listitem"
                    >
                      <span className="text-xs sm:text-sm text-foreground truncate mr-2">
                        {region.name}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div
                          className="h-2 w-12 sm:w-16 rounded-full glass-progress"
                          role="progressbar"
                          aria-valuenow={region.painLevel}
                          aria-valuemin={0}
                          aria-valuemax={10}
                          aria-label={`${region.name} pain level: ${region.painLevel} out of 10`}
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              region.painLevel >= 7
                                ? 'bg-gradient-to-r from-red-500 to-rose-500'
                                : region.painLevel >= 4
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                : 'bg-gradient-to-r from-emerald-500 to-green-500'
                            }`}
                            style={{ width: `${region.painLevel * 10}%` }}
                          />
                        </div>
                        <span
                          className="text-xs text-[var(--text-muted)] w-4"
                          aria-hidden="true"
                        >
                          {region.painLevel}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              <Link
                href="/body"
                className="mt-3 sm:mt-4 flex items-center justify-center gap-2 rounded-xl glass-button-ghost py-2.5 sm:py-3 text-sm font-medium text-foreground touch-target group"
              >
                Update Body Map
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </section>

          {/* Mobile App Link - Premium Glass Card */}
          <section
            className="glass-card overflow-hidden"
            aria-labelledby="mobile-app-heading"
          >
            <div
              className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 via-transparent to-[#818cf8]/10"
              aria-hidden="true"
            />
            <div className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center gap-3">
                <div
                  className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[#818cf8] flex-shrink-0 glow-pulse"
                  aria-hidden="true"
                >
                  <Smartphone className="h-6 w-6 sm:h-7 sm:w-7 text-white relative z-10" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[#818cf8] blur-lg opacity-50" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2
                      id="mobile-app-heading"
                      className="font-semibold text-foreground text-sm sm:text-base"
                    >
                      Mobile App
                    </h2>
                    <span className="glass-badge-primary text-[10px]">New</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] truncate">
                    Best for daily check-ins and workouts
                  </p>
                </div>
              </div>
              <a
                href="#"
                className="mt-4 sm:mt-5 liquid-button flex items-center justify-center gap-2 py-3 sm:py-3.5 text-sm font-semibold text-white touch-target"
                aria-label="Download Recovery app for iOS and Android devices"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Download for iOS/Android
              </a>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

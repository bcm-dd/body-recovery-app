'use client';

import {
  TrendingDown,
  TrendingUp,
  Download,
  Activity,
  Target,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useMemo, useId, useCallback } from 'react';
import type { ComponentType } from 'react';

import { SmartSuggestion, LazyChartWrapper } from '../../../src/components';
import { VisuallyHidden, LiveRegion } from '../../../src/components/A11y';
import { useAmbientAI } from '../../../src/hooks';
import { useAppState } from '../../providers';

// ============================================
// LAZY LOADED RECHARTS - Reduces initial bundle by ~150KB
// ============================================

const LazyResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })) as Promise<{ default: ComponentType<any> }>,
  { ssr: false }
);

const LazyAreaChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.AreaChart })) as Promise<{ default: ComponentType<any> }>,
  { ssr: false }
);

const LazyBarChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.BarChart })) as Promise<{ default: ComponentType<any> }>,
  { ssr: false }
);

const LazyLine = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Line })) as Promise<{ default: ComponentType<any> }>,
  { ssr: false }
);

const LazyArea = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Area })) as Promise<{ default: ComponentType<any> }>,
  { ssr: false }
);

const LazyBar = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Bar })) as Promise<{ default: ComponentType<any> }>,
  { ssr: false }
);

const LazyXAxis = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.XAxis })) as Promise<{ default: ComponentType<any> }>,
  { ssr: false }
);

const LazyYAxis = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.YAxis })) as Promise<{ default: ComponentType<any> }>,
  { ssr: false }
);

const LazyCartesianGrid = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.CartesianGrid })) as Promise<{ default: ComponentType<any> }>,
  { ssr: false }
);

const LazyTooltip = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Tooltip })) as Promise<{ default: ComponentType<any> }>,
  { ssr: false }
);

const LazyLegend = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Legend })) as Promise<{ default: ComponentType<any> }>,
  { ssr: false }
);

type DateRange = '7d' | '14d' | '30d' | '90d';

function generateMockTrendData(range: DateRange) {
  const days = range === '7d' ? 7 : range === '14d' ? 14 : range === '30d' ? 30 : 90;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Generate somewhat realistic pain trend data (gradually improving)
    const baseLevel = 6 - (days - i) * 0.05;
    const variation = Math.random() * 1.5 - 0.75;
    const painLevel = Math.max(1, Math.min(10, baseLevel + variation));

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pain: Math.round(painLevel * 10) / 10,
      sessionsCompleted: Math.random() > 0.2 ? 1 : 0,
    });
  }

  return data;
}

function generateRegionData() {
  const regions = [
    'Lower Back',
    'Left Shoulder',
    'Right Knee',
    'Neck',
    'Left Hip',
  ];

  return regions.map((name) => ({
    name,
    current: Math.round(Math.random() * 5 + 1),
    previous: Math.round(Math.random() * 7 + 2),
    change: 0,
  })).map((r) => ({
    ...r,
    change: r.previous - r.current,
  }));
}

// Custom tooltip with glass effect
const GlassTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-tooltip p-3 shadow-lg" role="tooltip">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs text-[var(--text-muted)]">
            {entry.name}: <span className="font-semibold text-foreground">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProgressPage() {
  const appState = useAppState();
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [announcement, setAnnouncement] = useState('');
  const _dateRangeId = useId(); // Used for accessibility - prefixed with _ to indicate intentionally unused
  const chartDescriptionId = useId();

  const trendData = useMemo(() => generateMockTrendData(dateRange), [dateRange]);
  const regionData = useMemo(() => generateRegionData(), []);

  // Use ambient AI for contextual insights
  const { smartSuggestions, dismissInsight, context: _context } = useAmbientAI({
    sessions: appState.sessions,
    bodyRegions: appState.bodyRegions,
    location: 'progress',
  });

  // Calculate stats
  const avgPain = trendData.reduce((acc, d) => acc + d.pain, 0) / trendData.length;
  const firstWeekAvg = trendData.slice(0, 7).reduce((acc, d) => acc + d.pain, 0) / 7;
  const lastWeekAvg = trendData.slice(-7).reduce((acc, d) => acc + d.pain, 0) / 7;
  const painChange = ((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100;
  const totalSessions = trendData.filter((d) => d.sessionsCompleted).length;

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
    const rangeLabel = range === '7d' ? '7 days' : range === '14d' ? '14 days' : range === '30d' ? '30 days' : '90 days';
    setAnnouncement(`Date range changed to ${rangeLabel}. Charts and statistics updated.`);
  }, []);

  const handleExportData = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      user: appState.user,
      dateRange,
      painTrend: trendData,
      bodyRegions: appState.bodyRegions,
      sessions: appState.sessions,
      regionBreakdown: regionData,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recovery-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setAnnouncement('Progress data exported successfully.');
  }, [appState, dateRange, trendData, regionData]);

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Live region for announcements */}
      <LiveRegion aria-live="polite" clearAfter={5000}>
        {announcement}
      </LiveRegion>

      {/* Page Header - Glass Effect */}
      <header className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          <div>
            <h1 className="heading-premium text-xl sm:text-2xl">Progress</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Track your recovery journey and pain trends over time.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Date Range Selector - Glass Pills */}
          <fieldset className="flex items-center gap-1 glass-panel-subtle rounded-xl p-1 overflow-x-auto scrollbar-hide">
            <legend className="sr-only">Select date range for progress data</legend>
            {(['7d', '14d', '30d', '90d'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => handleDateRangeChange(range)}
                className={`rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap touch-target ${
                  dateRange === range
                    ? 'liquid-button text-white'
                    : 'text-[var(--text-muted)] hover:text-foreground hover:bg-[var(--glass-bg)]'
                }`}
                aria-pressed={dateRange === range}
                aria-label={`Show data for ${range === '7d' ? '7 days' : range === '14d' ? '14 days' : range === '30d' ? '30 days' : '90 days'}`}
              >
                {range}
              </button>
            ))}
          </fieldset>
          <button
            onClick={handleExportData}
            className="button-premium flex items-center justify-center gap-2 rounded-xl px-4 py-3 sm:py-3 text-sm font-semibold text-white touch-target min-h-[48px]"
            aria-label="Export all progress data as JSON file"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export Data
          </button>
        </div>
      </header>

      {/* Stats Cards - Glass with Glow */}
      <section aria-labelledby="stats-overview-heading">
        <VisuallyHidden as="h2" id="stats-overview-heading">
          Statistics Overview
        </VisuallyHidden>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4 stagger-in">
          <article className="glass-stat-card-premium p-4 sm:p-6 hover-lift rounded-2xl" aria-labelledby="avg-pain-stat">
            <div className="flex items-center gap-2">
              <div className="relative rounded-lg p-2 bg-[var(--primary)]/10" aria-hidden="true">
                <Activity className="h-4 w-4 text-[var(--primary)] relative z-10" />
                <div className="absolute inset-0 rounded-lg bg-[var(--primary)] opacity-20 blur-sm" />
              </div>
              <h3 id="avg-pain-stat" className="text-xs sm:text-sm font-medium text-[var(--text-muted)]">Average Pain Level</h3>
            </div>
            <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold text-foreground">
              {avgPain.toFixed(1)}
            </p>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[var(--text-muted)]">out of 10</p>
          </article>

          <article className="glass-stat-card-premium p-4 sm:p-6 hover-lift rounded-2xl" aria-labelledby="pain-trend-stat">
            <div className="flex items-center gap-2">
              <div className={`relative rounded-lg p-2 ${painChange < 0 ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`} aria-hidden="true">
                {painChange < 0 ? (
                  <TrendingDown className="h-4 w-4 text-emerald-500 relative z-10" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-amber-500 relative z-10" />
                )}
                <div className={`absolute inset-0 rounded-lg ${painChange < 0 ? 'bg-emerald-500' : 'bg-amber-500'} opacity-20 blur-sm`} />
              </div>
              <h3 id="pain-trend-stat" className="text-xs sm:text-sm font-medium text-[var(--text-muted)]">Pain Trend</h3>
            </div>
            <div className="mt-2 sm:mt-3 flex items-baseline gap-1 sm:gap-2 flex-wrap">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {Math.abs(painChange).toFixed(0)}%
              </p>
              {painChange < 0 ? (
                <span className="glass-badge-success text-xs" aria-label="decreased">
                  decrease
                </span>
              ) : (
                <span className="glass-badge-warning text-xs" aria-label="increased">
                  increase
                </span>
              )}
            </div>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[var(--text-muted)]">vs start of period</p>
          </article>

          <article className="glass-stat-card-premium p-4 sm:p-6 hover-lift rounded-2xl" aria-labelledby="sessions-stat">
            <div className="flex items-center gap-2">
              <div className="relative rounded-lg p-2 bg-cyan-500/10" aria-hidden="true">
                <Target className="h-4 w-4 text-cyan-500 relative z-10" />
                <div className="absolute inset-0 rounded-lg bg-cyan-500 opacity-20 blur-sm" />
              </div>
              <h3 id="sessions-stat" className="text-xs sm:text-sm font-medium text-[var(--text-muted)]">Sessions Completed</h3>
            </div>
            <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold text-foreground">
              {totalSessions}
            </p>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[var(--text-muted)]">
              of {trendData.length} days ({Math.round((totalSessions / trendData.length) * 100)}%)
            </p>
          </article>

          <article className="glass-stat-card-premium p-4 sm:p-6 hover-lift rounded-2xl" aria-labelledby="active-areas-stat">
            <div className="flex items-center gap-2">
              <div className="relative rounded-lg p-2 bg-rose-500/10" aria-hidden="true">
                <Sparkles className="h-4 w-4 text-rose-500 relative z-10" />
                <div className="absolute inset-0 rounded-lg bg-rose-500 opacity-20 blur-sm" />
              </div>
              <h3 id="active-areas-stat" className="text-xs sm:text-sm font-medium text-[var(--text-muted)]">Active Pain Areas</h3>
            </div>
            <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold text-foreground">
              {appState.bodyRegions.filter((r) => r.painLevel > 0).length}
            </p>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[var(--text-muted)]">regions need attention</p>
          </article>
        </div>
      </section>

      {/* AI Progress Insights */}
      {smartSuggestions.length > 0 && (
        <section aria-label="AI Progress Insights" className="space-y-3">
          {smartSuggestions.slice(0, 1).map((insight) => (
            <SmartSuggestion
              key={insight.id}
              insight={insight}
              onDismiss={dismissInsight}
              variant="compact"
            />
          ))}
        </section>
      )}

      {/* Charts - Premium Liquid Glass Containers */}
      <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-2">
        {/* Pain Trend Chart - Premium Glass */}
        <section className="glass-card-luxury p-4 sm:p-6 relative overflow-hidden group rounded-2xl" aria-labelledby="pain-trend-chart-heading">
          {/* Aurora background effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-br from-[var(--aurora-1)] to-transparent blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br from-[var(--aurora-2)] to-transparent blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
          </div>

          {/* Specular highlight */}
          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[var(--specular-soft)] to-transparent opacity-50" aria-hidden="true" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-[var(--primary)] to-cyan-500" aria-hidden="true" />
              <h2 id="pain-trend-chart-heading" className="text-base sm:text-lg font-semibold text-foreground">
                Pain Trend Over Time
              </h2>
            </div>
            <p id={`${chartDescriptionId}-pain`} className="text-xs sm:text-sm text-[var(--text-muted)]">
              Daily average pain level
            </p>

            {/* Screen reader accessible data summary */}
            <VisuallyHidden>
              <p>
                Pain trend chart showing data from the last {dateRange === '7d' ? '7' : dateRange === '14d' ? '14' : dateRange === '30d' ? '30' : '90'} days.
                Average pain level: {avgPain.toFixed(1)} out of 10.
                Trend: {painChange < 0 ? 'decreasing' : painChange > 0 ? 'increasing' : 'stable'} by {Math.abs(painChange).toFixed(0)}%.
              </p>
            </VisuallyHidden>

            <LazyChartWrapper height="256px">
              <div className="mt-4 sm:mt-6 h-48 sm:h-64" role="img" aria-describedby={`${chartDescriptionId}-pain`}>
                <LazyResponsiveContainer width="100%" height="100%">
                  <LazyAreaChart data={trendData} margin={{ left: -20, right: 10 }}>
                    <defs>
                      <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                    <LazyXAxis
                      dataKey="date"
                      stroke="var(--text-muted)"
                      fontSize={10}
                      tickLine={false}
                      interval="preserveStartEnd"
                      tick={{ fontSize: 10 }}
                    />
                    <LazyYAxis
                      domain={[0, 10]}
                      stroke="var(--text-muted)"
                      fontSize={10}
                      tickLine={false}
                      width={30}
                      tick={{ fontSize: 10 }}
                      label={{ value: 'Pain Level', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: 'var(--text-muted)' } }}
                    />
                    <LazyTooltip content={<GlassTooltip />} />
                    <LazyArea
                      type="monotone"
                      dataKey="pain"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fill="url(#painGradient)"
                      name="Pain Level"
                    />
                    <LazyLine
                      type="monotone"
                      dataKey="pain"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'white', strokeWidth: 2 }}
                      name="Pain Level"
                    />
                  </LazyAreaChart>
                </LazyResponsiveContainer>
              </div>
            </LazyChartWrapper>
          </div>
        </section>

        {/* Region Breakdown - Premium Glass */}
        <section className="glass-card-luxury p-4 sm:p-6 relative overflow-hidden group rounded-2xl" aria-labelledby="region-chart-heading">
          {/* Aurora background effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br from-[var(--aurora-2)] to-transparent blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-br from-[var(--aurora-5)] to-transparent blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
          </div>

          {/* Specular highlight */}
          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[var(--specular-soft)] to-transparent opacity-50" aria-hidden="true" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 shadow-lg shadow-cyan-500/30" aria-hidden="true" />
              <h2 id="region-chart-heading" className="text-base sm:text-lg font-semibold text-foreground">
                Pain by Region
              </h2>
            </div>
            <p id={`${chartDescriptionId}-region`} className="text-xs sm:text-sm text-[var(--text-muted)]">
              Current vs previous period
            </p>

            {/* Screen reader accessible data summary */}
            <VisuallyHidden>
              <p>
                Bar chart comparing current and previous pain levels by body region.
                {regionData.map((r) => `${r.name}: current ${r.current}, previous ${r.previous}, ${r.change > 0 ? 'improved' : r.change < 0 ? 'worsened' : 'stable'}`).join('. ')}
              </p>
            </VisuallyHidden>

            <LazyChartWrapper height="256px">
              <div className="mt-4 sm:mt-6 h-48 sm:h-64" role="img" aria-describedby={`${chartDescriptionId}-region`}>
                <LazyResponsiveContainer width="100%" height="100%">
                  <LazyBarChart data={regionData} layout="vertical" margin={{ left: 0, right: 10 }}>
                    <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                    <LazyXAxis
                      type="number"
                      domain={[0, 10]}
                      stroke="var(--text-muted)"
                      fontSize={10}
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                      label={{ value: 'Pain Level', position: 'bottom', style: { fontSize: 10, fill: 'var(--text-muted)' } }}
                    />
                    <LazyYAxis
                      type="category"
                      dataKey="name"
                      stroke="var(--text-muted)"
                      fontSize={10}
                      tickLine={false}
                      width={70}
                      tick={{ fontSize: 10 }}
                    />
                    <LazyTooltip content={<GlassTooltip />} />
                    <LazyLegend
                      wrapperStyle={{ fontSize: '12px' }}
                      iconSize={10}
                    />
                    <LazyBar
                      dataKey="previous"
                      name="Previous"
                      fill="var(--text-muted)"
                      radius={[0, 4, 4, 0]}
                      opacity={0.5}
                    />
                    <LazyBar
                      dataKey="current"
                      name="Current"
                      fill="var(--primary)"
                      radius={[0, 4, 4, 0]}
                    />
                  </LazyBarChart>
                </LazyResponsiveContainer>
              </div>
            </LazyChartWrapper>
          </div>
        </section>
      </div>

      {/* Region Details Table - Premium Glass Table */}
      <section className="glass-card-luxury overflow-hidden relative rounded-2xl" aria-labelledby="region-table-heading">
        {/* Subtle aurora effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/4 w-1/2 h-1/4 rounded-full bg-gradient-to-b from-[var(--aurora-3)] to-transparent blur-3xl opacity-25" />
        </div>

        {/* Specular highlight */}
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[var(--specular-soft)] to-transparent opacity-40" aria-hidden="true" />

        <div className="border-b border-[var(--glass-border)] p-4 sm:p-6 relative z-10">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 shadow-lg shadow-rose-500/30" aria-hidden="true" />
            <h2 id="region-table-heading" className="text-base sm:text-lg font-semibold text-foreground">
              Region-by-Region Breakdown
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-muted)]">
            Detailed view of pain levels across all tracked body regions
          </p>
        </div>

        {/* Mobile card view */}
        <div className="block sm:hidden divide-y divide-[var(--glass-border)]" role="list" aria-label="Pain levels by body region">
          {regionData.map((region) => (
            <article
              key={region.name}
              className="p-4 space-y-3 hover:bg-[var(--glass-bg-subtle)] transition-colors"
              role="listitem"
              aria-label={`${region.name}: Current pain level ${region.current}, previous ${region.previous}, ${region.change > 0 ? 'improving' : region.change < 0 ? 'worsening' : 'stable'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{region.name}</span>
                <span
                  className={`glass-badge text-xs ${
                    region.change > 0
                      ? 'glass-badge-success'
                      : region.change < 0
                      ? 'glass-badge-error'
                      : ''
                  }`}
                >
                  {region.change > 0
                    ? 'Improving'
                    : region.change < 0
                    ? 'Worsening'
                    : 'Stable'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
                    <span>Current</span>
                    <span aria-hidden="true">{region.current}/10</span>
                  </div>
                  <div
                    className="h-2 w-full rounded-full glass-progress"
                    role="progressbar"
                    aria-valuenow={region.current}
                    aria-valuemin={0}
                    aria-valuemax={10}
                    aria-label={`Current pain level for ${region.name}`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        region.current >= 7
                          ? 'bg-gradient-to-r from-red-500 to-rose-500'
                          : region.current >= 4
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : 'bg-gradient-to-r from-emerald-500 to-green-500'
                      }`}
                      style={{ width: `${region.current * 10}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">Previous: {region.previous}</span>
                <span
                  className={`flex items-center gap-1 font-medium ${
                    region.change > 0
                      ? 'text-emerald-500'
                      : region.change < 0
                      ? 'text-rose-500'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  {region.change > 0 ? (
                    <>
                      <TrendingDown className="h-4 w-4" aria-hidden="true" />
                      <span>-{region.change}</span>
                    </>
                  ) : region.change < 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4" aria-hidden="true" />
                      <span>+{Math.abs(region.change)}</span>
                    </>
                  ) : (
                    'No change'
                  )}
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Desktop table view */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full" aria-describedby="region-table-heading">
            <caption className="sr-only">
              Pain levels by body region showing current level, previous level, change, and status
            </caption>
            <thead className="glass-table-header">
              <tr>
                <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-medium text-[var(--text-muted)]">
                  Region
                </th>
                <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-medium text-[var(--text-muted)]">
                  Current Level
                </th>
                <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-medium text-[var(--text-muted)]">
                  Previous Level
                </th>
                <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-medium text-[var(--text-muted)]">
                  Change
                </th>
                <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-medium text-[var(--text-muted)]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {regionData.map((region) => (
                <tr key={region.name} className="glass-table-row">
                  <th scope="row" className="px-4 md:px-6 py-3 sm:py-4 text-sm font-medium text-foreground whitespace-nowrap">
                    {region.name}
                  </th>
                  <td className="px-4 md:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-12 sm:w-16 rounded-full glass-progress"
                        role="progressbar"
                        aria-valuenow={region.current}
                        aria-valuemin={0}
                        aria-valuemax={10}
                        aria-label={`${region.name} current pain level: ${region.current} out of 10`}
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            region.current >= 7
                              ? 'bg-gradient-to-r from-red-500 to-rose-500'
                              : region.current >= 4
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                              : 'bg-gradient-to-r from-emerald-500 to-green-500'
                          }`}
                          style={{ width: `${region.current * 10}%` }}
                        />
                      </div>
                      <span className="text-sm text-foreground" aria-hidden="true">
                        {region.current}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 sm:py-4 text-sm text-[var(--text-muted)]">
                    {region.previous}
                  </td>
                  <td className="px-4 md:px-6 py-3 sm:py-4">
                    <span
                      className={`flex items-center gap-1 text-sm font-medium ${
                        region.change > 0
                          ? 'text-emerald-500'
                          : region.change < 0
                          ? 'text-rose-500'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {region.change > 0 ? (
                        <>
                          <TrendingDown className="h-4 w-4" aria-hidden="true" />
                          <span aria-label={`Decreased by ${region.change}`}>-{region.change}</span>
                        </>
                      ) : region.change < 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4" aria-hidden="true" />
                          <span aria-label={`Increased by ${Math.abs(region.change)}`}>+{Math.abs(region.change)}</span>
                        </>
                      ) : (
                        'No change'
                      )}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 sm:py-4">
                    <span
                      className={`glass-badge text-xs ${
                        region.change > 0
                          ? 'glass-badge-success'
                          : region.change < 0
                          ? 'glass-badge-error'
                          : ''
                      }`}
                    >
                      {region.change > 0
                        ? 'Improving'
                        : region.change < 0
                        ? 'Worsening'
                        : 'Stable'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

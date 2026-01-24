'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Calendar,
  Download,
  Filter,
} from 'lucide-react';
import { useAppState } from '../../providers';

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

export default function ProgressPage() {
  const appState = useAppState();
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const trendData = useMemo(() => generateMockTrendData(dateRange), [dateRange]);
  const regionData = useMemo(() => generateRegionData(), []);

  // Calculate stats
  const avgPain = trendData.reduce((acc, d) => acc + d.pain, 0) / trendData.length;
  const firstWeekAvg = trendData.slice(0, 7).reduce((acc, d) => acc + d.pain, 0) / 7;
  const lastWeekAvg = trendData.slice(-7).reduce((acc, d) => acc + d.pain, 0) / 7;
  const painChange = ((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100;
  const totalSessions = trendData.filter((d) => d.sessionsCompleted).length;

  const handleExportData = () => {
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
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Page Header - Responsive */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Progress</h1>
          <p className="mt-1 text-sm text-muted">
            Track your recovery journey and pain trends over time.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Date Range Selector - Scrollable on mobile */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1 overflow-x-auto scrollbar-hide">
            {(['7d', '14d', '30d', '90d'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`rounded-md px-3 py-2 sm:py-1.5 text-sm font-medium transition-colors whitespace-nowrap touch-target ${
                  dateRange === range
                    ? 'bg-primary text-white'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button
            onClick={handleExportData}
            className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 sm:py-2 text-sm font-medium text-foreground hover:bg-card transition-colors touch-target"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Cards - 2x2 grid on mobile */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-shadow">
          <p className="text-xs sm:text-sm font-medium text-muted">Average Pain Level</p>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-foreground">
            {avgPain.toFixed(1)}
          </p>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted">out of 10</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-shadow">
          <p className="text-xs sm:text-sm font-medium text-muted">Pain Trend</p>
          <div className="mt-1 sm:mt-2 flex items-baseline gap-1 sm:gap-2 flex-wrap">
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              {Math.abs(painChange).toFixed(0)}%
            </p>
            {painChange < 0 ? (
              <span className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm text-success">
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">decrease</span>
              </span>
            ) : (
              <span className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm text-warning">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">increase</span>
              </span>
            )}
          </div>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted">vs start of period</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-shadow">
          <p className="text-xs sm:text-sm font-medium text-muted">Sessions Completed</p>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-foreground">
            {totalSessions}
          </p>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted">
            of {trendData.length} days ({Math.round((totalSessions / trendData.length) * 100)}%)
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-shadow">
          <p className="text-xs sm:text-sm font-medium text-muted">Active Pain Areas</p>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-foreground">
            {appState.bodyRegions.filter((r) => r.painLevel > 0).length}
          </p>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted">regions need attention</p>
        </div>
      </div>

      {/* Charts - Stack on mobile */}
      <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-2">
        {/* Pain Trend Chart */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-shadow">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            Pain Trend Over Time
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Daily average pain level
          </p>

          <div className="mt-4 sm:mt-6 h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  fontSize={10}
                  tickLine={false}
                  interval="preserveStartEnd"
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  domain={[0, 10]}
                  stroke="var(--text-muted)"
                  fontSize={10}
                  tickLine={false}
                  width={30}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="pain"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--primary)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Region Breakdown */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-shadow">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            Pain by Region
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Current vs previous period
          </p>

          <div className="mt-4 sm:mt-6 h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  type="number"
                  domain={[0, 10]}
                  stroke="var(--text-muted)"
                  fontSize={10}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="var(--text-muted)"
                  fontSize={10}
                  tickLine={false}
                  width={70}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  iconSize={10}
                />
                <Bar
                  dataKey="previous"
                  name="Previous"
                  fill="var(--text-muted)"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="current"
                  name="Current"
                  fill="var(--primary)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Region Details Table - Scrollable on mobile */}
      <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
        <div className="border-b border-border p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            Region-by-Region Breakdown
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Detailed view of pain levels across all tracked body regions
          </p>
        </div>

        {/* Mobile card view */}
        <div className="block sm:hidden divide-y divide-border">
          {regionData.map((region) => (
            <div key={region.name} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{region.name}</span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    region.change > 0
                      ? 'bg-success/10 text-success'
                      : region.change < 0
                      ? 'bg-error/10 text-error'
                      : 'bg-muted/10 text-muted'
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
                  <div className="flex items-center justify-between text-xs text-muted mb-1">
                    <span>Current</span>
                    <span>{region.current}/10</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface">
                    <div
                      className={`h-full rounded-full ${
                        region.current >= 7
                          ? 'bg-error'
                          : region.current >= 4
                          ? 'bg-warning'
                          : 'bg-success'
                      }`}
                      style={{ width: `${region.current * 10}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Previous: {region.previous}</span>
                <span
                  className={`flex items-center gap-1 font-medium ${
                    region.change > 0
                      ? 'text-success'
                      : region.change < 0
                      ? 'text-error'
                      : 'text-muted'
                  }`}
                >
                  {region.change > 0 ? (
                    <>
                      <TrendingDown className="h-4 w-4" />-{region.change}
                    </>
                  ) : region.change < 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4" />+
                      {Math.abs(region.change)}
                    </>
                  ) : (
                    'No change'
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table view */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-surface">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-medium text-muted">
                  Region
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-medium text-muted">
                  Current Level
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-medium text-muted">
                  Previous Level
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-medium text-muted">
                  Change
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-medium text-muted">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {regionData.map((region) => (
                <tr key={region.name} className="hover:bg-surface transition-colors">
                  <td className="px-4 md:px-6 py-3 sm:py-4 text-sm font-medium text-foreground whitespace-nowrap">
                    {region.name}
                  </td>
                  <td className="px-4 md:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-12 sm:w-16 rounded-full bg-surface">
                        <div
                          className={`h-full rounded-full ${
                            region.current >= 7
                              ? 'bg-error'
                              : region.current >= 4
                              ? 'bg-warning'
                              : 'bg-success'
                          }`}
                          style={{ width: `${region.current * 10}%` }}
                        />
                      </div>
                      <span className="text-sm text-foreground">
                        {region.current}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 sm:py-4 text-sm text-muted">
                    {region.previous}
                  </td>
                  <td className="px-4 md:px-6 py-3 sm:py-4">
                    <span
                      className={`flex items-center gap-1 text-sm font-medium ${
                        region.change > 0
                          ? 'text-success'
                          : region.change < 0
                          ? 'text-error'
                          : 'text-muted'
                      }`}
                    >
                      {region.change > 0 ? (
                        <>
                          <TrendingDown className="h-4 w-4" />-{region.change}
                        </>
                      ) : region.change < 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4" />+
                          {Math.abs(region.change)}
                        </>
                      ) : (
                        'No change'
                      )}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 sm:py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        region.change > 0
                          ? 'bg-success/10 text-success'
                          : region.change < 0
                          ? 'bg-error/10 text-error'
                          : 'bg-muted/10 text-muted'
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
      </div>
    </div>
  );
}

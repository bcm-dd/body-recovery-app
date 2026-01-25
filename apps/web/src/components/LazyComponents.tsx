'use client';

import dynamic from 'next/dynamic';
import type { ReactNode} from 'react';
import React, { Suspense, lazy, ComponentType, memo, useRef, useEffect, useState } from 'react';

import {
  SkeletonPage,
  SkeletonStatCard,
  SkeletonSessionCard,
  SkeletonBodyRegion,
  Skeleton,
  Spinner,
} from './Skeleton';
import { usePrefetchOnHover, useLazyLoad } from '../lib/performance';

// ============================================
// SUSPENSE BOUNDARY WRAPPER
// ============================================

interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Generic Suspense boundary with default skeleton fallback
 */
export function SuspenseBoundary({ children, fallback }: SuspenseBoundaryProps) {
  return (
    <Suspense fallback={fallback || <PageLoadingSkeleton />}>
      {children}
    </Suspense>
  );
}

// ============================================
// PAGE-SPECIFIC LOADING SKELETONS
// ============================================

/**
 * Dashboard page loading skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton width="250px" height="32px" />
        <Skeleton width="350px" height="18px" />
      </div>

      {/* AI Insight Banner */}
      <Skeleton height="80px" borderRadius="16px" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Sessions */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton width="150px" height="24px" />
            <Skeleton width="80px" height="20px" />
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <SkeletonSessionCard key={i} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <Skeleton width="120px" height="24px" className="mb-4" />
            {[...Array(4)].map((_, i) => (
              <SkeletonBodyRegion key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Body Map page loading skeleton
 */
export function BodyMapSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton width="150px" height="32px" />
          <Skeleton width="250px" height="18px" className="mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton width="90px" height="40px" borderRadius="12px" />
          <Skeleton width="90px" height="40px" borderRadius="12px" />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Body Map */}
        <div className="lg:col-span-2 glass-body-map p-6">
          <div className="flex justify-center">
            <Skeleton width="300px" height="460px" borderRadius="16px" />
          </div>
          {/* Legend */}
          <div className="mt-6 flex justify-center gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} width="80px" height="32px" borderRadius="8px" />
            ))}
          </div>
        </div>

        {/* Editor Panel */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <Skeleton width="150px" height="24px" className="mb-4" />
            <Skeleton width="100%" height="150px" borderRadius="12px" />
          </div>
          <div className="glass-card p-6">
            <Skeleton width="130px" height="24px" className="mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} width="100%" height="48px" borderRadius="12px" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Progress page loading skeleton with charts
 */
export function ProgressSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <Skeleton width="150px" height="32px" />
          <Skeleton width="300px" height="18px" className="mt-2" />
        </div>
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} width="50px" height="36px" borderRadius="8px" />
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-chart-container p-6">
          <Skeleton width="180px" height="24px" className="mb-2" />
          <Skeleton width="150px" height="14px" className="mb-6" />
          <Skeleton width="100%" height="256px" borderRadius="8px" />
        </div>
        <div className="glass-chart-container p-6">
          <Skeleton width="150px" height="24px" className="mb-2" />
          <Skeleton width="180px" height="14px" className="mb-6" />
          <Skeleton width="100%" height="256px" borderRadius="8px" />
        </div>
      </div>

      {/* Table */}
      <div className="glass-table p-6">
        <Skeleton width="200px" height="24px" className="mb-4" />
        <Skeleton width="100%" height="300px" borderRadius="8px" />
      </div>
    </div>
  );
}

/**
 * Settings page loading skeleton
 */
export function SettingsSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <Skeleton width="150px" height="32px" />
        <Skeleton width="280px" height="18px" className="mt-2" />
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Navigation */}
        <div className="glass-card p-4">
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} width="100%" height="44px" borderRadius="8px" />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card p-6">
            <Skeleton width="180px" height="24px" className="mb-2" />
            <Skeleton width="250px" height="16px" className="mb-6" />
            <div className="space-y-4">
              <Skeleton width="100%" height="60px" borderRadius="12px" />
              <Skeleton width="100%" height="60px" borderRadius="12px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * History page loading skeleton
 */
export function HistorySkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton width="200px" height="32px" />
          <Skeleton width="300px" height="18px" className="mt-2" />
        </div>
        <Skeleton width="150px" height="40px" borderRadius="8px" />
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton variant="circular" width="48px" height="48px" />
                <div>
                  <Skeleton width="150px" height="20px" />
                  <Skeleton width="200px" height="14px" className="mt-2" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <Skeleton width="60px" height="18px" />
                </div>
                <div className="text-right">
                  <Skeleton width="50px" height="18px" />
                  <Skeleton width="40px" height="12px" className="mt-1" />
                </div>
                <div className="text-right">
                  <Skeleton width="60px" height="18px" />
                  <Skeleton width="50px" height="12px" className="mt-1" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Generic page loading skeleton
 */
export function PageLoadingSkeleton() {
  return <SkeletonPage />;
}

// ============================================
// LAZY LOAD WRAPPER COMPONENT
// ============================================

interface LazyLoadWrapperProps {
  children: ReactNode;
  placeholder?: ReactNode;
  rootMargin?: string;
}

/**
 * Wrapper that lazy loads children when they enter the viewport
 */
export function LazyLoadWrapper({
  children,
  placeholder,
  rootMargin = '200px',
}: LazyLoadWrapperProps) {
  const [ref, isVisible] = useLazyLoad({ rootMargin });

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      {isVisible ? children : placeholder || <Skeleton height="200px" />}
    </div>
  );
}

// ============================================
// PREFETCH LINK WRAPPER
// ============================================

interface PrefetchLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

/**
 * Link that prefetches the destination on hover
 */
export const PrefetchLink = memo(function PrefetchLink({
  href,
  children,
  className,
}: PrefetchLinkProps) {
  const prefetchHandlers = usePrefetchOnHover(href);

  return (
    <a href={href} className={className} {...prefetchHandlers}>
      {children}
    </a>
  );
});

// ============================================
// DYNAMIC IMPORTS FOR HEAVY COMPONENTS
// ============================================

/**
 * Lazy loaded Recharts components
 * Only loads when the Progress page is rendered
 * This significantly reduces initial bundle size
 */
export const LazyLineChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.LineChart })),
  {
    loading: () => <Skeleton height="256px" />,
    ssr: false,
  }
);

export const LazyAreaChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.AreaChart })),
  {
    loading: () => <Skeleton height="256px" />,
    ssr: false,
  }
);

export const LazyBarChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.BarChart })),
  {
    loading: () => <Skeleton height="256px" />,
    ssr: false,
  }
);

export const LazyResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  {
    loading: () => <Skeleton height="100%" />,
    ssr: false,
  }
);

// Additional Recharts components for complete lazy loading
export const LazyLine = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Line })),
  { ssr: false }
);

export const LazyArea = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Area })),
  { ssr: false }
);

export const LazyBar = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Bar })),
  { ssr: false }
);

export const LazyXAxis = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.XAxis })),
  { ssr: false }
);

export const LazyYAxis = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.YAxis })),
  { ssr: false }
);

export const LazyCartesianGrid = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.CartesianGrid })),
  { ssr: false }
);

export const LazyTooltip = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Tooltip })),
  { ssr: false }
);

export const LazyLegend = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Legend })),
  { ssr: false }
);

// ============================================
// LAZY CHART WRAPPER FOR FULL LAZY LOADING
// ============================================

interface LazyChartWrapperProps {
  children: ReactNode;
  height?: string | number;
}

/**
 * Wrapper component that lazy loads the entire chart section
 * Use this for below-the-fold charts to improve initial load
 */
export function LazyChartWrapper({ children, height = '256px' }: LazyChartWrapperProps) {
  const [ref, isVisible] = useLazyLoad({ rootMargin: '100px' });

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} style={{ minHeight: height }}>
      {isVisible ? (
        <Suspense fallback={<Skeleton height={height} />}>
          {children}
        </Suspense>
      ) : (
        <Skeleton height={height} />
      )}
    </div>
  );
}

// ============================================
// LOADING SPINNER FOR ROUTE TRANSITIONS
// ============================================

export function RouteLoadingIndicator() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-[var(--text-muted)]">Loading...</p>
      </div>
    </div>
  );
}

// ============================================
// ERROR BOUNDARY FALLBACK
// ============================================

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="glass-card p-6 max-w-md">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        {resetErrorBoundary && (
          <button
            onClick={resetErrorBoundary}
            className="liquid-button px-4 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

'use client';

import React from 'react';

import { useReducedMotion } from '../hooks/useMediaQuery';

// ============================================
// SKELETON BASE COMPONENT
// ============================================

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  animate?: boolean;
  variant?: 'default' | 'circular' | 'text' | 'rectangular';
}

/**
 * Base skeleton component with shimmer animation
 */
export function Skeleton({
  className = '',
  width,
  height,
  borderRadius,
  animate = true,
  variant = 'default',
}: SkeletonProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'circular':
        return {
          width: width || height || '40px',
          height: height || width || '40px',
          borderRadius: '50%',
        };
      case 'text':
        return {
          width: width || '100%',
          height: height || '1em',
          borderRadius: borderRadius || '4px',
        };
      case 'rectangular':
        return {
          width: width || '100%',
          height: height || '100px',
          borderRadius: borderRadius || '8px',
        };
      default:
        return {
          width: width || '100%',
          height: height || '20px',
          borderRadius: borderRadius || '4px',
        };
    }
  };

  return (
    <div
      className={`skeleton ${shouldAnimate ? 'skeleton-animate' : ''} ${className}`}
      style={getVariantStyles()}
      aria-hidden="true"
    />
  );
}

// ============================================
// SKELETON CARD PRESETS
// ============================================

/**
 * Skeleton for stat cards
 */
export function SkeletonStatCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton width="60%" height="14px" />
          <Skeleton width="40%" height="28px" />
          <Skeleton width="50%" height="12px" />
        </div>
        <Skeleton variant="circular" width="44px" height="44px" />
      </div>
    </div>
  );
}

/**
 * Skeleton for session cards
 */
export function SkeletonSessionCard() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 sm:p-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <Skeleton variant="circular" width="48px" height="48px" />
        <div className="space-y-2">
          <Skeleton width="120px" height="16px" />
          <Skeleton width="80px" height="12px" />
        </div>
      </div>
      <div className="space-y-2 text-right">
        <Skeleton width="60px" height="14px" />
        <Skeleton width="40px" height="10px" />
      </div>
    </div>
  );
}

/**
 * Skeleton for list items
 */
export function SkeletonListItem({ hasAvatar = true }: { hasAvatar?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3">
      {hasAvatar && <Skeleton variant="circular" width="40px" height="40px" />}
      <div className="flex-1 space-y-2">
        <Skeleton width="70%" height="16px" />
        <Skeleton width="50%" height="12px" />
      </div>
    </div>
  );
}

/**
 * Skeleton for body region item
 */
export function SkeletonBodyRegion() {
  return (
    <div className="flex items-center justify-between py-2">
      <Skeleton width="100px" height="14px" />
      <div className="flex items-center gap-2">
        <Skeleton width="64px" height="8px" borderRadius="4px" />
        <Skeleton width="16px" height="12px" />
      </div>
    </div>
  );
}

/**
 * Skeleton for full page
 */
export function SkeletonPage() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton width="200px" height="28px" />
        <Skeleton width="300px" height="16px" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {[...Array(4)].map((_, i) => (
            <SkeletonSessionCard key={i} />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <SkeletonBodyRegion key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// LOADING SPINNER
// ============================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full border-primary border-t-transparent animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

// ============================================
// LOADING OVERLAY
// ============================================

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  blur?: boolean;
  children: React.ReactNode;
}

export function LoadingOverlay({
  isLoading,
  message,
  blur = true,
  children,
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center bg-background/80 ${
            blur ? 'backdrop-blur-sm' : ''
          } z-50 animate-fadeIn`}
        >
          <Spinner size="lg" />
          {message && (
            <p className="mt-4 text-sm text-muted animate-pulse">{message}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// PROGRESS BAR
// ============================================

interface ProgressBarProps {
  progress: number;  // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  indeterminate?: boolean;
  className?: string;
}

export function ProgressBar({
  progress,
  showLabel = false,
  size = 'md',
  variant = 'default',
  indeterminate = false,
  className = '',
}: ProgressBarProps) {
  const prefersReducedMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
  };

  return (
    <div className={`${className}`}>
      <div
        className={`w-full rounded-full bg-surface overflow-hidden ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${variantClasses[variant]} ${
            indeterminate && !prefersReducedMotion ? 'progress-indeterminate' : ''
          }`}
          style={indeterminate ? {} : { width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showLabel && !indeterminate && (
        <p className="mt-1 text-xs text-muted text-right">{Math.round(progress)}%</p>
      )}
    </div>
  );
}

// ============================================
// PULL TO REFRESH INDICATOR
// ============================================

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  threshold: number;
  isRefreshing: boolean;
}

export function PullToRefreshIndicator({
  pullDistance,
  threshold,
  isRefreshing,
}: PullToRefreshIndicatorProps) {
  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;
  const scale = 0.5 + progress * 0.5;

  if (pullDistance === 0 && !isRefreshing) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-center py-4"
      style={{
        transform: `translateY(${pullDistance}px)`,
        opacity: Math.min(progress * 2, 1),
      }}
    >
      <div
        className={`w-8 h-8 rounded-full border-2 border-primary border-t-transparent ${
          isRefreshing ? 'animate-spin' : ''
        }`}
        style={
          isRefreshing
            ? {}
            : {
                transform: `rotate(${rotation}deg) scale(${scale})`,
              }
        }
      />
    </div>
  );
}

// ============================================
// OPTIMISTIC UPDATE WRAPPER
// ============================================

interface OptimisticWrapperProps {
  isPending: boolean;
  children: React.ReactNode;
  pendingClassName?: string;
}

export function OptimisticWrapper({
  isPending,
  children,
  pendingClassName = 'opacity-60 pointer-events-none',
}: OptimisticWrapperProps) {
  return (
    <div className={`transition-opacity duration-200 ${isPending ? pendingClassName : ''}`}>
      {children}
    </div>
  );
}

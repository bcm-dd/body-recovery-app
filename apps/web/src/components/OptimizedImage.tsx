'use client';

import type { ImageProps } from 'next/image';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import React, { useState, useCallback, memo } from 'react';

import { Skeleton } from './Skeleton';
import { useLazyLoad } from '../lib/performance';

// ============================================
// BLUR DATA URL GENERATOR
// ============================================

/**
 * Generate a simple blur placeholder for images
 * This creates a tiny data URL that can be used as a placeholder
 */
export function generateBlurPlaceholder(
  width: number = 10,
  height: number = 10,
  color: string = 'rgba(128, 128, 128, 0.3)'
): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="2" />
      </filter>
      <rect width="100%" height="100%" fill="${color}" filter="url(#b)" />
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Pre-defined blur placeholders for common use cases
 */
export const BLUR_PLACEHOLDERS = {
  gray: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCI+PGZpbHRlciBpZD0iYiIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InJnYmEoMTI4LCAxMjgsIDEyOCwgMC4zKSIgZmlsdGVyPSJ1cmwoI2IpIiAvPjwvc3ZnPg==',
  dark: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCI+PGZpbHRlciBpZD0iYiIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InJnYmEoMzAsIDMwLCAzMCwgMC41KSIgZmlsdGVyPSJ1cmwoI2IpIiAvPjwvc3ZnPg==',
  light: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCI+PGZpbHRlciBpZD0iYiIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InJnYmEoMjIwLCAyMjAsIDIyMCwgMC41KSIgZmlsdGVyPSJ1cmwoI2IpIiAvPjwvc3ZnPg==',
  primary: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCI+PGZpbHRlciBpZD0iYiIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InJnYmEoOTksIDEwMiwgMjQxLCAwLjIpIiBmaWx0ZXI9InVybCgjYikiIC8+PC9zdmc+',
};

// ============================================
// OPTIMIZED IMAGE COMPONENT
// ============================================

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  /** Use blur placeholder */
  blur?: boolean;
  /** Custom blur data URL or use preset */
  blurPreset?: keyof typeof BLUR_PLACEHOLDERS;
  /** Custom blur data URL */
  customBlurDataURL?: string;
  /** Fade in animation duration (ms) */
  fadeInDuration?: number;
  /** Aspect ratio for container (e.g., "16/9", "4/3", "1/1") */
  aspectRatio?: string;
  /** Show skeleton while loading */
  showSkeleton?: boolean;
  /** Container className */
  containerClassName?: string;
}

/**
 * Optimized image component with blur placeholder, lazy loading,
 * and smooth fade-in animation
 */
export const OptimizedImage = memo(function OptimizedImage({
  blur = true,
  blurPreset = 'gray',
  customBlurDataURL,
  fadeInDuration = 300,
  aspectRatio,
  showSkeleton = true,
  containerClassName = '',
  className = '',
  onLoad,
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoaded(true);
      onLoad?.(event);
    },
    [onLoad]
  );

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  const blurDataURL = customBlurDataURL || BLUR_PLACEHOLDERS[blurPreset];

  const containerStyle: CSSProperties = aspectRatio
    ? { aspectRatio, position: 'relative' }
    : { position: 'relative' };

  const imageStyle: CSSProperties = {
    ...style,
    transition: `opacity ${fadeInDuration}ms ease-in-out`,
    opacity: isLoaded ? 1 : 0,
  };

  if (hasError) {
    return (
      <div
        className={`bg-[var(--glass-bg)] flex items-center justify-center ${containerClassName}`}
        style={containerStyle}
      >
        <span className="text-xs text-[var(--text-muted)]">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${containerClassName}`} style={containerStyle}>
      {/* Skeleton placeholder */}
      {showSkeleton && !isLoaded && (
        <div className="absolute inset-0 z-10">
          <Skeleton
            width="100%"
            height="100%"
            borderRadius="0"
            className="absolute inset-0"
          />
        </div>
      )}

      <Image
        {...props}
        className={className}
        style={imageStyle}
        placeholder={blur ? 'blur' : 'empty'}
        blurDataURL={blur ? blurDataURL : undefined}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
});

// ============================================
// LAZY IMAGE COMPONENT
// ============================================

interface LazyImageProps extends OptimizedImageProps {
  /** Root margin for intersection observer */
  rootMargin?: string;
}

/**
 * Image that only loads when it enters the viewport
 */
export const LazyImage = memo(function LazyImage({
  rootMargin = '200px',
  ...props
}: LazyImageProps) {
  const [ref, isVisible] = useLazyLoad({ rootMargin });

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      {isVisible ? (
        <OptimizedImage {...props} />
      ) : (
        <Skeleton
          width={typeof props.width === 'number' ? `${props.width}px` : props.width}
          height={typeof props.height === 'number' ? `${props.height}px` : props.height}
          className={props.containerClassName}
        />
      )}
    </div>
  );
});

// ============================================
// RESPONSIVE IMAGE COMPONENT
// ============================================

interface ResponsiveImageProps extends OptimizedImageProps {
  /** Mobile image src (optional) */
  mobileSrc?: string;
  /** Tablet image src (optional) */
  tabletSrc?: string;
  /** Desktop breakpoint (px) */
  desktopBreakpoint?: number;
  /** Tablet breakpoint (px) */
  tabletBreakpoint?: number;
}

/**
 * Responsive image with different sources for different screen sizes
 */
export const ResponsiveImage = memo(function ResponsiveImage({
  mobileSrc,
  tabletSrc,
  desktopBreakpoint = 1024,
  tabletBreakpoint = 768,
  src,
  ...props
}: ResponsiveImageProps) {
  // Build sizes attribute for responsive images
  const sizes = props.sizes || `
    (max-width: ${tabletBreakpoint}px) 100vw,
    (max-width: ${desktopBreakpoint}px) 50vw,
    33vw
  `.trim();

  return (
    <OptimizedImage
      {...props}
      src={src}
      sizes={sizes}
    />
  );
});

// ============================================
// AVATAR IMAGE COMPONENT
// ============================================

interface AvatarImageProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

const AVATAR_SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

/**
 * Optimized avatar image with fallback
 */
export const AvatarImage = memo(function AvatarImage({
  src,
  alt,
  size = 'md',
  fallback,
  className = '',
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);
  const sizeInPx = AVATAR_SIZES[size];

  if (!src || hasError) {
    // Show initials or fallback
    const initials = fallback || alt.slice(0, 2).toUpperCase();

    return (
      <div
        className={`flex items-center justify-center rounded-full bg-[var(--primary)]/20 text-[var(--primary)] font-medium ${className}`}
        style={{ width: sizeInPx, height: sizeInPx, fontSize: sizeInPx * 0.4 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={sizeInPx}
      height={sizeInPx}
      className={`rounded-full object-cover ${className}`}
      containerClassName="rounded-full"
      blurPreset="gray"
      onError={() => setHasError(true)}
    />
  );
});

// ============================================
// BACKGROUND IMAGE COMPONENT
// ============================================

interface BackgroundImageProps {
  src: string;
  alt: string;
  children?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  priority?: boolean;
}

/**
 * Background image with overlay support
 */
export const BackgroundImage = memo(function BackgroundImage({
  src,
  alt,
  children,
  className = '',
  overlayClassName = '',
  priority = false,
}: BackgroundImageProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        sizes="100vw"
        showSkeleton
      />
      {overlayClassName && (
        <div className={`absolute inset-0 ${overlayClassName}`} />
      )}
      {children && (
        <div className="relative z-10">{children}</div>
      )}
    </div>
  );
});

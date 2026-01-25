'use client';

import type {
  ReactNode} from 'react';
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  CSSProperties,
} from 'react';

import { useThrottle, useDebounce } from '../lib/performance';

// ============================================
// VIRTUAL LIST COMPONENT
// ============================================

interface VirtualListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Height of each item in pixels */
  itemHeight: number;
  /** Height of the container */
  containerHeight: number;
  /** Render function for each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Number of items to render above and below the visible area */
  overscan?: number;
  /** Key extractor function */
  keyExtractor?: (item: T, index: number) => string | number;
  /** Container className */
  className?: string;
  /** On scroll callback */
  onScroll?: (scrollTop: number) => void;
  /** Loading more indicator */
  loadingMore?: boolean;
  /** Render when list is empty */
  emptyComponent?: ReactNode;
}

/**
 * Virtual list component that only renders visible items
 * Optimized for long lists with hundreds or thousands of items
 */
export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  keyExtractor = (_, index) => index,
  className = '',
  onScroll,
  loadingMore = false,
  emptyComponent,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible range
  const { startIndex, endIndex, offsetY } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2);

    return {
      startIndex: start,
      endIndex: end,
      offsetY: start * itemHeight,
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Handle scroll with throttling for performance
  const handleScroll = useThrottle((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
    onScroll?.(target.scrollTop);
  }, 16); // ~60fps

  // Total height for scroll area
  const totalHeight = items.length * itemHeight;

  // Visible items slice
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);

  if (items.length === 0 && emptyComponent) {
    return <>{emptyComponent}</>;
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            const key = keyExtractor(item, actualIndex);

            return (
              <div
                key={key}
                style={{ height: itemHeight }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>

      {loadingMore && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// ============================================
// VIRTUAL GRID COMPONENT
// ============================================

interface VirtualGridProps<T> {
  /** Array of items to render */
  items: T[];
  /** Number of columns */
  columns: number;
  /** Height of each row in pixels */
  rowHeight: number;
  /** Height of the container */
  containerHeight: number;
  /** Gap between items in pixels */
  gap?: number;
  /** Render function for each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Number of rows to render above and below the visible area */
  overscan?: number;
  /** Key extractor function */
  keyExtractor?: (item: T, index: number) => string | number;
  /** Container className */
  className?: string;
}

/**
 * Virtual grid component for rendering items in a grid layout
 */
export function VirtualGrid<T>({
  items,
  columns,
  rowHeight,
  containerHeight,
  gap = 0,
  renderItem,
  overscan = 2,
  keyExtractor = (_, index) => index,
  className = '',
}: VirtualGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate rows
  const rows = Math.ceil(items.length / columns);
  const rowHeightWithGap = rowHeight + gap;

  // Calculate visible range
  const { startRow, endRow, offsetY } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / rowHeightWithGap) - overscan);
    const visibleRows = Math.ceil(containerHeight / rowHeightWithGap);
    const end = Math.min(rows - 1, start + visibleRows + overscan * 2);

    return {
      startRow: start,
      endRow: end,
      offsetY: start * rowHeightWithGap,
    };
  }, [scrollTop, rowHeightWithGap, containerHeight, rows, overscan]);

  // Handle scroll
  const handleScroll = useThrottle((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, 16);

  // Total height
  const totalHeight = rows * rowHeightWithGap - gap;

  // Get items for visible rows
  const visibleRows = useMemo(() => {
    const rowsArray: T[][] = [];
    for (let row = startRow; row <= endRow; row++) {
      const startIndex = row * columns;
      const endIndex = Math.min(startIndex + columns, items.length);
      rowsArray.push(items.slice(startIndex, endIndex));
    }
    return rowsArray;
  }, [items, startRow, endRow, columns]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleRows.map((rowItems, rowIndex) => {
            const actualRow = startRow + rowIndex;

            return (
              <div
                key={actualRow}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gap,
                  height: rowHeight,
                  marginBottom: gap,
                }}
              >
                {rowItems.map((item, colIndex) => {
                  const actualIndex = actualRow * columns + colIndex;
                  const key = keyExtractor(item, actualIndex);

                  return (
                    <div key={key}>
                      {renderItem(item, actualIndex)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// INFINITE SCROLL WRAPPER
// ============================================

interface InfiniteScrollProps {
  children: ReactNode;
  /** Callback when user scrolls near the end */
  onLoadMore: () => void;
  /** Whether more data is being loaded */
  isLoading: boolean;
  /** Whether there's more data to load */
  hasMore: boolean;
  /** Threshold in pixels from bottom to trigger load */
  threshold?: number;
  /** Container className */
  className?: string;
  /** Loading indicator */
  loadingComponent?: ReactNode;
}

/**
 * Infinite scroll wrapper component
 */
export function InfiniteScroll({
  children,
  onLoadMore,
  isLoading,
  hasMore,
  threshold = 200,
  className = '',
  loadingComponent,
}: InfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(onLoadMore);

  // Keep callback reference updated
  useEffect(() => {
    loadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  // Debounced scroll handler
  const handleScroll = useDebounce(() => {
    if (!containerRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom <= threshold) {
      loadMoreRef.current();
    }
  }, 100);

  // Also use intersection observer for the sentinel element
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          loadMoreRef.current();
        }
      },
      {
        root: containerRef.current,
        rootMargin: `${threshold}px`,
      }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, isLoading, threshold]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      onScroll={handleScroll}
    >
      {children}

      {/* Sentinel element for intersection observer */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* Loading indicator */}
      {isLoading && (
        loadingComponent || (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )
      )}
    </div>
  );
}

// ============================================
// WINDOWED LIST ITEM WRAPPER
// ============================================

interface WindowedItemProps {
  children: ReactNode;
  /** Whether this item is currently visible */
  isVisible: boolean;
  /** Height of the item */
  height: number;
}

/**
 * Wrapper for windowed list items that only renders children when visible
 */
export const WindowedItem = memo(function WindowedItem({
  children,
  isVisible,
  height,
}: WindowedItemProps) {
  if (!isVisible) {
    return <div style={{ height }} />;
  }

  return <>{children}</>;
});

'use client';

import { useEffect, useState } from 'react';

import { useOffline } from '../hooks/useOffline';

interface OfflineIndicatorProps {
  /** Position of the indicator */
  position?: 'top' | 'bottom';
  /** Custom class for the container */
  className?: string;
  /** Show pending actions count */
  showPendingCount?: boolean;
  /** Number of pending actions */
  pendingCount?: number;
}

export function OfflineIndicator({
  position = 'bottom',
  className = '',
  showPendingCount = true,
  pendingCount = 0,
}: OfflineIndicatorProps) {
  const { isOnline, connectionType, effectiveType } = useOffline();
  const [isVisible, setIsVisible] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  // Handle visibility and reconnection message
  useEffect(() => {
    if (!isOnline) {
      setIsVisible(true);
      setWasOffline(true);
      setShowReconnected(false);
    } else if (wasOffline) {
      // Show reconnected message briefly
      setShowReconnected(true);
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOnline, wasOffline]);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  const positionClasses = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0',
  };

  const getConnectionLabel = () => {
    if (effectiveType) {
      const labels: Record<string, string> = {
        'slow-2g': 'Very slow',
        '2g': 'Slow',
        '3g': 'Moderate',
        '4g': 'Fast',
      };
      return labels[effectiveType] || effectiveType;
    }
    return connectionType || 'Unknown';
  };

  return (
    <div
      className={`fixed z-50 ${positionClasses[position]} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`
          px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium
          transition-all duration-300 ease-out
          ${
            showReconnected
              ? 'bg-green-500 text-white'
              : 'bg-yellow-500 text-yellow-900'
          }
        `}
      >
        {/* Status Icon */}
        {showReconnected ? (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a4 4 0 010-5.656m-7.072 7.072a9 9 0 010-12.728m3.536 3.536a4 4 0 010 5.656"
            />
          </svg>
        )}

        {/* Message */}
        <span>
          {showReconnected
            ? "You're back online!"
            : "You're offline. Changes will sync when connected."}
        </span>

        {/* Connection type */}
        {!showReconnected && connectionType && (
          <span className="text-xs opacity-75">({getConnectionLabel()})</span>
        )}

        {/* Pending count */}
        {!showReconnected && showPendingCount && pendingCount > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-yellow-600/30 rounded-full text-xs">
            {pendingCount} pending
          </span>
        )}
      </div>
    </div>
  );
}

export default OfflineIndicator;

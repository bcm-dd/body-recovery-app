'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Get last sync time from localStorage
    const stored = localStorage.getItem('body-recovery-last-sync');
    if (stored) {
      setLastSync(new Date(stored).toLocaleString());
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-redirect when back online
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gradient-mesh">
      <div className="glass-panel p-8 max-w-md w-full text-center space-y-6">
        {/* Offline Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 animate-pulse" />
          <div className="absolute inset-2 glass-panel-subtle rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>

        {/* Status Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {isOnline ? "You're Back Online!" : "You're Offline"}
          </h1>
          <p className="text-[var(--text-muted)]">
            {isOnline
              ? 'Connection restored. Redirecting you back...'
              : "Don't worry, your data is safe. Some features may be limited while offline."}
          </p>
        </div>

        {/* Connection Status Indicator */}
        <div className="flex items-center justify-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              isOnline
                ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'
            }`}
          />
          <span className="text-sm text-[var(--text-muted)]">
            {isOnline ? 'Connected' : 'No Internet Connection'}
          </span>
        </div>

        {/* Last Sync Info */}
        {lastSync && (
          <div className="glass-panel-subtle p-4 rounded-xl">
            <p className="text-sm text-[var(--text-muted)]">
              Last synced: <span className="text-[var(--foreground)]">{lastSync}</span>
            </p>
          </div>
        )}

        {/* Available Offline Features */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-[var(--foreground)]">
            Available Offline:
          </h2>
          <ul className="space-y-2 text-left">
            <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <svg
                className="w-4 h-4 text-green-500"
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
              View cached progress data
            </li>
            <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <svg
                className="w-4 h-4 text-green-500"
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
              Log pain levels (syncs when online)
            </li>
            <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <svg
                className="w-4 h-4 text-green-500"
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
              View saved exercises
            </li>
            <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <svg
                className="w-4 h-4 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Limited AI suggestions
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 liquid-button px-6 py-3 ripple"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 glass-button-ghost px-6 py-3 text-center rounded-xl"
          >
            Go Home
          </Link>
        </div>

        {/* Pending Actions Notice */}
        <div className="text-xs text-[var(--text-muted)] pt-4 border-t border-[var(--border)]">
          <p>
            Any actions you take while offline will be automatically synced
            when your connection is restored.
          </p>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

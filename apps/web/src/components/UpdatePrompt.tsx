'use client';

import { useCallback } from 'react';

interface UpdatePromptProps {
  /** Whether update is available */
  isVisible: boolean;
  /** Callback to update the app */
  onUpdate: () => void;
  /** Callback to dismiss the prompt */
  onDismiss: () => void;
  /** Custom class for the container */
  className?: string;
}

export function UpdatePrompt({
  isVisible,
  onUpdate,
  onDismiss,
  className = '',
}: UpdatePromptProps) {
  const handleUpdate = useCallback(() => {
    onUpdate();
  }, [onUpdate]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slideInUp ${className}`}
    >
      <div className="glass-panel p-4 rounded-2xl shadow-lg">
        <div className="flex items-start gap-3">
          {/* Update Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--foreground)]">
              Update Available
            </h3>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              A new version is ready. Refresh to get the latest features.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-[var(--glass-bg-subtle)] transition-colors"
            aria-label="Dismiss update prompt"
          >
            <svg
              className="w-5 h-5 text-[var(--text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={onDismiss}
            className="flex-1 px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Later
          </button>
          <button
            onClick={handleUpdate}
            className="flex-1 liquid-button px-4 py-2 text-sm font-medium rounded-xl ripple"
          >
            Update Now
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideInUp {
          animation: slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}

export default UpdatePrompt;

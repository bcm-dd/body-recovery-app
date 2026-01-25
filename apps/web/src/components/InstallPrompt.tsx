'use client';

import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface InstallPromptProps {
  /** Delay before showing the prompt (ms) */
  delay?: number;
  /** Custom class for the container */
  className?: string;
  /** Callback when app is installed */
  onInstall?: () => void;
  /** Callback when prompt is dismissed */
  onDismiss?: () => void;
}

export function InstallPrompt({
  delay = 3000,
  className = '',
  onInstall,
  onDismiss,
}: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Check if app is already installed
  useEffect(() => {
    // Check standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Check for iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show prompt after delay
      setTimeout(() => {
        setIsVisible(true);
      }, delay);
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);

      // Track installation
      localStorage.setItem('pwa-installed', Date.now().toString());
      onInstall?.();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show iOS instructions after delay if on iOS
    if (isIOSDevice) {
      setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [delay, onInstall]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSInstructions(true);
      }
      return;
    }

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        onInstall?.();
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install prompt failed:', error);
    } finally {
      setIsInstalling(false);
      setIsVisible(false);
    }
  }, [deferredPrompt, isIOS, onInstall]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setShowIOSInstructions(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    onDismiss?.();
  }, [onDismiss]);

  const handleLater = useCallback(() => {
    setIsVisible(false);
    // Show again in 24 hours
    localStorage.setItem('pwa-install-dismissed', (Date.now() - 6 * 24 * 60 * 60 * 1000).toString());
  }, []);

  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Main Install Prompt */}
      <div
        className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slideInUp ${className}`}
      >
        <div className="glass-panel p-4 rounded-2xl shadow-lg">
          {/* Header */}
          <div className="flex items-start gap-3">
            {/* App Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[#818cf8] flex items-center justify-center">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="7" r="3" />
                <path d="M12 11v7" strokeLinecap="round" />
                <path d="M12 13l-3-2.5-1.5 1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 13l3-2.5 1.5 1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 18l-3 3" strokeLinecap="round" />
                <path d="M12 18l3 3" strokeLinecap="round" />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[var(--foreground)]">
                Install Body Recovery
              </h3>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Add to home screen for quick access and offline support
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-[var(--glass-bg-subtle)] transition-colors"
              aria-label="Dismiss install prompt"
            >
              <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Benefits */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Works offline
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Fast loading
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Notifications
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Home screen
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleLater}
              className="flex-1 px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Later
            </button>
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 liquid-button px-4 py-2 text-sm font-medium rounded-xl ripple disabled:opacity-50"
            >
              {isInstalling ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Installing...
                </span>
              ) : isIOS ? (
                'How to Install'
              ) : (
                'Install'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-panel p-6 max-w-sm w-full rounded-2xl animate-popIn">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Install on iOS
            </h3>

            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)] text-white text-sm flex items-center justify-center">
                  1
                </span>
                <div>
                  <p className="text-sm text-[var(--foreground)]">
                    Tap the <strong>Share</strong> button
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    It looks like a box with an arrow pointing up
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)] text-white text-sm flex items-center justify-center">
                  2
                </span>
                <div>
                  <p className="text-sm text-[var(--foreground)]">
                    Scroll and tap <strong>Add to Home Screen</strong>
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)] text-white text-sm flex items-center justify-center">
                  3
                </span>
                <div>
                  <p className="text-sm text-[var(--foreground)]">
                    Tap <strong>Add</strong> in the top right
                  </p>
                </div>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="mt-6 w-full liquid-button px-4 py-3 rounded-xl ripple"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

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
    </>
  );
}

export default InstallPrompt;

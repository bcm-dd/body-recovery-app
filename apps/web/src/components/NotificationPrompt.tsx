'use client';

import { useEffect, useState, useCallback } from 'react';

type NotificationPermission = 'default' | 'granted' | 'denied';

interface NotificationPromptProps {
  /** Delay before showing the prompt (ms) */
  delay?: number;
  /** Custom class for the container */
  className?: string;
  /** Callback when permission is granted */
  onGranted?: () => void;
  /** Callback when permission is denied */
  onDenied?: () => void;
  /** Callback when prompt is dismissed */
  onDismiss?: () => void;
}

interface NotificationPreferences {
  workoutReminders: boolean;
  checkInReminders: boolean;
  recoveryTips: boolean;
  progressUpdates: boolean;
}

export function NotificationPrompt({
  delay = 5000,
  className = '',
  onGranted,
  onDenied,
  onDismiss,
}: NotificationPromptProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    workoutReminders: true,
    checkInReminders: true,
    recoveryTips: true,
    progressUpdates: false,
  });

  // Check notification support and permission
  useEffect(() => {
    if (!('Notification' in window)) {
      return;
    }

    setPermission(Notification.permission);

    // Don't show if already granted or denied
    if (Notification.permission !== 'default') {
      return;
    }

    // Check if previously dismissed
    const dismissed = localStorage.getItem('notification-prompt-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Show again after 3 days
      if (Date.now() - dismissedTime < 3 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Load saved preferences
    const savedPrefs = localStorage.getItem('notification-preferences');
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Show prompt after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const handleRequestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return;
    }

    setIsRequesting(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        // Save preferences
        localStorage.setItem('notification-preferences', JSON.stringify(preferences));

        // Register for push notifications
        await registerPushSubscription();

        onGranted?.();

        // Show success notification
        new Notification('Body Recovery', {
          body: "You'll receive helpful reminders for your recovery journey!",
          icon: '/icons/icon-192x192.svg',
          badge: '/icons/icon-72x72.svg',
        });
      } else if (result === 'denied') {
        onDenied?.();
      }

      setIsVisible(false);
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  }, [preferences, onGranted, onDenied]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem('notification-prompt-dismissed', Date.now().toString());
    onDismiss?.();
  }, [onDismiss]);

  const handleTogglePreference = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Helper to register push subscription
  async function registerPushSubscription() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        // Could send to server to update
        console.log('Already subscribed to push notifications');
        return;
      }

      // Note: In production, you would get this from your push service
      // This is a placeholder for the VAPID public key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured');
        return;
      }

      // Convert VAPID key to Uint8Array
      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
          .replace(/-/g, '+')
          .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      // await fetch('/api/push/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(subscription),
      // });

      console.log('Push subscription created:', subscription);
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }

  // Don't render if not supported or already granted/denied
  if (!isVisible || permission !== 'default') {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slideInUp ${className}`}
    >
      <div className="glass-panel p-4 rounded-2xl shadow-lg">
        {!showPreferences ? (
          <>
            {/* Header */}
            <div className="flex items-start gap-3">
              {/* Bell Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--foreground)]">
                  Stay on Track
                </h3>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">
                  Get reminders for workouts and check-ins
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-[var(--glass-bg-subtle)] transition-colors"
                aria-label="Dismiss notification prompt"
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

            {/* Benefits */}
            <ul className="mt-3 space-y-2">
              <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <svg
                  className="w-4 h-4 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Daily workout reminders
              </li>
              <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <svg
                  className="w-4 h-4 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                Check-in reminders
              </li>
              <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <svg
                  className="w-4 h-4 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Recovery tips
              </li>
            </ul>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowPreferences(true)}
                className="flex-1 px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Customize
              </button>
              <button
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="flex-1 liquid-button px-4 py-2 text-sm font-medium rounded-xl ripple disabled:opacity-50"
              >
                {isRequesting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="opacity-25"
                      />
                      <path
                        d="M12 2a10 10 0 0 1 10 10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                ) : (
                  'Enable'
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Preferences View */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--foreground)]">
                Notification Preferences
              </h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-1 rounded-lg hover:bg-[var(--glass-bg-subtle)] transition-colors"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {/* Workout Reminders */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--foreground)]">
                  Workout reminders
                </span>
                <input
                  type="checkbox"
                  checked={preferences.workoutReminders}
                  onChange={() => handleTogglePreference('workoutReminders')}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-[var(--glass-bg-subtle)] rounded-full peer peer-checked:bg-[var(--primary)] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-4 relative" />
              </label>

              {/* Check-in Reminders */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--foreground)]">
                  Check-in reminders
                </span>
                <input
                  type="checkbox"
                  checked={preferences.checkInReminders}
                  onChange={() => handleTogglePreference('checkInReminders')}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-[var(--glass-bg-subtle)] rounded-full peer peer-checked:bg-[var(--primary)] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-4 relative" />
              </label>

              {/* Recovery Tips */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--foreground)]">
                  Recovery tips
                </span>
                <input
                  type="checkbox"
                  checked={preferences.recoveryTips}
                  onChange={() => handleTogglePreference('recoveryTips')}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-[var(--glass-bg-subtle)] rounded-full peer peer-checked:bg-[var(--primary)] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-4 relative" />
              </label>

              {/* Progress Updates */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--foreground)]">
                  Progress updates
                </span>
                <input
                  type="checkbox"
                  checked={preferences.progressUpdates}
                  onChange={() => handleTogglePreference('progressUpdates')}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-[var(--glass-bg-subtle)] rounded-full peer peer-checked:bg-[var(--primary)] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-4 relative" />
              </label>
            </div>

            <button
              onClick={handleRequestPermission}
              disabled={isRequesting}
              className="mt-4 w-full liquid-button px-4 py-2 text-sm font-medium rounded-xl ripple disabled:opacity-50"
            >
              {isRequesting ? 'Enabling...' : 'Save & Enable'}
            </button>
          </>
        )}
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

export default NotificationPrompt;

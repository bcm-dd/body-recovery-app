'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isReady: boolean;
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
  error: Error | null;
}

interface UseServiceWorkerOptions {
  /** Path to the service worker file */
  swPath?: string;
  /** Scope for the service worker */
  scope?: string;
  /** Auto-update on new version detected */
  autoUpdate?: boolean;
  /** Check for updates interval (ms) */
  updateInterval?: number;
  /** Callback when update is available */
  onUpdateAvailable?: () => void;
  /** Callback when SW is registered */
  onRegistered?: (registration: ServiceWorkerRegistration) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

export function useServiceWorker({
  swPath = '/sw.js',
  scope = '/',
  autoUpdate = false,
  updateInterval = 60 * 60 * 1000, // 1 hour
  onUpdateAvailable,
  onRegistered,
  onError,
}: UseServiceWorkerOptions = {}) {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isReady: false,
    registration: null,
    updateAvailable: false,
    error: null,
  });

  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const updateCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Register service worker
  useEffect(() => {
    // Check if service workers are supported
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    setState((prev) => ({ ...prev, isSupported: true }));

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register(swPath, {
          scope,
        });

        registrationRef.current = registration;

        setState((prev) => ({
          ...prev,
          isRegistered: true,
          registration,
        }));

        onRegistered?.(registration);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                setState((prev) => ({ ...prev, updateAvailable: true }));
                onUpdateAvailable?.();

                if (autoUpdate) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              }
            });
          }
        });

        // Wait for SW to be ready
        const ready = await navigator.serviceWorker.ready;
        setState((prev) => ({ ...prev, isReady: true }));

        // Set up periodic update checks
        if (updateInterval > 0) {
          updateCheckIntervalRef.current = setInterval(() => {
            registration.update().catch(console.error);
          }, updateInterval);
        }

        // Handle controller changes (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // Reload to get new version
          window.location.reload();
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState((prev) => ({ ...prev, error: err }));
        onError?.(err);
        console.error('Service worker registration failed:', error);
      }
    };

    // Register on load
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => window.removeEventListener('load', registerSW);
    }

    return () => {
      if (updateCheckIntervalRef.current) {
        clearInterval(updateCheckIntervalRef.current);
      }
    };
  }, [swPath, scope, autoUpdate, updateInterval, onUpdateAvailable, onRegistered, onError]);

  // Update service worker
  const update = useCallback(async () => {
    if (registrationRef.current) {
      try {
        await registrationRef.current.update();
      } catch (error) {
        console.error('Failed to update service worker:', error);
      }
    }
  }, []);

  // Skip waiting and activate new service worker
  const skipWaiting = useCallback(() => {
    if (registrationRef.current?.waiting) {
      registrationRef.current.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, []);

  // Unregister service worker
  const unregister = useCallback(async () => {
    if (registrationRef.current) {
      try {
        await registrationRef.current.unregister();
        setState((prev) => ({
          ...prev,
          isRegistered: false,
          registration: null,
        }));
      } catch (error) {
        console.error('Failed to unregister service worker:', error);
      }
    }
  }, []);

  // Send message to service worker
  const postMessage = useCallback((message: unknown) => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }, []);

  // Clear all caches
  const clearCache = useCallback(() => {
    postMessage({ type: 'CLEAR_CACHE' });
  }, [postMessage]);

  return {
    ...state,
    update,
    skipWaiting,
    unregister,
    postMessage,
    clearCache,
  };
}

export default useServiceWorker;

'use client';

import type { ReactNode} from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

import { InstallPrompt } from './InstallPrompt';
import { NotificationPrompt } from './NotificationPrompt';
import { OfflineIndicator } from './OfflineIndicator';
import { UpdatePrompt } from './UpdatePrompt';
import { useBackgroundSync } from '../hooks/useBackgroundSync';
import { useOffline } from '../hooks/useOffline';
import { useServiceWorker } from '../hooks/useServiceWorker';

interface PWAContextValue {
  // Service Worker
  isServiceWorkerSupported: boolean;
  isServiceWorkerReady: boolean;
  serviceWorkerUpdateAvailable: boolean;
  updateServiceWorker: () => void;

  // Offline
  isOnline: boolean;
  connectionType: string | null;

  // Background Sync
  isBackgroundSyncSupported: boolean;
  pendingActionsCount: number;
  queueAction: (type: string, url: string, options?: RequestInit) => Promise<string>;
  queueWorkoutCompletion: (data: Record<string, unknown>) => Promise<string>;
  queueExerciseProgress: (data: Record<string, unknown>) => Promise<string>;
  queuePainLog: (data: Record<string, unknown>) => Promise<string>;
  syncNow: () => Promise<void>;
  prefetchExercises: (urls?: string[]) => Promise<void>;
  cacheWorkout: (url: string, data: Record<string, unknown>) => Promise<void>;

  // Install
  isInstalled: boolean;
  canInstall: boolean;

  // Notifications
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<NotificationPermission>;
}

const PWAContext = createContext<PWAContextValue | null>(null);

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}

interface PWAProviderProps {
  children: ReactNode;
  /** Show install prompt */
  showInstallPrompt?: boolean;
  /** Show notification prompt */
  showNotificationPrompt?: boolean;
  /** Show offline indicator */
  showOfflineIndicator?: boolean;
  /** Delay before showing install prompt (ms) */
  installPromptDelay?: number;
  /** Delay before showing notification prompt (ms) */
  notificationPromptDelay?: number;
}

export function PWAProvider({
  children,
  showInstallPrompt = true,
  showNotificationPrompt = true,
  showOfflineIndicator = true,
  installPromptDelay = 5000,
  notificationPromptDelay = 10000,
}: PWAProviderProps) {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Service Worker hook
  const {
    isSupported: isServiceWorkerSupported,
    isReady: isServiceWorkerReady,
    updateAvailable: serviceWorkerUpdateAvailable,
    skipWaiting,
  } = useServiceWorker({
    onUpdateAvailable: () => setShowUpdatePrompt(true),
  });

  // Offline hook
  const { isOnline, connectionType } = useOffline({
    onOnline: () => {
      // Sync when back online
      if (backgroundSync.isSupported && backgroundSync.pendingCount > 0) {
        backgroundSync.syncNow();
      }
    },
  });

  // Background Sync hook
  const backgroundSync = useBackgroundSync();

  // Check installation status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone || isIOSStandalone);

    // Listen for install prompt availability
    const handleBeforeInstallPrompt = () => {
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Check notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    return permission;
  }, []);

  // Handle service worker update
  const handleUpdate = useCallback(() => {
    skipWaiting();
    setShowUpdatePrompt(false);
    // The service worker's controllerchange event will reload the page
  }, [skipWaiting]);

  const contextValue: PWAContextValue = {
    // Service Worker
    isServiceWorkerSupported,
    isServiceWorkerReady,
    serviceWorkerUpdateAvailable,
    updateServiceWorker: skipWaiting,

    // Offline
    isOnline,
    connectionType,

    // Background Sync
    isBackgroundSyncSupported: backgroundSync.isSupported,
    pendingActionsCount: backgroundSync.pendingCount,
    queueAction: backgroundSync.queueAction,
    queueWorkoutCompletion: backgroundSync.queueWorkoutCompletion,
    queueExerciseProgress: backgroundSync.queueExerciseProgress,
    queuePainLog: backgroundSync.queuePainLog,
    syncNow: backgroundSync.syncNow,
    prefetchExercises: backgroundSync.prefetchExercises,
    cacheWorkout: backgroundSync.cacheWorkout,

    // Install
    isInstalled,
    canInstall,

    // Notifications
    notificationPermission,
    requestNotificationPermission,
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}

      {/* Offline Indicator */}
      {showOfflineIndicator && (
        <OfflineIndicator
          position="top"
          pendingCount={backgroundSync.pendingCount}
        />
      )}

      {/* Install Prompt */}
      {showInstallPrompt && !isInstalled && (
        <InstallPrompt
          delay={installPromptDelay}
          onInstall={() => setIsInstalled(true)}
        />
      )}

      {/* Notification Prompt - show after install or if already installed */}
      {showNotificationPrompt && notificationPermission === 'default' && (
        <NotificationPrompt
          delay={isInstalled ? notificationPromptDelay / 2 : notificationPromptDelay}
          onGranted={() => setNotificationPermission('granted')}
          onDenied={() => setNotificationPermission('denied')}
        />
      )}

      {/* Update Prompt */}
      <UpdatePrompt
        isVisible={showUpdatePrompt}
        onUpdate={handleUpdate}
        onDismiss={() => setShowUpdatePrompt(false)}
      />
    </PWAContext.Provider>
  );
}

export default PWAProvider;

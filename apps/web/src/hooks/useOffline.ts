'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface UseOfflineOptions {
  /** URL to ping for connection check */
  pingUrl?: string;
  /** Interval for connection checks (ms) */
  pingInterval?: number;
  /** Timeout for ping requests (ms) */
  pingTimeout?: number;
  /** Callback when going offline */
  onOffline?: () => void;
  /** Callback when coming back online */
  onOnline?: () => void;
}

interface OfflineState {
  isOnline: boolean;
  isChecking: boolean;
  lastOnline: Date | null;
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
}

interface NetworkInformation {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}

export function useOffline({
  pingUrl,
  pingInterval = 30000, // 30 seconds
  pingTimeout = 5000,
  onOffline,
  onOnline,
}: UseOfflineOptions = {}) {
  const [state, setState] = useState<OfflineState>({
    isOnline: true,
    isChecking: false,
    lastOnline: null,
    connectionType: null,
    effectiveType: null,
    downlink: null,
    rtt: null,
  });

  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wasOnlineRef = useRef(true);

  // Get network connection info
  const getConnectionInfo = useCallback(() => {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (connection) {
      return {
        connectionType: connection.type || null,
        effectiveType: connection.effectiveType || null,
        downlink: connection.downlink || null,
        rtt: connection.rtt || null,
      };
    }

    return {
      connectionType: null,
      effectiveType: null,
      downlink: null,
      rtt: null,
    };
  }, []);

  // Check connection by pinging a URL
  const checkConnection = useCallback(async () => {
    if (!pingUrl) {
      return navigator.onLine;
    }

    setState((prev) => ({ ...prev, isChecking: true }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), pingTimeout);

      const response = await fetch(pingUrl, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    } finally {
      setState((prev) => ({ ...prev, isChecking: false }));
    }
  }, [pingUrl, pingTimeout]);

  // Update online status
  const updateOnlineStatus = useCallback(
    async (online?: boolean) => {
      const isOnline = online ?? (await checkConnection());
      const connectionInfo = getConnectionInfo();

      setState((prev) => ({
        ...prev,
        isOnline,
        lastOnline: isOnline ? new Date() : prev.lastOnline,
        ...connectionInfo,
      }));

      // Trigger callbacks
      if (wasOnlineRef.current && !isOnline) {
        onOffline?.();
        // Save last online time to localStorage
        localStorage.setItem('body-recovery-last-online', new Date().toISOString());
      } else if (!wasOnlineRef.current && isOnline) {
        onOnline?.();
        // Update last sync time
        localStorage.setItem('body-recovery-last-sync', new Date().toISOString());
      }

      wasOnlineRef.current = isOnline;
    },
    [checkConnection, getConnectionInfo, onOffline, onOnline]
  );

  // Set up event listeners
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Initial state
    setState((prev) => ({
      ...prev,
      isOnline: navigator.onLine,
      ...getConnectionInfo(),
    }));

    // Online/offline events
    const handleOnline = () => updateOnlineStatus(true);
    const handleOffline = () => updateOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Network change events
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    const handleConnectionChange = () => {
      const connectionInfo = getConnectionInfo();
      setState((prev) => ({ ...prev, ...connectionInfo }));
    };

    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Set up periodic ping checks
    if (pingUrl && pingInterval > 0) {
      pingIntervalRef.current = setInterval(() => {
        updateOnlineStatus();
      }, pingInterval);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, [pingUrl, pingInterval, updateOnlineStatus, getConnectionInfo]);

  // Manual refresh
  const refresh = useCallback(() => {
    return updateOnlineStatus();
  }, [updateOnlineStatus]);

  return {
    ...state,
    refresh,
  };
}

export default useOffline;

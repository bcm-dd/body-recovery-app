'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface PendingAction {
  id: string;
  type: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  timestamp: number;
}

// Predefined sync tags for different action types
export const SYNC_TAGS = {
  PENDING_ACTIONS: 'sync-pending-actions',
  PAIN_LOGS: 'sync-pain-logs',
  CHECK_INS: 'sync-check-ins',
  WORKOUT_COMPLETIONS: 'sync-workout-completions',
  EXERCISE_PROGRESS: 'sync-exercise-progress',
} as const;

interface UseBackgroundSyncOptions {
  /** Sync tag name */
  syncTag?: string;
  /** Max retry attempts */
  maxRetries?: number;
  /** Callback when action is synced */
  onSynced?: (action: PendingAction) => void;
  /** Callback on sync error */
  onError?: (action: PendingAction, error: Error) => void;
  /** Callback when workout is synced */
  onWorkoutSynced?: (id: string) => void;
  /** Callback when progress is synced */
  onProgressSynced?: (id: string) => void;
}

interface BackgroundSyncState {
  isSupported: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: Date | null;
}

const DB_NAME = 'body-recovery-offline';
const DB_VERSION = 1;
const PENDING_STORE = 'pending-actions';

export function useBackgroundSync({
  syncTag = SYNC_TAGS.PENDING_ACTIONS,
  maxRetries = 3,
  onSynced,
  onError,
  onWorkoutSynced,
  onProgressSynced,
}: UseBackgroundSyncOptions = {}) {
  const [state, setState] = useState<BackgroundSyncState>({
    isSupported: false,
    pendingCount: 0,
    isSyncing: false,
    lastSyncTime: null,
  });

  const dbRef = useRef<IDBDatabase | null>(null);

  // Open IndexedDB
  const openDatabase = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (dbRef.current) {
        resolve(dbRef.current);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        dbRef.current = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(PENDING_STORE)) {
          const store = db.createObjectStore(PENDING_STORE, {
            keyPath: 'id',
            autoIncrement: false,
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }, []);

  // Initialize
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Check if Background Sync is supported
    const isSupported =
      'serviceWorker' in navigator && 'SyncManager' in window;

    setState((prev) => ({ ...prev, isSupported }));

    // Initialize database and count pending actions
    const init = async () => {
      try {
        const db = await openDatabase();
        const tx = db.transaction(PENDING_STORE, 'readonly');
        const store = tx.objectStore(PENDING_STORE);
        const countRequest = store.count();

        countRequest.onsuccess = () => {
          setState((prev) => ({ ...prev, pendingCount: countRequest.result }));
        };
      } catch (error) {
        console.error('Failed to initialize background sync:', error);
      }
    };

    init();

    // Listen for sync complete messages from service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        setState((prev) => ({
          ...prev,
          pendingCount: Math.max(0, prev.pendingCount - 1),
          lastSyncTime: new Date(),
        }));
      }

      if (event.data?.type === 'WORKOUT_SYNCED') {
        setState((prev) => ({
          ...prev,
          pendingCount: Math.max(0, prev.pendingCount - 1),
          lastSyncTime: new Date(),
        }));
        onWorkoutSynced?.(event.data.id);
      }

      if (event.data?.type === 'PROGRESS_SYNCED') {
        setState((prev) => ({
          ...prev,
          pendingCount: Math.max(0, prev.pendingCount - 1),
          lastSyncTime: new Date(),
        }));
        onProgressSynced?.(event.data.id);
      }

      if (event.data?.type === 'PENDING_COUNT') {
        setState((prev) => ({
          ...prev,
          pendingCount: event.data.payload.count,
        }));
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [openDatabase]);

  // Queue an action for background sync
  const queueAction = useCallback(
    async (
      type: string,
      url: string,
      options: RequestInit = {}
    ): Promise<string> => {
      const action: PendingAction = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        url,
        method: options.method || 'POST',
        headers: (options.headers as Record<string, string>) || {},
        body: (options.body as string) || '',
        timestamp: Date.now(),
      };

      try {
        const db = await openDatabase();
        const tx = db.transaction(PENDING_STORE, 'readwrite');
        const store = tx.objectStore(PENDING_STORE);

        await new Promise<void>((resolve, reject) => {
          const request = store.add(action);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });

        setState((prev) => ({ ...prev, pendingCount: prev.pendingCount + 1 }));

        // Request background sync
        if (state.isSupported) {
          const registration = await navigator.serviceWorker.ready;
          await (registration.sync as SyncManager).register(syncTag);
        }

        return action.id;
      } catch (error) {
        console.error('Failed to queue action:', error);
        throw error;
      }
    },
    [openDatabase, state.isSupported, syncTag]
  );

  // Get all pending actions
  const getPendingActions = useCallback(async (): Promise<PendingAction[]> => {
    try {
      const db = await openDatabase();
      const tx = db.transaction(PENDING_STORE, 'readonly');
      const store = tx.objectStore(PENDING_STORE);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    } catch (error) {
      console.error('Failed to get pending actions:', error);
      return [];
    }
  }, [openDatabase]);

  // Remove a pending action
  const removeAction = useCallback(
    async (id: string): Promise<void> => {
      try {
        const db = await openDatabase();
        const tx = db.transaction(PENDING_STORE, 'readwrite');
        const store = tx.objectStore(PENDING_STORE);

        await new Promise<void>((resolve, reject) => {
          const request = store.delete(id);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });

        setState((prev) => ({
          ...prev,
          pendingCount: Math.max(0, prev.pendingCount - 1),
        }));
      } catch (error) {
        console.error('Failed to remove action:', error);
      }
    },
    [openDatabase]
  );

  // Clear all pending actions
  const clearPendingActions = useCallback(async (): Promise<void> => {
    try {
      const db = await openDatabase();
      const tx = db.transaction(PENDING_STORE, 'readwrite');
      const store = tx.objectStore(PENDING_STORE);

      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      setState((prev) => ({ ...prev, pendingCount: 0 }));
    } catch (error) {
      console.error('Failed to clear pending actions:', error);
    }
  }, [openDatabase]);

  // Manually sync pending actions
  const syncNow = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isSyncing: true }));

    try {
      const actions = await getPendingActions();

      for (const action of actions) {
        try {
          const response = await fetch(action.url, {
            method: action.method,
            headers: action.headers,
            body: action.body || undefined,
          });

          if (response.ok) {
            await removeAction(action.id);
            onSynced?.(action);
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          onError?.(action, err);
          console.error('Failed to sync action:', action.id, error);
        }
      }

      setState((prev) => ({
        ...prev,
        lastSyncTime: new Date(),
      }));
    } finally {
      setState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [getPendingActions, removeAction, onSynced, onError]);

  // Queue a workout completion for sync
  const queueWorkoutCompletion = useCallback(
    async (workoutData: Record<string, unknown>): Promise<string> => {
      const actionId = await queueAction(
        'workout-completion',
        '/api/workouts/complete',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workoutData),
        }
      );

      // Request background sync with workout-specific tag
      if (state.isSupported) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await (registration.sync as SyncManager).register(SYNC_TAGS.WORKOUT_COMPLETIONS);
        } catch (error) {
          console.error('Failed to register workout sync:', error);
        }
      }

      return actionId;
    },
    [queueAction, state.isSupported]
  );

  // Queue exercise progress for sync
  const queueExerciseProgress = useCallback(
    async (progressData: Record<string, unknown>): Promise<string> => {
      const actionId = await queueAction(
        'exercise-progress',
        '/api/exercises/progress',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progressData),
        }
      );

      // Request background sync with progress-specific tag
      if (state.isSupported) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await (registration.sync as SyncManager).register(SYNC_TAGS.EXERCISE_PROGRESS);
        } catch (error) {
          console.error('Failed to register progress sync:', error);
        }
      }

      return actionId;
    },
    [queueAction, state.isSupported]
  );

  // Queue pain log for sync
  const queuePainLog = useCallback(
    async (painData: Record<string, unknown>): Promise<string> => {
      const actionId = await queueAction(
        'pain-log',
        '/api/pain/log',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(painData),
        }
      );

      if (state.isSupported) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await (registration.sync as SyncManager).register(SYNC_TAGS.PAIN_LOGS);
        } catch (error) {
          console.error('Failed to register pain log sync:', error);
        }
      }

      return actionId;
    },
    [queueAction, state.isSupported]
  );

  // Prefetch exercises for offline use
  const prefetchExercises = useCallback(
    async (urls?: string[]): Promise<void> => {
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'PREFETCH_EXERCISES',
          payload: urls ? { urls } : undefined,
        });
      }
    },
    []
  );

  // Cache workout data for offline use
  const cacheWorkout = useCallback(
    async (url: string, data: Record<string, unknown>): Promise<void> => {
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_WORKOUT',
          payload: { url, data },
        });
      }
    },
    []
  );

  return {
    ...state,
    queueAction,
    queueWorkoutCompletion,
    queueExerciseProgress,
    queuePainLog,
    getPendingActions,
    removeAction,
    clearPendingActions,
    syncNow,
    prefetchExercises,
    cacheWorkout,
    SYNC_TAGS,
  };
}

// Type declaration for SyncManager
interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

declare global {
  interface ServiceWorkerRegistration {
    sync: SyncManager;
  }

  interface Window {
    SyncManager: {
      new (): SyncManager;
    };
  }
}

export default useBackgroundSync;

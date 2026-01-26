import { MMKV } from 'react-native-mmkv';

/**
 * Storage adapter using MMKV for fast, synchronous storage.
 *
 * MMKV is 30-100x faster than AsyncStorage and provides:
 * - Synchronous reads (no loading states for cached data)
 * - Memory-mapped file with CRC checksum
 * - Built-in encryption support
 */

// Default storage instance
export const storage = new MMKV();

// Encrypted storage for sensitive data (health data, etc.)
export const secureStorage = new MMKV({
  id: 'secure-storage',
  // In production, use a proper encryption key management system
  // encryptionKey: 'your-encryption-key',
});

/**
 * Storage keys used throughout the app
 */
export const StorageKeys = {
  // User preferences
  ONBOARDING_COMPLETED: 'onboarding_completed',
  USER_PREFERENCES: 'user_preferences',
  THEME_PREFERENCE: 'theme_preference',

  // Body state
  BODY_STATE: 'body_state',
  LAST_CHECK_IN: 'last_check_in',

  // Workout state
  ACTIVE_WORKOUT: 'active_workout',
  WORKOUT_HISTORY: 'workout_history',

  // Health data
  HEALTH_SNAPSHOT: 'health_snapshot',
  HEALTH_PERMISSIONS: 'health_permissions',

  // Offline sync
  SYNC_QUEUE: 'sync_queue',
  LAST_SYNC: 'last_sync',

  // Auth
  AUTH_TOKEN: 'auth_token',
  USER_ID: 'user_id',
} as const;

/**
 * Generic storage interface for type-safe storage operations
 */
export interface StorageAdapter {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
  contains: (key: string) => boolean;
  getAllKeys: () => string[];
  clearAll: () => void;
}

/**
 * Create a storage adapter from an MMKV instance
 */
export function createMMKVAdapter(instance: MMKV = storage): StorageAdapter {
  return {
    get: (key: string) => instance.getString(key) ?? null,
    set: (key: string, value: string) => instance.set(key, value),
    delete: (key: string) => instance.delete(key),
    contains: (key: string) => instance.contains(key),
    getAllKeys: () => instance.getAllKeys(),
    clearAll: () => instance.clearAll(),
  };
}

/**
 * Helper to store JSON objects
 */
export function setJSON<T>(key: string, value: T, instance: MMKV = storage): void {
  instance.set(key, JSON.stringify(value));
}

/**
 * Helper to retrieve JSON objects
 */
export function getJSON<T>(key: string, instance: MMKV = storage): T | null {
  const value = instance.getString(key);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Helper to store boolean values
 */
export function setBoolean(key: string, value: boolean, instance: MMKV = storage): void {
  instance.set(key, value);
}

/**
 * Helper to retrieve boolean values
 */
export function getBoolean(key: string, instance: MMKV = storage): boolean {
  return instance.getBoolean(key) ?? false;
}

/**
 * Helper to store number values
 */
export function setNumber(key: string, value: number, instance: MMKV = storage): void {
  instance.set(key, value);
}

/**
 * Helper to retrieve number values
 */
export function getNumber(key: string, instance: MMKV = storage): number | null {
  const value = instance.getNumber(key);
  return value !== undefined ? value : null;
}

export default {
  storage,
  secureStorage,
  StorageKeys,
  createMMKVAdapter,
  setJSON,
  getJSON,
  setBoolean,
  getBoolean,
  setNumber,
  getNumber,
};

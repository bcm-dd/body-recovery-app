/**
 * Storage Module
 *
 * Provides unified storage adapters for cross-platform persistence.
 */

// Interface
export type {
  StorageAdapter,
  StorageValue,
  StorageOptions,
  StorageListener,
} from './interface';
export { createNamespacedStorage } from './interface';

// MMKV (Mobile)
export {
  MMKVStorageAdapter,
  createMMKVStorage,
  createSecureMMKVStorage,
} from './mmkv';

// LocalStorage (Web)
export {
  LocalStorageAdapter,
  createLocalStorage,
  InMemoryStorageAdapter,
  createInMemoryStorage,
} from './localStorage';

// ============================================
// PLATFORM-AWARE FACTORY
// ============================================

import type { StorageAdapter, StorageOptions } from './interface';
import { createLocalStorage, createInMemoryStorage } from './localStorage';

/**
 * Create a storage adapter appropriate for the current platform
 *
 * @param options - Storage options
 * @returns Platform-appropriate storage adapter
 *
 * Usage:
 * - On React Native: Returns MMKV adapter
 * - On Web with localStorage: Returns LocalStorage adapter
 * - On SSR/Node: Returns InMemory adapter
 */
export function createStorage(options?: StorageOptions): StorageAdapter {
  // Check for React Native environment
  const isReactNative =
    typeof navigator !== 'undefined' &&
    navigator.product === 'ReactNative';

  if (isReactNative) {
    // Dynamic import to avoid bundling MMKV on web
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createMMKVStorage } = require('./mmkv');
      return createMMKVStorage(options);
    } catch {
      console.warn('[Storage] MMKV not available, falling back to memory storage');
      return createInMemoryStorage();
    }
  }

  // Web environment
  if (typeof window !== 'undefined' && window.localStorage) {
    return createLocalStorage(options);
  }

  // SSR or Node environment
  return createInMemoryStorage();
}

// ============================================
// DEFAULT INSTANCES
// ============================================

let defaultStorage: StorageAdapter | null = null;
let secureStorage: StorageAdapter | null = null;

/**
 * Get the default storage instance
 * Creates one if it doesn't exist
 */
export function getDefaultStorage(): StorageAdapter {
  if (!defaultStorage) {
    defaultStorage = createStorage({ id: 'body-recovery' });
  }
  return defaultStorage;
}

/**
 * Get the secure storage instance
 * Creates one if it doesn't exist
 *
 * Note: On web, this returns regular localStorage (not encrypted)
 * Real encryption requires MMKV on mobile
 */
export function getSecureStorage(): StorageAdapter {
  if (!secureStorage) {
    const isReactNative =
      typeof navigator !== 'undefined' &&
      navigator.product === 'ReactNative';

    if (isReactNative) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { createSecureMMKVStorage } = require('./mmkv');
        // WARNING: DEMO ONLY - Hardcoded encryption key for development/demo purposes.
        // In production, this key MUST come from secure storage (e.g., iOS Keychain,
        // Android Keystore) or be derived from device-specific secure enclave.
        // Using a hardcoded key provides NO real security.
        const encryptionKey = 'TODO_GENERATE_SECURE_KEY';
        secureStorage = createSecureMMKVStorage(encryptionKey);
      } catch {
        console.warn('[Storage] Secure MMKV not available, falling back to memory');
        secureStorage = createInMemoryStorage();
      }
    } else {
      // Web fallback (not actually encrypted)
      secureStorage = createLocalStorage({ id: 'body-recovery-secure' });
    }
  }
  return secureStorage!;
}

/**
 * Reset storage instances
 * Useful for testing
 */
export function resetStorageInstances(): void {
  defaultStorage = null;
  secureStorage = null;
}

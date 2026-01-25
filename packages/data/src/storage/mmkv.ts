/**
 * MMKV Storage Adapter
 *
 * High-performance storage implementation using react-native-mmkv.
 * Provides synchronous reads and is 30-100x faster than AsyncStorage.
 *
 * REQUIREMENTS:
 * - react-native-mmkv package installed
 * - Expo development build (not Expo Go)
 */

import type {
  StorageAdapter,
  StorageValue,
  StorageOptions,
  StorageListener,
} from './interface';

// ============================================
// TYPES
// ============================================

/**
 * MMKV instance type (from react-native-mmkv)
 */
interface MMKVInstance {
  getString(key: string): string | undefined;
  getNumber(key: string): number | undefined;
  getBoolean(key: string): boolean | undefined;
  set(key: string, value: string | number | boolean): void;
  delete(key: string): void;
  contains(key: string): boolean;
  getAllKeys(): string[];
  clearAll(): void;
  addOnValueChangedListener(callback: (key: string) => void): () => void;
}

/**
 * MMKV constructor options
 */
interface MMKVOptions {
  id?: string;
  encryptionKey?: string;
}

// ============================================
// ADAPTER
// ============================================

/**
 * MMKV Storage Adapter
 *
 * Wraps react-native-mmkv with our StorageAdapter interface.
 */
export class MMKVStorageAdapter implements StorageAdapter {
  private mmkv: MMKVInstance;
  private listeners: Set<StorageListener> = new Set();
  private encrypted: boolean;

  constructor(options: StorageOptions = {}) {
    // Dynamic import to allow this file to be imported on web
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MMKV } = require('react-native-mmkv') as {
      MMKV: new (options: MMKVOptions) => MMKVInstance;
    };

    const mmkvOptions: MMKVOptions = {
      id: options.id || 'body-recovery-app',
    };

    if (options.encrypted && options.encryptionKey) {
      mmkvOptions.encryptionKey = options.encryptionKey;
      this.encrypted = true;
    } else {
      this.encrypted = false;
    }

    this.mmkv = new MMKV(mmkvOptions);

    // Set up value change listener
    this.mmkv.addOnValueChangedListener((key) => {
      const value = this.getString(key) ?? this.getNumber(key) ?? this.getBoolean(key);
      this.notifyListeners(key, value ?? null);
    });
  }

  // ============================================
  // READ OPERATIONS
  // ============================================

  getString(key: string): string | undefined {
    return this.mmkv.getString(key);
  }

  getNumber(key: string): number | undefined {
    return this.mmkv.getNumber(key);
  }

  getBoolean(key: string): boolean | undefined {
    return this.mmkv.getBoolean(key);
  }

  getObject<T>(key: string): T | undefined {
    const json = this.mmkv.getString(key);
    if (!json) return undefined;

    try {
      return JSON.parse(json) as T;
    } catch {
      return undefined;
    }
  }

  contains(key: string): boolean {
    return this.mmkv.contains(key);
  }

  getAllKeys(): string[] {
    return this.mmkv.getAllKeys();
  }

  // ============================================
  // WRITE OPERATIONS
  // ============================================

  set(key: string, value: string | number | boolean): void {
    this.mmkv.set(key, value);
    this.notifyListeners(key, value);
  }

  setObject<T>(key: string, value: T): void {
    const json = JSON.stringify(value);
    this.mmkv.set(key, json);
    this.notifyListeners(key, value as StorageValue);
  }

  delete(key: string): void {
    this.mmkv.delete(key);
    this.notifyListeners(key, null);
  }

  clearAll(): void {
    this.mmkv.clearAll();
  }

  // ============================================
  // BATCH OPERATIONS
  // ============================================

  getMultiple(keys: string[]): Record<string, StorageValue> {
    const result: Record<string, StorageValue> = {};

    for (const key of keys) {
      // Try each type
      const strValue = this.getString(key);
      if (strValue !== undefined) {
        result[key] = strValue;
        continue;
      }

      const numValue = this.getNumber(key);
      if (numValue !== undefined) {
        result[key] = numValue;
        continue;
      }

      const boolValue = this.getBoolean(key);
      if (boolValue !== undefined) {
        result[key] = boolValue;
        continue;
      }
    }

    return result;
  }

  setMultiple(values: Record<string, StorageValue>): void {
    for (const [key, value] of Object.entries(values)) {
      if (value === null) {
        this.delete(key);
      } else if (typeof value === 'object') {
        this.setObject(key, value);
      } else {
        this.set(key, value as string | number | boolean);
      }
    }
  }

  deleteMultiple(keys: string[]): void {
    for (const key of keys) {
      this.delete(key);
    }
  }

  // ============================================
  // LISTENERS
  // ============================================

  addListener(listener: StorageListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(key: string, value: StorageValue): void {
    for (const listener of this.listeners) {
      try {
        listener(key, value);
      } catch (error) {
        console.error('[MMKVStorage] Listener error:', error);
      }
    }
  }

  // ============================================
  // UTILITY
  // ============================================

  getSize(): number {
    // MMKV doesn't expose size directly, estimate from keys
    const keys = this.getAllKeys();
    let size = 0;

    for (const key of keys) {
      const value = this.getString(key);
      if (value) {
        size += key.length + value.length;
      }
    }

    return size;
  }

  isEncrypted(): boolean {
    return this.encrypted;
  }
}

// ============================================
// FACTORY
// ============================================

/**
 * Create MMKV storage instance
 */
export function createMMKVStorage(options?: StorageOptions): StorageAdapter {
  return new MMKVStorageAdapter(options);
}

/**
 * Create encrypted MMKV storage instance
 */
export function createSecureMMKVStorage(
  encryptionKey: string,
  id: string = 'body-recovery-secure'
): StorageAdapter {
  return new MMKVStorageAdapter({
    id,
    encrypted: true,
    encryptionKey,
  });
}

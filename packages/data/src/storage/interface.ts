/**
 * Storage Adapter Interface
 *
 * Unified interface for persistent storage across platforms.
 * Implements synchronous reads for UI performance.
 */

// ============================================
// TYPES
// ============================================

/**
 * Serializable value types
 */
export type StorageValue = string | number | boolean | object | null;

/**
 * Storage options
 */
export interface StorageOptions {
  /**
   * Unique identifier for the storage instance
   */
  id?: string;

  /**
   * Enable encryption (if supported)
   */
  encrypted?: boolean;

  /**
   * Encryption key (if encryption enabled)
   */
  encryptionKey?: string;
}

/**
 * Listener for storage changes
 */
export type StorageListener = (key: string, value: StorageValue) => void;

// ============================================
// INTERFACE
// ============================================

/**
 * Storage Adapter Interface
 *
 * Provides a unified API for persistent storage.
 * All read operations are synchronous for UI performance.
 * Write operations may be asynchronous for persistence.
 */
export interface StorageAdapter {
  // ============================================
  // READ OPERATIONS (Synchronous)
  // ============================================

  /**
   * Get a string value
   */
  getString(key: string): string | undefined;

  /**
   * Get a number value
   */
  getNumber(key: string): number | undefined;

  /**
   * Get a boolean value
   */
  getBoolean(key: string): boolean | undefined;

  /**
   * Get an object value (parsed from JSON)
   */
  getObject<T>(key: string): T | undefined;

  /**
   * Check if a key exists
   */
  contains(key: string): boolean;

  /**
   * Get all keys
   */
  getAllKeys(): string[];

  // ============================================
  // WRITE OPERATIONS
  // ============================================

  /**
   * Set a string value
   */
  set(key: string, value: string): void;

  /**
   * Set a number value
   */
  set(key: string, value: number): void;

  /**
   * Set a boolean value
   */
  set(key: string, value: boolean): void;

  /**
   * Set an object value (will be serialized to JSON)
   */
  setObject<T>(key: string, value: T): void;

  /**
   * Delete a key
   */
  delete(key: string): void;

  /**
   * Clear all data
   */
  clearAll(): void;

  // ============================================
  // BATCH OPERATIONS
  // ============================================

  /**
   * Get multiple values at once
   */
  getMultiple(keys: string[]): Record<string, StorageValue>;

  /**
   * Set multiple values at once
   */
  setMultiple(values: Record<string, StorageValue>): void;

  /**
   * Delete multiple keys at once
   */
  deleteMultiple(keys: string[]): void;

  // ============================================
  // LISTENERS
  // ============================================

  /**
   * Add a listener for storage changes
   * Returns an unsubscribe function
   */
  addListener(listener: StorageListener): () => void;

  // ============================================
  // UTILITY
  // ============================================

  /**
   * Get the size of the storage in bytes (approximate)
   */
  getSize(): number;

  /**
   * Check if the storage is encrypted
   */
  isEncrypted(): boolean;
}

// ============================================
// HELPERS
// ============================================

/**
 * Create a namespaced storage adapter
 * Prefixes all keys with a namespace
 */
export function createNamespacedStorage(
  storage: StorageAdapter,
  namespace: string
): StorageAdapter {
  const prefix = `${namespace}:`;

  return {
    getString: (key) => storage.getString(`${prefix}${key}`),
    getNumber: (key) => storage.getNumber(`${prefix}${key}`),
    getBoolean: (key) => storage.getBoolean(`${prefix}${key}`),
    getObject: <T>(key: string) => storage.getObject<T>(`${prefix}${key}`),
    contains: (key) => storage.contains(`${prefix}${key}`),
    getAllKeys: () =>
      storage
        .getAllKeys()
        .filter((k) => k.startsWith(prefix))
        .map((k) => k.slice(prefix.length)),
    set: (key: string, value: string | number | boolean) =>
      storage.set(`${prefix}${key}`, value as string),
    setObject: <T>(key: string, value: T) =>
      storage.setObject(`${prefix}${key}`, value),
    delete: (key) => storage.delete(`${prefix}${key}`),
    clearAll: () => {
      const keys = storage
        .getAllKeys()
        .filter((k) => k.startsWith(prefix));
      storage.deleteMultiple(keys);
    },
    getMultiple: (keys) => {
      const prefixedKeys = keys.map((k) => `${prefix}${k}`);
      const result = storage.getMultiple(prefixedKeys);
      const unprefixed: Record<string, StorageValue> = {};
      for (const [key, value] of Object.entries(result)) {
        unprefixed[key.slice(prefix.length)] = value;
      }
      return unprefixed;
    },
    setMultiple: (values) => {
      const prefixed: Record<string, StorageValue> = {};
      for (const [key, value] of Object.entries(values)) {
        prefixed[`${prefix}${key}`] = value;
      }
      storage.setMultiple(prefixed);
    },
    deleteMultiple: (keys) => {
      storage.deleteMultiple(keys.map((k) => `${prefix}${k}`));
    },
    addListener: (listener) =>
      storage.addListener((key, value) => {
        if (key.startsWith(prefix)) {
          listener(key.slice(prefix.length), value);
        }
      }),
    getSize: () => storage.getSize(),
    isEncrypted: () => storage.isEncrypted(),
  };
}

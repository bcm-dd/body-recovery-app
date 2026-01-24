/**
 * LocalStorage Adapter
 *
 * Web-compatible storage implementation using browser localStorage.
 * Provides the same interface as MMKV for cross-platform compatibility.
 */

import {
  StorageAdapter,
  StorageValue,
  StorageOptions,
  StorageListener,
} from './interface';

// ============================================
// ADAPTER
// ============================================

/**
 * LocalStorage Adapter
 *
 * Wraps browser localStorage with our StorageAdapter interface.
 * Uses a prefix for namespacing and JSON encoding for type safety.
 */
export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;
  private listeners: Set<StorageListener> = new Set();
  private originalSetItem?: typeof localStorage.setItem;
  private originalRemoveItem?: typeof localStorage.removeItem;

  constructor(options: StorageOptions = {}) {
    this.prefix = options.id ? `${options.id}:` : 'body-recovery:';

    // Intercept localStorage changes for notifications
    if (typeof window !== 'undefined' && window.localStorage) {
      this.originalSetItem = localStorage.setItem.bind(localStorage);
      this.originalRemoveItem = localStorage.removeItem.bind(localStorage);

      // Listen for storage events (cross-tab)
      window.addEventListener('storage', this.handleStorageEvent.bind(this));
    }
  }

  private handleStorageEvent(event: StorageEvent): void {
    if (event.key?.startsWith(this.prefix)) {
      const key = event.key.slice(this.prefix.length);
      const value = event.newValue ? this.parseValue(event.newValue) : null;
      this.notifyListeners(key, value);
    }
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private parseValue(raw: string): StorageValue {
    try {
      const parsed = JSON.parse(raw);
      return parsed.value;
    } catch {
      return raw;
    }
  }

  private encodeValue(value: StorageValue, type: string): string {
    return JSON.stringify({ type, value });
  }

  // ============================================
  // READ OPERATIONS
  // ============================================

  getString(key: string): string | undefined {
    if (typeof localStorage === 'undefined') return undefined;

    const raw = localStorage.getItem(this.getFullKey(key));
    if (!raw) return undefined;

    try {
      const parsed = JSON.parse(raw);
      if (parsed.type === 'string') {
        return parsed.value;
      }
    } catch {
      // Handle raw string values
      return raw;
    }

    return undefined;
  }

  getNumber(key: string): number | undefined {
    if (typeof localStorage === 'undefined') return undefined;

    const raw = localStorage.getItem(this.getFullKey(key));
    if (!raw) return undefined;

    try {
      const parsed = JSON.parse(raw);
      if (parsed.type === 'number') {
        return parsed.value;
      }
    } catch {
      // Try parsing as number
      const num = parseFloat(raw);
      if (!isNaN(num)) return num;
    }

    return undefined;
  }

  getBoolean(key: string): boolean | undefined {
    if (typeof localStorage === 'undefined') return undefined;

    const raw = localStorage.getItem(this.getFullKey(key));
    if (!raw) return undefined;

    try {
      const parsed = JSON.parse(raw);
      if (parsed.type === 'boolean') {
        return parsed.value;
      }
    } catch {
      // Handle string booleans
      if (raw === 'true') return true;
      if (raw === 'false') return false;
    }

    return undefined;
  }

  getObject<T>(key: string): T | undefined {
    if (typeof localStorage === 'undefined') return undefined;

    const raw = localStorage.getItem(this.getFullKey(key));
    if (!raw) return undefined;

    try {
      const parsed = JSON.parse(raw);
      if (parsed.type === 'object') {
        return parsed.value as T;
      }
    } catch {
      // Can't parse
    }

    return undefined;
  }

  contains(key: string): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(this.getFullKey(key)) !== null;
  }

  getAllKeys(): string[] {
    if (typeof localStorage === 'undefined') return [];

    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length));
      }
    }
    return keys;
  }

  // ============================================
  // WRITE OPERATIONS
  // ============================================

  set(key: string, value: string | number | boolean): void {
    if (typeof localStorage === 'undefined') return;

    const type = typeof value;
    const encoded = this.encodeValue(value, type);

    localStorage.setItem(this.getFullKey(key), encoded);
    this.notifyListeners(key, value);
  }

  setObject<T>(key: string, value: T): void {
    if (typeof localStorage === 'undefined') return;

    const encoded = this.encodeValue(value as StorageValue, 'object');

    localStorage.setItem(this.getFullKey(key), encoded);
    this.notifyListeners(key, value as StorageValue);
  }

  delete(key: string): void {
    if (typeof localStorage === 'undefined') return;

    localStorage.removeItem(this.getFullKey(key));
    this.notifyListeners(key, null);
  }

  clearAll(): void {
    if (typeof localStorage === 'undefined') return;

    const keysToRemove = this.getAllKeys();
    for (const key of keysToRemove) {
      localStorage.removeItem(this.getFullKey(key));
    }
  }

  // ============================================
  // BATCH OPERATIONS
  // ============================================

  getMultiple(keys: string[]): Record<string, StorageValue> {
    const result: Record<string, StorageValue> = {};

    for (const key of keys) {
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

      const objValue = this.getObject(key);
      if (objValue !== undefined) {
        result[key] = objValue;
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
        console.error('[LocalStorage] Listener error:', error);
      }
    }
  }

  // ============================================
  // UTILITY
  // ============================================

  getSize(): number {
    if (typeof localStorage === 'undefined') return 0;

    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const value = localStorage.getItem(key);
        if (value) {
          size += key.length + value.length;
        }
      }
    }
    return size;
  }

  isEncrypted(): boolean {
    // localStorage is not encrypted
    return false;
  }
}

// ============================================
// FACTORY
// ============================================

/**
 * Create localStorage instance
 */
export function createLocalStorage(options?: StorageOptions): StorageAdapter {
  return new LocalStorageAdapter(options);
}

// ============================================
// IN-MEMORY FALLBACK
// ============================================

/**
 * In-memory storage for SSR and environments without localStorage
 */
export class InMemoryStorageAdapter implements StorageAdapter {
  private data: Map<string, StorageValue> = new Map();
  private listeners: Set<StorageListener> = new Set();

  getString(key: string): string | undefined {
    const value = this.data.get(key);
    return typeof value === 'string' ? value : undefined;
  }

  getNumber(key: string): number | undefined {
    const value = this.data.get(key);
    return typeof value === 'number' ? value : undefined;
  }

  getBoolean(key: string): boolean | undefined {
    const value = this.data.get(key);
    return typeof value === 'boolean' ? value : undefined;
  }

  getObject<T>(key: string): T | undefined {
    const value = this.data.get(key);
    return typeof value === 'object' ? (value as T) : undefined;
  }

  contains(key: string): boolean {
    return this.data.has(key);
  }

  getAllKeys(): string[] {
    return Array.from(this.data.keys());
  }

  set(key: string, value: string | number | boolean): void {
    this.data.set(key, value);
    this.notifyListeners(key, value);
  }

  setObject<T>(key: string, value: T): void {
    this.data.set(key, value as StorageValue);
    this.notifyListeners(key, value as StorageValue);
  }

  delete(key: string): void {
    this.data.delete(key);
    this.notifyListeners(key, null);
  }

  clearAll(): void {
    this.data.clear();
  }

  getMultiple(keys: string[]): Record<string, StorageValue> {
    const result: Record<string, StorageValue> = {};
    for (const key of keys) {
      if (this.data.has(key)) {
        result[key] = this.data.get(key)!;
      }
    }
    return result;
  }

  setMultiple(values: Record<string, StorageValue>): void {
    for (const [key, value] of Object.entries(values)) {
      if (value === null) {
        this.delete(key);
      } else {
        this.data.set(key, value);
      }
    }
  }

  deleteMultiple(keys: string[]): void {
    for (const key of keys) {
      this.delete(key);
    }
  }

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
        console.error('[InMemoryStorage] Listener error:', error);
      }
    }
  }

  getSize(): number {
    let size = 0;
    for (const [key, value] of this.data) {
      size += key.length + JSON.stringify(value).length;
    }
    return size;
  }

  isEncrypted(): boolean {
    return false;
  }
}

/**
 * Create in-memory storage instance
 */
export function createInMemoryStorage(): StorageAdapter {
  return new InMemoryStorageAdapter();
}

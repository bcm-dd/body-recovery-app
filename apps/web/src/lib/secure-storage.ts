/**
 * Secure Storage Utilities
 *
 * A wrapper around localStorage/sessionStorage that provides:
 * - Optional encryption for sensitive data
 * - Automatic expiry for stored items
 * - Integrity checks to detect tampering
 * - Safe fallbacks when storage is unavailable
 */

// =============================================================================
// Types
// =============================================================================

export interface StorageOptions {
  /** Time-to-live in milliseconds (optional) */
  ttl?: number;
  /** Whether to encrypt the value (default: false) */
  encrypt?: boolean;
  /** Storage type to use (default: 'local') */
  storage?: 'local' | 'session';
}

export interface StoredItem<T> {
  value: T;
  timestamp: number;
  expiry: number | null;
  checksum: string;
  encrypted: boolean;
  version: number;
}

// =============================================================================
// Constants
// =============================================================================

const STORAGE_VERSION = 1;
const STORAGE_PREFIX = '__secure_';

// =============================================================================
// Encryption Utilities (Browser-safe, basic obfuscation)
// =============================================================================

/**
 * Simple XOR-based obfuscation for browser storage
 * Note: This is NOT cryptographically secure - for sensitive data,
 * use server-side storage or Web Crypto API with proper key management
 */
class SimpleEncryption {
  private key: string;

  constructor(key: string = 'default_key') {
    this.key = key;
  }

  /**
   * Encodes a string using XOR with the key
   */
  encode(text: string): string {
    const textBytes = new TextEncoder().encode(text);
    const keyBytes = new TextEncoder().encode(this.key);
    const result = new Uint8Array(textBytes.length);

    for (let i = 0; i < textBytes.length; i++) {
      result[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    return btoa(String.fromCharCode(...result));
  }

  /**
   * Decodes a string encoded with encode()
   */
  decode(encoded: string): string {
    try {
      const decoded = atob(encoded);
      const bytes = new Uint8Array(decoded.length);

      for (let i = 0; i < decoded.length; i++) {
        bytes[i] = decoded.charCodeAt(i);
      }

      const keyBytes = new TextEncoder().encode(this.key);
      const result = new Uint8Array(bytes.length);

      for (let i = 0; i < bytes.length; i++) {
        result[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
      }

      return new TextDecoder().decode(result);
    } catch {
      return '';
    }
  }
}

// =============================================================================
// Checksum Utilities
// =============================================================================

/**
 * Generates a simple checksum for integrity verification
 * Uses a combination of length and character codes
 */
function generateChecksum(data: string): string {
  let hash = 0;
  const str = data + data.length.toString();

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(16);
}

/**
 * Verifies that data matches its checksum
 */
function verifyChecksum(data: string, checksum: string): boolean {
  return generateChecksum(data) === checksum;
}

// =============================================================================
// Storage Availability Check
// =============================================================================

/**
 * Checks if a storage type is available
 */
function isStorageAvailable(type: 'local' | 'session'): boolean {
  try {
    const storage = type === 'local' ? window.localStorage : window.sessionStorage;
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// Secure Storage Class
// =============================================================================

/**
 * Secure storage wrapper with encryption, expiry, and integrity checks
 */
export class SecureStorage {
  private encryption: SimpleEncryption;
  private prefix: string;

  constructor(encryptionKey?: string, prefix: string = STORAGE_PREFIX) {
    this.encryption = new SimpleEncryption(encryptionKey);
    this.prefix = prefix;
  }

  /**
   * Gets the appropriate storage object
   */
  private getStorage(type: 'local' | 'session'): Storage | null {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!isStorageAvailable(type)) {
      return null;
    }

    return type === 'local' ? window.localStorage : window.sessionStorage;
  }

  /**
   * Gets the full key with prefix
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Sets an item in storage
   */
  set<T>(key: string, value: T, options: StorageOptions = {}): boolean {
    const { ttl, encrypt = false, storage = 'local' } = options;

    const storageObj = this.getStorage(storage);
    if (!storageObj) {
      console.warn('Storage not available');
      return false;
    }

    try {
      let serialized = JSON.stringify(value);

      if (encrypt) {
        serialized = this.encryption.encode(serialized);
      }

      const item: StoredItem<string> = {
        value: serialized,
        timestamp: Date.now(),
        expiry: ttl ? Date.now() + ttl : null,
        checksum: generateChecksum(serialized),
        encrypted: encrypt,
        version: STORAGE_VERSION,
      };

      storageObj.setItem(this.getKey(key), JSON.stringify(item));
      return true;
    } catch (error) {
      // Storage quota exceeded or other error
      console.warn('Failed to store item:', error);
      return false;
    }
  }

  /**
   * Gets an item from storage
   */
  get<T>(key: string, options: { storage?: 'local' | 'session' } = {}): T | null {
    const { storage = 'local' } = options;

    const storageObj = this.getStorage(storage);
    if (!storageObj) {
      return null;
    }

    try {
      const raw = storageObj.getItem(this.getKey(key));
      if (!raw) {
        return null;
      }

      const item: StoredItem<string> = JSON.parse(raw);

      // Check version compatibility
      if (item.version !== STORAGE_VERSION) {
        this.remove(key, { storage });
        return null;
      }

      // Check expiry
      if (item.expiry && Date.now() > item.expiry) {
        this.remove(key, { storage });
        return null;
      }

      // Verify integrity
      if (!verifyChecksum(item.value, item.checksum)) {
        console.warn('Storage item integrity check failed:', key);
        this.remove(key, { storage });
        return null;
      }

      // Decrypt if needed
      let serialized = item.value;
      if (item.encrypted) {
        serialized = this.encryption.decode(serialized);
        if (!serialized) {
          console.warn('Failed to decrypt storage item:', key);
          return null;
        }
      }

      return JSON.parse(serialized) as T;
    } catch (error) {
      console.warn('Failed to retrieve item:', error);
      return null;
    }
  }

  /**
   * Removes an item from storage
   */
  remove(key: string, options: { storage?: 'local' | 'session' } = {}): void {
    const { storage = 'local' } = options;

    const storageObj = this.getStorage(storage);
    if (!storageObj) {
      return;
    }

    storageObj.removeItem(this.getKey(key));
  }

  /**
   * Checks if an item exists and is not expired
   */
  has(key: string, options: { storage?: 'local' | 'session' } = {}): boolean {
    return this.get(key, options) !== null;
  }

  /**
   * Clears all items with the current prefix
   */
  clear(options: { storage?: 'local' | 'session' } = {}): void {
    const { storage = 'local' } = options;

    const storageObj = this.getStorage(storage);
    if (!storageObj) {
      return;
    }

    const keys = Object.keys(storageObj).filter((k) => k.startsWith(this.prefix));
    keys.forEach((k) => storageObj.removeItem(k));
  }

  /**
   * Removes all expired items
   */
  cleanup(options: { storage?: 'local' | 'session' } = {}): number {
    const { storage = 'local' } = options;

    const storageObj = this.getStorage(storage);
    if (!storageObj) {
      return 0;
    }

    let removed = 0;
    const now = Date.now();

    Object.keys(storageObj)
      .filter((k) => k.startsWith(this.prefix))
      .forEach((k) => {
        try {
          const raw = storageObj.getItem(k);
          if (raw) {
            const item: StoredItem<unknown> = JSON.parse(raw);
            if (item.expiry && now > item.expiry) {
              storageObj.removeItem(k);
              removed++;
            }
          }
        } catch {
          // Invalid item, remove it
          storageObj.removeItem(k);
          removed++;
        }
      });

    return removed;
  }

  /**
   * Gets storage usage information
   */
  getUsage(options: { storage?: 'local' | 'session' } = {}): {
    used: number;
    items: number;
  } {
    const { storage = 'local' } = options;

    const storageObj = this.getStorage(storage);
    if (!storageObj) {
      return { used: 0, items: 0 };
    }

    let used = 0;
    let items = 0;

    Object.keys(storageObj)
      .filter((k) => k.startsWith(this.prefix))
      .forEach((k) => {
        const value = storageObj.getItem(k);
        if (value) {
          used += k.length + value.length;
          items++;
        }
      });

    return { used, items };
  }
}

// =============================================================================
// Default Instance & Convenience Functions
// =============================================================================

/**
 * Default secure storage instance
 * For production, initialize with a proper encryption key
 */
const defaultStorage = new SecureStorage();

/**
 * Sets an item in secure storage
 */
export function setSecure<T>(key: string, value: T, options?: StorageOptions): boolean {
  return defaultStorage.set(key, value, options);
}

/**
 * Gets an item from secure storage
 */
export function getSecure<T>(key: string, options?: { storage?: 'local' | 'session' }): T | null {
  return defaultStorage.get<T>(key, options);
}

/**
 * Removes an item from secure storage
 */
export function removeSecure(key: string, options?: { storage?: 'local' | 'session' }): void {
  defaultStorage.remove(key, options);
}

/**
 * Clears all secure storage items
 */
export function clearSecure(options?: { storage?: 'local' | 'session' }): void {
  defaultStorage.clear(options);
}

/**
 * Cleans up expired items
 */
export function cleanupSecure(options?: { storage?: 'local' | 'session' }): number {
  return defaultStorage.cleanup(options);
}

// =============================================================================
// Sensitive Data Helpers
// =============================================================================

/**
 * Stores sensitive data with encryption and short TTL
 * IMPORTANT: For truly sensitive data (tokens, passwords), use httpOnly cookies
 * or server-side sessions instead
 */
export function storeSensitive<T>(
  key: string,
  value: T,
  ttlMinutes: number = 30
): boolean {
  return defaultStorage.set(key, value, {
    encrypt: true,
    ttl: ttlMinutes * 60 * 1000,
    storage: 'session', // Use session storage for sensitive data
  });
}

/**
 * Retrieves sensitive data
 */
export function getSensitive<T>(key: string): T | null {
  return defaultStorage.get<T>(key, { storage: 'session' });
}

/**
 * Removes sensitive data
 */
export function removeSensitive(key: string): void {
  defaultStorage.remove(key, { storage: 'session' });
}

/**
 * Clears all sensitive data (use on logout)
 */
export function clearAllSensitive(): void {
  defaultStorage.clear({ storage: 'session' });
}

// =============================================================================
// Initialization
// =============================================================================

/**
 * Creates a new SecureStorage instance with custom configuration
 */
export function createSecureStorage(
  encryptionKey: string,
  prefix?: string
): SecureStorage {
  return new SecureStorage(encryptionKey, prefix);
}

// Auto-cleanup expired items periodically (every 5 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => {
    defaultStorage.cleanup({ storage: 'local' });
    defaultStorage.cleanup({ storage: 'session' });
  }, 5 * 60 * 1000);
}

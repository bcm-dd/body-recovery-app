/**
 * Client-Side Encryption Utilities
 *
 * Provides cryptographically secure encryption for sensitive data
 * using the Web Crypto API.
 *
 * IMPORTANT SECURITY NOTES:
 * 1. Client-side encryption protects data at rest in browser storage
 * 2. Keys derived from user passwords should use strong KDF (PBKDF2)
 * 3. For truly sensitive data, prefer server-side storage
 * 4. Never store encryption keys in localStorage without protection
 * 5. Consider using Web Authentication API for key management
 */

// =============================================================================
// Types
// =============================================================================

export interface EncryptedData {
  /** Initialization vector (base64) */
  iv: string;
  /** Encrypted data (base64) */
  data: string;
  /** Salt used for key derivation (base64) */
  salt: string;
  /** Algorithm identifier */
  algorithm: string;
  /** Version for future compatibility */
  version: number;
}

export interface KeyDerivationOptions {
  /** Number of PBKDF2 iterations (default: 100000) */
  iterations?: number;
  /** Salt length in bytes (default: 16) */
  saltLength?: number;
  /** Key length in bits (default: 256) */
  keyLength?: number;
}

export interface EncryptionOptions {
  /** Key derivation options */
  kdf?: KeyDerivationOptions;
  /** Additional authenticated data */
  aad?: string;
}

// =============================================================================
// Constants
// =============================================================================

const ENCRYPTION_VERSION = 1;
const DEFAULT_ITERATIONS = 100000;
const DEFAULT_SALT_LENGTH = 16;
const DEFAULT_KEY_LENGTH = 256;
const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12; // 96 bits for GCM

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Converts ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer | ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer as ArrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generates cryptographically secure random bytes
 */
function generateRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Checks if Web Crypto API is available
 */
export function isEncryptionSupported(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  );
}

// =============================================================================
// Key Derivation
// =============================================================================

/**
 * Derives a cryptographic key from a password using PBKDF2
 *
 * @param password - The password to derive key from
 * @param salt - Salt for key derivation
 * @param options - Key derivation options
 * @returns Derived CryptoKey
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array,
  options: KeyDerivationOptions = {}
): Promise<CryptoKey> {
  const {
    iterations = DEFAULT_ITERATIONS,
    keyLength = DEFAULT_KEY_LENGTH,
  } = options;

  if (!isEncryptionSupported()) {
    throw new Error('Web Crypto API not supported');
  }

  // Import password as raw key material
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive AES key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    {
      name: ALGORITHM,
      length: keyLength,
    },
    false, // Not extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Generates a new encryption key (not derived from password)
 *
 * @returns Generated CryptoKey
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  if (!isEncryptionSupported()) {
    throw new Error('Web Crypto API not supported');
  }

  return crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: DEFAULT_KEY_LENGTH,
    },
    true, // Extractable for export if needed
    ['encrypt', 'decrypt']
  );
}

/**
 * Exports a CryptoKey to a portable format
 * WARNING: Only export keys when necessary, and protect the exported data
 *
 * @param key - The CryptoKey to export
 * @returns Exported key as base64
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

/**
 * Imports a key from a portable format
 *
 * @param keyData - Base64 encoded key data
 * @returns Imported CryptoKey
 */
export async function importKey(keyData: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(keyData);

  return crypto.subtle.importKey(
    'raw',
    keyBuffer,
    {
      name: ALGORITHM,
      length: DEFAULT_KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

// =============================================================================
// Encryption / Decryption
// =============================================================================

/**
 * Encrypts data using AES-GCM
 *
 * @param data - Data to encrypt (string or object)
 * @param password - Password for key derivation
 * @param options - Encryption options
 * @returns Encrypted data package
 */
export async function encrypt(
  data: string | object,
  password: string,
  options: EncryptionOptions = {}
): Promise<EncryptedData> {
  if (!isEncryptionSupported()) {
    throw new Error('Web Crypto API not supported');
  }

  const {
    kdf = {},
    aad,
  } = options;

  const {
    iterations = DEFAULT_ITERATIONS,
    saltLength = DEFAULT_SALT_LENGTH,
  } = kdf;

  // Serialize data
  const plaintext = typeof data === 'string' ? data : JSON.stringify(data);

  // Generate salt and IV
  const salt = generateRandomBytes(saltLength);
  const iv = generateRandomBytes(IV_LENGTH);

  // Derive key
  const key = await deriveKey(password, salt, { iterations, ...kdf });

  // Prepare additional authenticated data
  const additionalData = aad ? new TextEncoder().encode(aad) : undefined;

  // Encrypt
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv as BufferSource,
      additionalData,
    },
    key,
    new TextEncoder().encode(plaintext)
  );

  return {
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
    data: arrayBufferToBase64(encryptedBuffer),
    salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
    algorithm: ALGORITHM,
    version: ENCRYPTION_VERSION,
  };
}

/**
 * Decrypts data using AES-GCM
 *
 * @param encrypted - Encrypted data package
 * @param password - Password for key derivation
 * @param options - Decryption options
 * @returns Decrypted data as string
 */
export async function decrypt(
  encrypted: EncryptedData,
  password: string,
  options: EncryptionOptions = {}
): Promise<string> {
  if (!isEncryptionSupported()) {
    throw new Error('Web Crypto API not supported');
  }

  const { kdf = {}, aad } = options;

  // Verify version
  if (encrypted.version !== ENCRYPTION_VERSION) {
    throw new Error(`Unsupported encryption version: ${encrypted.version}`);
  }

  // Decode components
  const iv = new Uint8Array(base64ToArrayBuffer(encrypted.iv));
  const data = base64ToArrayBuffer(encrypted.data);
  const salt = new Uint8Array(base64ToArrayBuffer(encrypted.salt));

  // Derive key with same parameters
  const key = await deriveKey(password, salt, kdf);

  // Prepare additional authenticated data
  const additionalData = aad ? new TextEncoder().encode(aad) : undefined;

  try {
    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv as BufferSource,
        additionalData,
      },
      key,
      data
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    // GCM authentication failed - data was tampered with or wrong password
    throw new Error('Decryption failed: invalid password or corrupted data');
  }
}

/**
 * Encrypts data using a pre-derived key
 *
 * @param data - Data to encrypt
 * @param key - Pre-derived CryptoKey
 * @returns Encrypted data package
 */
export async function encryptWithKey(
  data: string | object,
  key: CryptoKey
): Promise<EncryptedData> {
  if (!isEncryptionSupported()) {
    throw new Error('Web Crypto API not supported');
  }

  const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
  const iv = generateRandomBytes(IV_LENGTH);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv as BufferSource,
    },
    key,
    new TextEncoder().encode(plaintext)
  );

  return {
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
    data: arrayBufferToBase64(encryptedBuffer),
    salt: '', // No salt needed when using pre-derived key
    algorithm: ALGORITHM,
    version: ENCRYPTION_VERSION,
  };
}

/**
 * Decrypts data using a pre-derived key
 *
 * @param encrypted - Encrypted data package
 * @param key - Pre-derived CryptoKey
 * @returns Decrypted data as string
 */
export async function decryptWithKey(
  encrypted: EncryptedData,
  key: CryptoKey
): Promise<string> {
  if (!isEncryptionSupported()) {
    throw new Error('Web Crypto API not supported');
  }

  const iv = new Uint8Array(base64ToArrayBuffer(encrypted.iv));
  const data = base64ToArrayBuffer(encrypted.data);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv as BufferSource,
      },
      key,
      data
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    throw new Error('Decryption failed: invalid key or corrupted data');
  }
}

// =============================================================================
// Secure Storage Wrapper
// =============================================================================

/**
 * Encrypted storage wrapper
 * Provides a simple interface for storing encrypted data
 */
export class EncryptedStorage {
  private password: string;
  private prefix: string;
  private options: EncryptionOptions;

  constructor(
    password: string,
    prefix: string = '__encrypted_',
    options: EncryptionOptions = {}
  ) {
    this.password = password;
    this.prefix = prefix;
    this.options = options;
  }

  /**
   * Stores encrypted data
   */
  async set<T>(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const encrypted = await encrypt(value as object, this.password, this.options);
      localStorage.setItem(
        this.prefix + key,
        JSON.stringify(encrypted)
      );
    } catch (error) {
      console.error('Failed to encrypt and store data:', error);
      throw error;
    }
  }

  /**
   * Retrieves and decrypts data
   */
  async get<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(this.prefix + key);
      if (!stored) return null;

      const encrypted: EncryptedData = JSON.parse(stored);
      const decrypted = await decrypt(encrypted, this.password, this.options);

      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return null;
    }
  }

  /**
   * Removes stored data
   */
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * Clears all encrypted storage items with this prefix
   */
  clear(): void {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith(this.prefix)
    );
    keys.forEach((k) => localStorage.removeItem(k));
  }

  /**
   * Changes the encryption password
   * Re-encrypts all stored data with new password
   */
  async changePassword(newPassword: string): Promise<void> {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith(this.prefix)
    );

    // Decrypt all with old password, re-encrypt with new
    for (const key of keys) {
      const shortKey = key.replace(this.prefix, '');
      const value = await this.get(shortKey);

      if (value !== null) {
        this.password = newPassword;
        await this.set(shortKey, value);
      }
    }

    this.password = newPassword;
  }
}

// =============================================================================
// Hashing Utilities
// =============================================================================

/**
 * Generates a SHA-256 hash of data
 *
 * @param data - Data to hash
 * @returns Hash as hex string
 */
export async function sha256(data: string): Promise<string> {
  const buffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a SHA-512 hash of data
 *
 * @param data - Data to hash
 * @returns Hash as hex string
 */
export async function sha512(data: string): Promise<string> {
  const buffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-512', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a secure fingerprint of data
 * Useful for integrity verification without storing the original
 */
export async function fingerprint(data: string, salt?: string): Promise<string> {
  const saltedData = salt ? `${salt}:${data}` : data;
  return sha256(saltedData);
}

// =============================================================================
// Secure Random Generation
// =============================================================================

/**
 * Generates a cryptographically secure random string
 *
 * @param length - Length of the string
 * @param charset - Character set to use
 * @returns Random string
 */
export function generateSecureToken(
  length: number = 32,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  const bytes = generateRandomBytes(length);
  let result = '';

  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length];
  }

  return result;
}

/**
 * Generates a UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Generates a secure random number in range [min, max]
 */
export function secureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValid = Math.floor((256 ** bytesNeeded) / range) * range - 1;

  let randomValue: number;

  do {
    const bytes = generateRandomBytes(bytesNeeded);
    randomValue = bytes.reduce((acc, byte, i) => acc + byte * (256 ** i), 0);
  } while (randomValue > maxValid);

  return min + (randomValue % range);
}

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Creates an encrypted storage instance
 */
export function createEncryptedStorage(
  password: string,
  prefix?: string,
  options?: EncryptionOptions
): EncryptedStorage {
  return new EncryptedStorage(password, prefix, options);
}

/**
 * Quick encrypt helper for one-off encryption
 */
export async function quickEncrypt(
  data: unknown,
  password: string
): Promise<string> {
  const encrypted = await encrypt(data as object, password);
  return JSON.stringify(encrypted);
}

/**
 * Quick decrypt helper for one-off decryption
 */
export async function quickDecrypt<T>(
  encryptedString: string,
  password: string
): Promise<T> {
  const encrypted: EncryptedData = JSON.parse(encryptedString);
  const decrypted = await decrypt(encrypted, password);
  return JSON.parse(decrypted) as T;
}

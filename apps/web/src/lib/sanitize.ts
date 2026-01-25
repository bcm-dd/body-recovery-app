/**
 * Input Sanitization Utilities
 *
 * Provides security utilities for sanitizing user input and preventing
 * XSS attacks, SQL injection, and other input-based vulnerabilities.
 */

// =============================================================================
// HTML Entity Encoding
// =============================================================================

/**
 * HTML entities map for encoding dangerous characters
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Reverse HTML entities map for decoding
 */
const HTML_ENTITIES_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(HTML_ENTITIES).map(([k, v]) => [v, k])
);

/**
 * Encodes HTML entities in a string to prevent XSS attacks
 * @param str - The string to encode
 * @returns HTML-encoded string safe for insertion into HTML
 */
export function encodeHTML(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Decodes HTML entities back to their original characters
 * @param str - The HTML-encoded string
 * @returns Decoded string
 */
export function decodeHTML(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  return str.replace(
    /&amp;|&lt;|&gt;|&quot;|&#x27;|&#x2F;|&#x60;|&#x3D;/g,
    (entity) => HTML_ENTITIES_REVERSE[entity] || entity
  );
}

// =============================================================================
// XSS Prevention
// =============================================================================

/**
 * Patterns commonly used in XSS attacks
 */
const XSS_PATTERNS: RegExp[] = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick=, onerror=, onload=, etc.
  /data:\s*text\/html/gi,
  /vbscript:/gi,
  /expression\s*\(/gi,
  /<iframe\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /<link\b[^>]*>/gi,
  /<meta\b[^>]*>/gi,
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
  /<!--[\s\S]*?-->/g, // HTML comments
];

/**
 * Removes potentially dangerous XSS patterns from a string
 * @param str - The string to sanitize
 * @returns Sanitized string with XSS patterns removed
 */
export function stripXSS(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }

  let sanitized = str;

  // Remove XSS patterns
  for (const pattern of XSS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  return sanitized;
}

/**
 * Comprehensive XSS sanitization: strips XSS patterns and encodes HTML
 * @param str - The string to sanitize
 * @returns Fully sanitized string
 */
export function sanitizeXSS(str: string): string {
  return encodeHTML(stripXSS(str));
}

/**
 * Checks if a string contains potential XSS patterns
 * @param str - The string to check
 * @returns True if XSS patterns are detected
 */
export function hasXSSPatterns(str: string): boolean {
  if (typeof str !== 'string') {
    return false;
  }

  return XSS_PATTERNS.some((pattern) => pattern.test(str));
}

// =============================================================================
// SQL Injection Prevention (for future API use)
// =============================================================================

/**
 * Patterns commonly used in SQL injection attacks
 */
const SQL_INJECTION_PATTERNS: RegExp[] = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|UNION|EXEC|EXECUTE)\b)/gi,
  /(--)|(\/\*)|(\*\/)/g, // SQL comments
  /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi, // OR 1=1, AND 1=1
  /(\b(OR|AND)\b\s+['"][^'"]*['"]\s*=\s*['"][^'"]*['"])/gi, // OR 'a'='a'
  /(;|\$|\\x00|\\n|\\r)/g, // Dangerous characters
  /(\bxp_\w+)/gi, // SQL Server extended procedures
  /(\bsp_\w+)/gi, // SQL Server stored procedures
  /(WAITFOR\s+DELAY)/gi, // Time-based injection
  /(BENCHMARK\s*\()/gi, // MySQL benchmark
  /(SLEEP\s*\()/gi, // MySQL sleep
];

/**
 * Escapes SQL special characters in a string
 * Note: Always use parameterized queries - this is a secondary defense
 * @param str - The string to escape
 * @returns Escaped string
 */
export function escapeSQL(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }

  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\x00/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');
}

/**
 * Checks if a string contains potential SQL injection patterns
 * @param str - The string to check
 * @returns True if SQL injection patterns are detected
 */
export function hasSQLInjectionPatterns(str: string): boolean {
  if (typeof str !== 'string') {
    return false;
  }

  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(str));
}

// =============================================================================
// Input Validation Helpers
// =============================================================================

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Validates and sanitizes an email address
 * @param email - The email to validate
 * @returns Validation result with sanitized email if valid
 */
export function validateEmail(email: string): ValidationResult {
  if (typeof email !== 'string') {
    return { valid: false, error: 'Email must be a string' };
  }

  const sanitized = email.trim().toLowerCase();

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(sanitized)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (sanitized.length > 254) {
    return { valid: false, error: 'Email exceeds maximum length' };
  }

  return { valid: true, sanitized };
}

/**
 * Validates and sanitizes a URL
 * @param url - The URL to validate
 * @param options - Validation options
 * @returns Validation result with sanitized URL if valid
 */
export function validateURL(
  url: string,
  options: {
    allowedProtocols?: string[];
    allowLocalhost?: boolean;
  } = {}
): ValidationResult {
  if (typeof url !== 'string') {
    return { valid: false, error: 'URL must be a string' };
  }

  const {
    allowedProtocols = ['https:', 'http:'],
    allowLocalhost = false,
  } = options;

  const sanitized = url.trim();

  try {
    const parsed = new URL(sanitized);

    if (!allowedProtocols.includes(parsed.protocol)) {
      return { valid: false, error: `Protocol must be one of: ${allowedProtocols.join(', ')}` };
    }

    if (!allowLocalhost && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
      return { valid: false, error: 'Localhost URLs are not allowed' };
    }

    // Check for javascript: protocol (even if not in URL constructor)
    if (/javascript:/i.test(sanitized)) {
      return { valid: false, error: 'JavaScript URLs are not allowed' };
    }

    return { valid: true, sanitized: parsed.href };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validates a string against length constraints
 * @param str - The string to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateLength(
  str: string,
  options: {
    min?: number;
    max?: number;
    trim?: boolean;
  } = {}
): ValidationResult {
  if (typeof str !== 'string') {
    return { valid: false, error: 'Input must be a string' };
  }

  const { min = 0, max = Infinity, trim = true } = options;
  const sanitized = trim ? str.trim() : str;

  if (sanitized.length < min) {
    return { valid: false, error: `Input must be at least ${min} characters` };
  }

  if (sanitized.length > max) {
    return { valid: false, error: `Input must be at most ${max} characters` };
  }

  return { valid: true, sanitized };
}

/**
 * Validates that a string contains only alphanumeric characters
 * @param str - The string to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateAlphanumeric(
  str: string,
  options: {
    allowSpaces?: boolean;
    allowDashes?: boolean;
    allowUnderscores?: boolean;
  } = {}
): ValidationResult {
  if (typeof str !== 'string') {
    return { valid: false, error: 'Input must be a string' };
  }

  const { allowSpaces = false, allowDashes = false, allowUnderscores = false } = options;

  let pattern = '^[a-zA-Z0-9';
  if (allowSpaces) pattern += ' ';
  if (allowDashes) pattern += '-';
  if (allowUnderscores) pattern += '_';
  pattern += ']+$';

  const regex = new RegExp(pattern);

  if (!regex.test(str)) {
    return { valid: false, error: 'Input contains invalid characters' };
  }

  return { valid: true, sanitized: str };
}

/**
 * Validates a numeric string or number
 * @param value - The value to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateNumber(
  value: string | number,
  options: {
    min?: number;
    max?: number;
    integer?: boolean;
  } = {}
): ValidationResult {
  const { min = -Infinity, max = Infinity, integer = false } = options;

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return { valid: false, error: 'Input must be a valid number' };
  }

  if (integer && !Number.isInteger(num)) {
    return { valid: false, error: 'Input must be an integer' };
  }

  if (num < min) {
    return { valid: false, error: `Number must be at least ${min}` };
  }

  if (num > max) {
    return { valid: false, error: `Number must be at most ${max}` };
  }

  return { valid: true, sanitized: String(num) };
}

// =============================================================================
// Object Sanitization
// =============================================================================

/**
 * Recursively sanitizes all string values in an object
 * @param obj - The object to sanitize
 * @param sanitizer - The sanitization function to apply (default: sanitizeXSS)
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  sanitizer: (str: string) => string = sanitizeXSS
): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === 'string'
        ? sanitizer(item)
        : typeof item === 'object' && item !== null
          ? sanitizeObject(item as Record<string, unknown>, sanitizer)
          : item
    ) as unknown as T;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizer(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value as Record<string, unknown>, sanitizer);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

// =============================================================================
// Safe JSON Parsing
// =============================================================================

/**
 * Safely parses JSON with size limits and error handling
 * @param json - The JSON string to parse
 * @param options - Parse options
 * @returns Parsed object or null if invalid
 */
export function safeJSONParse<T = unknown>(
  json: string,
  options: {
    maxLength?: number;
    reviver?: (key: string, value: unknown) => unknown;
  } = {}
): T | null {
  if (typeof json !== 'string') {
    return null;
  }

  const { maxLength = 1024 * 1024, reviver } = options; // Default 1MB limit

  if (json.length > maxLength) {
    console.warn('JSON string exceeds maximum length');
    return null;
  }

  try {
    return JSON.parse(json, reviver) as T;
  } catch {
    return null;
  }
}

// =============================================================================
// Path Traversal Prevention
// =============================================================================

/**
 * Sanitizes a file path to prevent directory traversal attacks
 * @param path - The path to sanitize
 * @returns Sanitized path
 */
export function sanitizePath(path: string): string {
  if (typeof path !== 'string') {
    return '';
  }

  return path
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/\/+/g, '/') // Normalize multiple slashes
    .replace(/^\//, '') // Remove leading slash
    .replace(/[<>:"|?*\x00-\x1f]/g, ''); // Remove invalid characters
}

/**
 * Checks if a path contains directory traversal patterns
 * @param path - The path to check
 * @returns True if traversal patterns are detected
 */
export function hasPathTraversal(path: string): boolean {
  if (typeof path !== 'string') {
    return false;
  }

  const patterns = [
    /\.\./,
    /\.\//,
    /\/\./,
    /%2e%2e/i, // URL encoded ..
    /%252e/i, // Double URL encoded .
    /\.{2,}/,
  ];

  return patterns.some((pattern) => pattern.test(path));
}

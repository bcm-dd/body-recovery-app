/**
 * Input Sanitization - Movement & Recovery Companion
 *
 * Sanitizes user input to prevent XSS and injection attacks.
 */

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize a string by escaping HTML and trimming whitespace
 */
export function sanitizeString(input: string | undefined | null): string {
  if (!input) return '';
  return escapeHtml(input.trim());
}

/**
 * Sanitize an object's string properties
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  for (const field of fields) {
    const value = result[field];
    if (typeof value === 'string') {
      (result[field] as unknown) = sanitizeString(value);
    }
  }
  return result;
}

/**
 * Remove potentially dangerous characters from filenames
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 255);
}

/**
 * Validate and sanitize email format
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

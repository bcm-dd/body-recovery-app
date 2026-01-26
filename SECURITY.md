# Security Policy

## Supported Versions

The following versions of Body Recovery App are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Body Recovery App seriously. If you have discovered a security vulnerability, we appreciate your help in disclosing it to us responsibly.

### How to Report

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Email security concerns to: [security@example.com](mailto:security@example.com)
3. Include as much information as possible:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt within 48 hours
- **Initial Assessment**: Within 7 days, we will provide an initial assessment
- **Resolution Timeline**: Critical vulnerabilities will be addressed within 30 days
- **Credit**: If you wish, we will credit you in release notes once the issue is resolved

### Scope

The following are in scope for security reports:

- Web application (apps/web)
- Mobile application (apps/mobile)
- Shared packages (packages/*)
- Authentication and authorization
- Data storage and transmission
- Third-party integrations

### Out of Scope

- Social engineering attacks
- Physical attacks
- Denial of service attacks that do not reveal vulnerabilities
- Issues in third-party services (report to their security teams)

---

## Security Measures

### HTTP Security Headers

All responses include comprehensive security headers configured in `apps/web/next.config.js`:

| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | Strict policy | Prevents XSS and injection attacks |
| X-Frame-Options | DENY | Prevents clickjacking |
| X-Content-Type-Options | nosniff | Prevents MIME type sniffing |
| Referrer-Policy | strict-origin-when-cross-origin | Controls referrer information |
| Permissions-Policy | Restrictive | Disables unused browser APIs |
| Strict-Transport-Security | max-age=31536000; includeSubDomains; preload | Enforces HTTPS |
| X-XSS-Protection | 1; mode=block | Legacy XSS protection |

### Edge Middleware Security

The `apps/web/middleware.ts` provides edge-level security:

- **Request Validation**: Blocks path traversal, null bytes, and suspicious patterns
- **CSRF Protection**: Validates cross-origin requests for mutations
- **Authentication Checks**: Protects sensitive API routes
- **Rate Limit Hints**: Provides client-side rate limiting guidance

---

## Security Utilities

All security utilities are located in `apps/web/src/lib/`:

### Input Sanitization (`sanitize.ts`)

```typescript
import {
  sanitizeXSS,
  validateEmail,
  validateURL,
  sanitizeObject,
  hasXSSPatterns,
  hasSQLInjectionPatterns,
  sanitizePath,
} from '@/lib';

// Sanitize user input to prevent XSS
const safeInput = sanitizeXSS(userInput);

// Validate email format
const { valid, error, sanitized } = validateEmail(email);

// Validate URL with allowed protocols
const { valid, error } = validateURL(url, {
  allowedProtocols: ['https:'],
  allowLocalhost: false,
});

// Sanitize all strings in an object
const safeData = sanitizeObject(userData);

// Check for suspicious patterns
if (hasXSSPatterns(input) || hasSQLInjectionPatterns(input)) {
  logSecurityEvent('SUSPICIOUS_INPUT', 'Dangerous patterns detected');
  return;
}
```

### Client-Side Encryption (`encryption.ts`)

```typescript
import {
  encrypt,
  decrypt,
  createEncryptedStorage,
  sha256,
  generateSecureToken,
  isEncryptionSupported,
} from '@/lib';

// Check encryption support
if (!isEncryptionSupported()) {
  console.warn('Web Crypto API not available');
}

// Encrypt sensitive data with password
const encrypted = await encrypt(sensitiveData, userPassword);

// Decrypt data
const decrypted = await decrypt(encrypted, userPassword);

// Use encrypted storage for persistent data
const storage = createEncryptedStorage(masterPassword);
await storage.set('apiKey', 'secret-value');
const value = await storage.get('apiKey');

// Hash data (one-way)
const hash = await sha256(data);

// Generate secure tokens
const token = generateSecureToken(32);
```

### Secure Storage (`secure-storage.ts`)

```typescript
import {
  storeSensitive,
  getSensitive,
  removeSensitive,
  clearAllSensitive,
  SecureStorage,
} from '@/lib';

// Store sensitive data (encrypted, with 30-min expiry, session storage)
storeSensitive('auth_token', token, 30);

// Retrieve sensitive data
const token = getSensitive('auth_token');

// Clear on logout - ALWAYS call this!
clearAllSensitive();

// Custom secure storage instance
const storage = new SecureStorage('custom-encryption-key');
storage.set('key', value, {
  encrypt: true,
  ttl: 60 * 60 * 1000, // 1 hour
  storage: 'session',
});
```

### Rate Limiting (`rate-limit.ts`)

```typescript
import {
  RateLimiter,
  withRetry,
  CircuitBreaker,
  rateLimitPresets,
  createThrottle,
} from '@/lib';

// Create rate limiter
const limiter = new RateLimiter({
  maxRequests: 60,
  windowMs: 60000, // 1 minute
});

// Check before making request
const { allowed, remaining, resetIn } = limiter.checkLimit();
if (!allowed) {
  console.warn(`Rate limited. Try again in ${resetIn}ms`);
  return;
}

// Use presets
const apiLimiter = rateLimitPresets.standard();

// Retry with exponential backoff
const result = await withRetry(
  () => fetchData(),
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
  }
);

// Circuit breaker for failing services
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000,
});

const data = await breaker.execute(() => callExternalAPI());
```

### Error Handling (`error-handling.ts`)

```typescript
import {
  toSafeError,
  logSecurityEvent,
  AppError,
  Errors,
  setupGlobalErrorHandlers,
} from '@/lib';

// Initialize global handlers on app startup
setupGlobalErrorHandlers();

// Convert errors to safe format (no stack traces in production)
const safeError = toSafeError(error);
// Returns: { message, code, statusCode, requestId, isClientError, timestamp }

// Log security events
logSecurityEvent('AUTH_FAILURE', 'Invalid credentials', {
  userId,
  method: 'login',
});

// Throw typed errors
throw Errors.unauthorized('Token expired');
throw Errors.forbidden('Admin access required');
throw Errors.rateLimited('Too many requests');
```

### Environment Variables (`env-validation.ts`)

```typescript
import {
  validateEnvOrThrow,
  env,
  requireEnv,
  getEnv,
  getBoolEnv,
} from '@/lib';

// Validate all env vars on startup (in app initialization)
validateEnvOrThrow();

// Type-safe environment access
const apiUrl = env.APP_URL;
const isProduction = env.isProduction;

// Required vars (throws if missing)
const secret = requireEnv('AUTH_SECRET');

// Optional vars with defaults
const port = getEnv('PORT', '3000');
const debug = getBoolEnv('DEBUG', false);
```

---

## Authentication Security

### Best Practices (When Implemented)

The `auth.ts` module provides a skeleton for secure authentication:

1. **Short-lived tokens**: Access tokens expire in 15 minutes
2. **Refresh token rotation**: New refresh token on each use
3. **Secure storage**: Tokens stored with encryption in session storage
4. **CSRF protection**: Token validation for state-changing requests
5. **Strong passwords**: Minimum 8 chars with mixed case, numbers, symbols

```typescript
import {
  getCSRFToken,
  createAuthHeaders,
  AuthManager,
} from '@/lib';

// Get CSRF token for mutations
const csrfToken = getCSRFToken();

// Create auth headers
const headers = createAuthHeaders(accessToken, true); // includes CSRF
// Returns: { Authorization: 'Bearer ...', 'X-CSRF-Token': '...' }
```

---

## Development Security

### Dependency Management

```bash
# Run security audit
pnpm audit

# Check for critical vulnerabilities only
pnpm audit --audit-level=critical

# Update vulnerable packages
pnpm update --latest
```

**Update Policy**:
- Critical vulnerabilities: Fix within 24 hours
- High vulnerabilities: Fix within 1 week
- Moderate vulnerabilities: Fix within 1 month
- Low vulnerabilities: Fix in next release cycle

### CI/CD Security

Security audit runs automatically on every pull request via `.github/workflows/ci.yml`:

```yaml
security:
  name: Security Audit
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v3
    - run: pnpm install --frozen-lockfile
    - run: pnpm audit --audit-level=high
```

### Code Review

- All code changes require review
- Security-sensitive changes require additional review
- Automated security scanning in CI/CD

---

## Data Handling Guidelines

### Sensitive Data

**DO**:
- Use `storeSensitive()` for tokens and credentials
- Use `sessionStorage` for auth data (not `localStorage`)
- Encrypt data before storing with `encrypt()`
- Set TTL on sensitive data
- Clear all sensitive data on logout with `clearAllSensitive()`

**DON'T**:
- Store passwords or secrets in localStorage
- Log sensitive data (tokens, passwords, PII)
- Expose internal error details to users
- Use `eval()` or `innerHTML` with user input

### Logout Cleanup

Always clear sensitive data on logout:

```typescript
async function logout() {
  // Clear all encrypted session data
  clearAllSensitive();

  // Clear any local state
  authStore.reset();

  // Invalidate session server-side
  await api.logout();

  // Redirect
  router.push('/login');
}
```

---

## Security Best Practices for Contributors

### DO

- Use the provided sanitization utilities for user input
- Use secure storage for sensitive data
- Implement rate limiting for API calls
- Log security events appropriately
- Keep dependencies updated
- Follow the principle of least privilege
- Validate all inputs on both client and server
- Use HTTPS for all external requests

### DON'T

- Store sensitive data in plain text
- Expose stack traces to users
- Log sensitive user information
- Use `eval()` or `innerHTML` with user input
- Disable security headers
- Commit secrets or credentials
- Use `dangerouslySetInnerHTML` without sanitization
- Trust client-side validation alone

---

## Compliance

This application is designed with privacy and security in mind:

- No tracking without consent
- Minimal data collection
- Data stored locally when possible
- No third-party analytics by default
- GDPR-friendly design principles

---

## Security Checklist

Before deploying:

- [ ] Run `pnpm audit` and address vulnerabilities
- [ ] Verify all environment variables are set
- [ ] Test CSRF protection on mutations
- [ ] Verify CSP doesn't break functionality
- [ ] Test rate limiting behavior
- [ ] Ensure error messages don't leak info
- [ ] Verify logout clears all sensitive data
- [ ] Check that sensitive APIs require auth
- [ ] Test input validation on all forms
- [ ] Review console for sensitive data leaks

---

## Contact

For security concerns: [security@example.com](mailto:security@example.com)

For general questions: Open a GitHub issue

---

Last updated: January 2025

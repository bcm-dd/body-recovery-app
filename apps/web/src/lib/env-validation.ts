/**
 * Environment Variable Validation
 *
 * Validates required environment variables on startup to fail fast
 * and prevent runtime errors due to missing configuration.
 *
 * SECURITY NOTES:
 * 1. Never expose server-side env vars to the client (no NEXT_PUBLIC_ prefix)
 * 2. Validate all env vars at startup, not at runtime
 * 3. Use sensible defaults only for non-sensitive values
 * 4. Log missing vars clearly but don't log their values
 */

// =============================================================================
// Types
// =============================================================================

export interface EnvVarDefinition {
  /** Variable name (without NEXT_PUBLIC_ prefix) */
  name: string;
  /** Whether this variable is required */
  required: boolean;
  /** Default value if not required */
  default?: string;
  /** Description for documentation */
  description: string;
  /** Whether this is a client-side variable (NEXT_PUBLIC_ prefix) */
  isPublic?: boolean;
  /** Validation function */
  validate?: (value: string) => boolean;
  /** Sensitive flag - if true, value won't be logged */
  sensitive?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  loadedVars: string[];
}

// =============================================================================
// Environment Variable Definitions
// =============================================================================

/**
 * Define all environment variables used by the application
 *
 * Categories:
 * - Public (NEXT_PUBLIC_*): Safe to expose to client
 * - Private: Server-side only, never exposed to client
 */
export const ENV_DEFINITIONS: EnvVarDefinition[] = [
  // ==========================================================================
  // Application Settings (Public)
  // ==========================================================================
  {
    name: 'APP_URL',
    required: false,
    default: 'http://localhost:3000',
    description: 'Base URL of the application',
    isPublic: true,
    validate: (v) => /^https?:\/\/.+/.test(v),
  },
  {
    name: 'APP_NAME',
    required: false,
    default: 'Body Recovery',
    description: 'Application name for display',
    isPublic: true,
  },
  {
    name: 'APP_ENV',
    required: false,
    default: 'development',
    description: 'Application environment (development, staging, production)',
    isPublic: true,
    validate: (v) => ['development', 'staging', 'production', 'test'].includes(v),
  },

  // ==========================================================================
  // Analytics (Public - IDs only, no secrets)
  // ==========================================================================
  {
    name: 'ANALYTICS_ID',
    required: false,
    description: 'Analytics tracking ID (public measurement ID)',
    isPublic: true,
  },
  {
    name: 'POSTHOG_KEY',
    required: false,
    description: 'PostHog public API key',
    isPublic: true,
  },

  // ==========================================================================
  // Feature Flags (Public)
  // ==========================================================================
  {
    name: 'ENABLE_PWA',
    required: false,
    default: 'true',
    description: 'Enable Progressive Web App features',
    isPublic: true,
    validate: (v) => ['true', 'false'].includes(v),
  },
  {
    name: 'ENABLE_ANALYTICS',
    required: false,
    default: 'false',
    description: 'Enable analytics tracking',
    isPublic: true,
    validate: (v) => ['true', 'false'].includes(v),
  },

  // ==========================================================================
  // API Configuration (Private - Server Only)
  // ==========================================================================
  {
    name: 'API_SECRET_KEY',
    required: false,
    description: 'Secret key for API authentication',
    sensitive: true,
  },
  {
    name: 'DATABASE_URL',
    required: false,
    description: 'Database connection string',
    sensitive: true,
    validate: (v) => v.length > 0,
  },

  // ==========================================================================
  // External Services (Private - Server Only)
  // ==========================================================================
  {
    name: 'OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API key for AI features',
    sensitive: true,
  },
  {
    name: 'RESEND_API_KEY',
    required: false,
    description: 'Resend API key for email sending',
    sensitive: true,
  },
  {
    name: 'UPSTASH_REDIS_URL',
    required: false,
    description: 'Upstash Redis URL for caching/rate limiting',
    sensitive: true,
  },

  // ==========================================================================
  // Authentication (Private - Server Only)
  // ==========================================================================
  {
    name: 'AUTH_SECRET',
    required: false,
    description: 'Secret for JWT signing (32+ chars)',
    sensitive: true,
    validate: (v) => v.length >= 32,
  },
  {
    name: 'AUTH_URL',
    required: false,
    description: 'Authentication provider URL',
    sensitive: false,
    validate: (v) => /^https?:\/\/.+/.test(v),
  },

  // ==========================================================================
  // Monitoring (Private - Server Only)
  // ==========================================================================
  {
    name: 'SENTRY_DSN',
    required: false,
    description: 'Sentry DSN for error tracking',
    sensitive: true,
  },

  // ==========================================================================
  // Cron / Scheduled Tasks (Private)
  // ==========================================================================
  {
    name: 'CRON_SECRET',
    required: false,
    description: 'Secret for authenticating cron job requests',
    sensitive: true,
    validate: (v) => v.length >= 16,
  },
];

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Gets the full variable name with appropriate prefix
 */
function getFullVarName(def: EnvVarDefinition): string {
  return def.isPublic ? `NEXT_PUBLIC_${def.name}` : def.name;
}

/**
 * Gets environment variable value
 */
function getEnvValue(def: EnvVarDefinition): string | undefined {
  const fullName = getFullVarName(def);

  // Check both process.env and window (for client-side public vars)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[fullName];
  }

  return undefined;
}

/**
 * Validates a single environment variable
 */
function validateVar(
  def: EnvVarDefinition
): { valid: boolean; error?: string; warning?: string } {
  const value = getEnvValue(def);
  const fullName = getFullVarName(def);

  // Check if required and missing
  if (def.required && !value) {
    return {
      valid: false,
      error: `Missing required environment variable: ${fullName}`,
    };
  }

  // If not set and not required, it's fine
  if (!value) {
    if (def.default) {
      return { valid: true }; // Has default
    }
    return {
      valid: true,
      warning: `Optional environment variable not set: ${fullName}`,
    };
  }

  // Run custom validation if provided
  if (def.validate && !def.validate(value)) {
    return {
      valid: false,
      error: `Invalid value for ${fullName}: validation failed`,
    };
  }

  return { valid: true };
}

/**
 * Validates all environment variables
 */
export function validateEnv(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    loadedVars: [],
  };

  for (const def of ENV_DEFINITIONS) {
    const validation = validateVar(def);
    const fullName = getFullVarName(def);
    const value = getEnvValue(def);

    if (!validation.valid && validation.error) {
      result.valid = false;
      result.errors.push(validation.error);
    }

    if (validation.warning) {
      result.warnings.push(validation.warning);
    }

    if (value || def.default) {
      result.loadedVars.push(fullName);
    }
  }

  return result;
}

/**
 * Validates environment and throws if invalid
 */
export function validateEnvOrThrow(): void {
  const result = validateEnv();

  if (!result.valid) {
    console.error('='.repeat(60));
    console.error('Environment Validation Failed');
    console.error('='.repeat(60));

    for (const error of result.errors) {
      console.error(`  [ERROR] ${error}`);
    }

    for (const warning of result.warnings) {
      console.warn(`  [WARN] ${warning}`);
    }

    console.error('='.repeat(60));

    throw new Error(
      `Environment validation failed with ${result.errors.length} error(s). ` +
      'Check the console for details.'
    );
  }

  // Log warnings in development
  if (process.env.NODE_ENV !== 'production' && result.warnings.length > 0) {
    console.warn('Environment Validation Warnings:');
    for (const warning of result.warnings) {
      console.warn(`  - ${warning}`);
    }
  }
}

// =============================================================================
// Type-Safe Environment Access
// =============================================================================

/**
 * Gets a required environment variable
 * Throws if not set
 */
export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

/**
 * Gets an optional environment variable with default
 */
export function getEnv(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}

/**
 * Gets a boolean environment variable
 */
export function getBoolEnv(name: string, defaultValue: boolean = false): boolean {
  const value = process.env[name];

  if (!value) return defaultValue;

  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Gets a numeric environment variable
 */
export function getNumEnv(name: string, defaultValue: number = 0): number {
  const value = process.env[name];

  if (!value) return defaultValue;

  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// =============================================================================
// Environment Object
// =============================================================================

/**
 * Type-safe environment configuration
 */
export const env = {
  // App settings
  get APP_URL() {
    return getEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
  },
  get APP_NAME() {
    return getEnv('NEXT_PUBLIC_APP_NAME', 'Body Recovery');
  },
  get APP_ENV() {
    return getEnv('NEXT_PUBLIC_APP_ENV', 'development') as
      | 'development'
      | 'staging'
      | 'production'
      | 'test';
  },
  get isDevelopment() {
    return this.APP_ENV === 'development';
  },
  get isProduction() {
    return this.APP_ENV === 'production';
  },
  get isTest() {
    return this.APP_ENV === 'test';
  },

  // Feature flags
  get ENABLE_PWA() {
    return getBoolEnv('NEXT_PUBLIC_ENABLE_PWA', true);
  },
  get ENABLE_ANALYTICS() {
    return getBoolEnv('NEXT_PUBLIC_ENABLE_ANALYTICS', false);
  },

  // Analytics
  get ANALYTICS_ID() {
    return getEnv('NEXT_PUBLIC_ANALYTICS_ID');
  },
  get POSTHOG_KEY() {
    return getEnv('NEXT_PUBLIC_POSTHOG_KEY');
  },

  // Server-only (these will be undefined on client)
  get API_SECRET_KEY() {
    return getEnv('API_SECRET_KEY');
  },
  get DATABASE_URL() {
    return getEnv('DATABASE_URL');
  },
  get AUTH_SECRET() {
    return getEnv('AUTH_SECRET');
  },
  get CRON_SECRET() {
    return getEnv('CRON_SECRET');
  },
} as const;

// =============================================================================
// Documentation Generation
// =============================================================================

/**
 * Generates documentation for all environment variables
 */
export function generateEnvDocs(): string {
  const lines: string[] = [
    '# Environment Variables',
    '',
    '## Required Variables',
    '',
  ];

  const required = ENV_DEFINITIONS.filter((d) => d.required);
  const optional = ENV_DEFINITIONS.filter((d) => !d.required);

  if (required.length === 0) {
    lines.push('No required variables.');
  }

  for (const def of required) {
    const fullName = getFullVarName(def);
    lines.push(`### \`${fullName}\``);
    lines.push('');
    lines.push(def.description);
    if (def.sensitive) {
      lines.push('');
      lines.push('**Sensitive**: Do not commit to version control.');
    }
    lines.push('');
  }

  lines.push('## Optional Variables');
  lines.push('');

  for (const def of optional) {
    const fullName = getFullVarName(def);
    lines.push(`### \`${fullName}\``);
    lines.push('');
    lines.push(def.description);
    if (def.default) {
      lines.push('');
      lines.push(`**Default**: \`${def.default}\``);
    }
    if (def.sensitive) {
      lines.push('');
      lines.push('**Sensitive**: Do not commit to version control.');
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generates .env.example content
 */
export function generateEnvExample(): string {
  const lines: string[] = [
    '# Environment Variables for Body Recovery App',
    '# Copy this file to .env.local and fill in the values',
    '',
  ];

  let currentSection = '';

  for (const def of ENV_DEFINITIONS) {
    const fullName = getFullVarName(def);

    // Add section header
    const section = def.isPublic ? 'Public (Client)' : 'Private (Server Only)';
    if (section !== currentSection) {
      lines.push('');
      lines.push(`# === ${section} ===`);
      lines.push('');
      currentSection = section;
    }

    // Add variable
    lines.push(`# ${def.description}`);
    if (def.required) {
      lines.push(`# REQUIRED`);
    }

    const value = def.default || (def.sensitive ? 'your-secret-here' : '');
    lines.push(`${fullName}=${value}`);
    lines.push('');
  }

  return lines.join('\n');
}

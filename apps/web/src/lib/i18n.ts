/**
 * Internationalization (i18n) utilities
 *
 * This module provides:
 * - Locale configuration and supported languages
 * - Date/time formatting by locale
 * - Number formatting by locale
 * - Pluralization support
 * - RTL detection for future support
 * - Translation utilities and adapters
 */

// Note: getRequestConfig is used in /apps/web/i18n/request.ts for server-side config

// ============================================================================
// Configuration
// ============================================================================

/**
 * Supported locales
 * Add new locales here when adding language support
 */
export const locales = ['en', 'es', 'fr', 'de'] as const;
export type Locale = (typeof locales)[number];

/**
 * The default/fallback locale
 */
export const defaultLocale: Locale = 'en';

/**
 * RTL (right-to-left) locales for future support
 */
export const rtlLocales: readonly string[] = ['ar', 'he', 'fa', 'ur'] as const;

/**
 * Locale metadata for UI display
 */
export interface LocaleMetadata {
  code: Locale;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: '12h' | '24h';
  flag?: string;
  isComplete?: boolean;
}

export const localeMetadata: Record<Locale, LocaleMetadata> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    flag: '🇺🇸',
    isComplete: true,
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Espanol',
    dir: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    flag: '🇪🇸',
    isComplete: false,
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Francais',
    dir: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    flag: '🇫🇷',
    isComplete: false,
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    dir: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    flag: '🇩🇪',
    isComplete: false,
  },
  // Future RTL locale example:
  // ar: {
  //   code: 'ar',
  //   name: 'Arabic',
  //   nativeName: 'العربية',
  //   dir: 'rtl',
  //   dateFormat: 'DD/MM/YYYY',
  //   timeFormat: '24h',
  //   flag: '🇸🇦',
  //   isComplete: false,
  // },
};

// ============================================================================
// Locale Detection & Persistence
// ============================================================================

const LOCALE_STORAGE_KEY = 'preferred-locale';

/**
 * Get the user's preferred locale from storage
 */
export function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale;
  }
  return null;
}

/**
 * Store the user's preferred locale
 */
export function setStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

/**
 * Detect locale from browser settings
 */
export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;

  const browserLang = navigator.language.split('-')[0];
  if (locales.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }

  // Check navigator.languages for fallback options
  for (const lang of navigator.languages) {
    const code = lang.split('-')[0];
    if (locales.includes(code as Locale)) {
      return code as Locale;
    }
  }

  return defaultLocale;
}

/**
 * Get the current locale (stored > browser > default)
 */
export function getCurrentLocale(): Locale {
  return getStoredLocale() || detectBrowserLocale();
}

// ============================================================================
// RTL Support
// ============================================================================

/**
 * Check if a locale is RTL
 */
export function isRTL(locale: Locale): boolean {
  return localeMetadata[locale]?.dir === 'rtl';
}

/**
 * Get text direction for a locale
 */
export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  return localeMetadata[locale]?.dir || 'ltr';
}

// ============================================================================
// Date & Time Formatting
// ============================================================================

export interface DateFormatOptions {
  style?: 'short' | 'medium' | 'long' | 'full';
  includeTime?: boolean;
  includeWeekday?: boolean;
  relative?: boolean;
}

/**
 * Format a date according to locale
 */
export function formatDate(
  date: Date | string | number,
  locale: Locale = defaultLocale,
  options: DateFormatOptions = {}
): string {
  const d = new Date(date);
  const { style = 'medium', includeTime = false, includeWeekday = false, relative = false } = options;

  // Handle relative dates
  if (relative) {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
  }

  const dateOptions: Intl.DateTimeFormatOptions = {};

  switch (style) {
    case 'short':
      dateOptions.month = 'numeric';
      dateOptions.day = 'numeric';
      dateOptions.year = '2-digit';
      break;
    case 'medium':
      dateOptions.month = 'short';
      dateOptions.day = 'numeric';
      dateOptions.year = 'numeric';
      break;
    case 'long':
      dateOptions.month = 'long';
      dateOptions.day = 'numeric';
      dateOptions.year = 'numeric';
      break;
    case 'full':
      dateOptions.weekday = 'long';
      dateOptions.month = 'long';
      dateOptions.day = 'numeric';
      dateOptions.year = 'numeric';
      break;
  }

  if (includeWeekday && style !== 'full') {
    dateOptions.weekday = 'short';
  }

  if (includeTime) {
    dateOptions.hour = 'numeric';
    dateOptions.minute = '2-digit';
  }

  return new Intl.DateTimeFormat(locale, dateOptions).format(d);
}

/**
 * Format time according to locale
 */
export function formatTime(
  date: Date | string | number,
  locale: Locale = defaultLocale,
  use24Hour?: boolean
): string {
  const d = new Date(date);
  const hour12 = use24Hour !== undefined ? !use24Hour : localeMetadata[locale]?.timeFormat === '12h';

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12,
  }).format(d);
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: Locale = defaultLocale
): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffWeeks = Math.round(diffDays / 7);
  const diffMonths = Math.round(diffDays / 30);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffSecs) < 60) {
    return rtf.format(diffSecs, 'second');
  } else if (Math.abs(diffMins) < 60) {
    return rtf.format(diffMins, 'minute');
  } else if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour');
  } else if (Math.abs(diffDays) < 7) {
    return rtf.format(diffDays, 'day');
  } else if (Math.abs(diffWeeks) < 4) {
    return rtf.format(diffWeeks, 'week');
  } else {
    return rtf.format(diffMonths, 'month');
  }
}

// ============================================================================
// Number Formatting
// ============================================================================

export interface NumberFormatOptions {
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
  currency?: string;
  unit?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
  signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';
}

/**
 * Format a number according to locale
 */
export function formatNumber(
  value: number,
  locale: Locale = defaultLocale,
  options: NumberFormatOptions = {}
): string {
  const {
    style = 'decimal',
    currency,
    unit,
    minimumFractionDigits,
    maximumFractionDigits,
    notation = 'standard',
    signDisplay = 'auto',
  } = options;

  const formatOptions: Intl.NumberFormatOptions = {
    style,
    notation,
    signDisplay,
  };

  if (style === 'currency' && currency) {
    formatOptions.currency = currency;
  }

  if (style === 'unit' && unit) {
    formatOptions.unit = unit;
  }

  if (minimumFractionDigits !== undefined) {
    formatOptions.minimumFractionDigits = minimumFractionDigits;
  }

  if (maximumFractionDigits !== undefined) {
    formatOptions.maximumFractionDigits = maximumFractionDigits;
  }

  return new Intl.NumberFormat(locale, formatOptions).format(value);
}

/**
 * Format a percentage
 */
export function formatPercent(
  value: number,
  locale: Locale = defaultLocale,
  fractionDigits = 0
): string {
  return formatNumber(value / 100, locale, {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

/**
 * Format a compact number (e.g., 1.2K, 3.4M)
 */
export function formatCompactNumber(
  value: number,
  locale: Locale = defaultLocale
): string {
  return formatNumber(value, locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  });
}

// ============================================================================
// Pluralization
// ============================================================================

export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/**
 * Get the plural category for a count
 */
export function getPluralCategory(
  count: number,
  locale: Locale = defaultLocale
): PluralCategory {
  const pluralRules = new Intl.PluralRules(locale);
  return pluralRules.select(count) as PluralCategory;
}

/**
 * Select the appropriate plural form
 */
export function selectPlural<T>(
  count: number,
  forms: Partial<Record<PluralCategory, T>> & { other: T },
  locale: Locale = defaultLocale
): T {
  const category = getPluralCategory(count, locale);
  return forms[category] ?? forms.other;
}

/**
 * Simple pluralization helper for common cases
 */
export function pluralize(
  count: number,
  singular: string,
  plural: string,
  locale: Locale = defaultLocale
): string {
  return selectPlural(count, { one: singular, other: plural }, locale);
}

// ============================================================================
// List Formatting
// ============================================================================

export type ListStyle = 'long' | 'short' | 'narrow';
export type ListType = 'conjunction' | 'disjunction' | 'unit';

/**
 * Format a list of items according to locale
 * e.g., "apples, oranges, and bananas" (en) vs "apples, oranges y bananas" (es)
 */
export function formatList(
  items: string[],
  locale: Locale = defaultLocale,
  options: { style?: ListStyle; type?: ListType } = {}
): string {
  const { style = 'long', type = 'conjunction' } = options;

  return new Intl.ListFormat(locale, {
    style,
    type,
  }).format(items);
}

// ============================================================================
// Currency Formatting
// ============================================================================

/**
 * Format currency value
 */
export function formatCurrency(
  value: number,
  currency: string,
  locale: Locale = defaultLocale
): string {
  return formatNumber(value, locale, {
    style: 'currency',
    currency,
  });
}

// ============================================================================
// Message Interpolation
// ============================================================================

/**
 * Simple message interpolation
 * Replaces {key} placeholders with values from params object
 */
export function interpolate(
  message: string,
  params: Record<string, string | number | undefined>
): string {
  return message.replace(/{(\w+)}/g, (_, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}

// ============================================================================
// Copy Package Adapter
// ============================================================================

/**
 * Adapter to use @app/copy strings with i18n system
 * This allows gradual migration of copy package strings to i18n
 */
export function createCopyAdapter<T extends Record<string, unknown>>(
  copyStrings: T,
  translations?: Record<string, unknown>
): T {
  // If no translations provided, return original strings
  if (!translations) return copyStrings;

  // Deep merge translations over copy strings
  return deepMerge(copyStrings, translations) as T;
}

function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>
): T {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key as keyof T] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[keyof T];
    } else if (sourceValue !== undefined) {
      result[key as keyof T] = sourceValue as T[keyof T];
    }
  }

  return result;
}

// ============================================================================
// Next-intl Server Configuration
// ============================================================================

/**
 * Get messages for a locale
 * Used by next-intl's getRequestConfig
 */
export async function getMessages(locale: Locale) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.warn(`Failed to load messages for locale: ${locale}, falling back to default`);
    return (await import(`../../messages/${defaultLocale}.json`)).default;
  }
}

// Type exports are already exported above via the interface/type declarations

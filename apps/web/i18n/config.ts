/**
 * Internationalization Configuration
 *
 * Central configuration for all i18n settings including:
 * - Supported locales
 * - Default locale
 * - Locale metadata
 * - RTL language detection
 * - Date/time format preferences
 */

// ============================================================================
// Locale Definitions
// ============================================================================

/**
 * All supported locale codes
 * Add new locales here when adding language support
 */
export const locales = ['en', 'es', 'fr', 'de'] as const;

/**
 * Locale type derived from the locales array
 */
export type Locale = (typeof locales)[number];

/**
 * The default/fallback locale
 */
export const defaultLocale: Locale = 'en';

/**
 * RTL (right-to-left) locales
 * Used for automatic layout direction switching
 */
export const rtlLocales: readonly string[] = ['ar', 'he', 'fa', 'ur'] as const;

// ============================================================================
// Locale Metadata
// ============================================================================

export interface LocaleMetadata {
  /** ISO language code */
  code: Locale;
  /** English name of the language */
  name: string;
  /** Native name of the language */
  nativeName: string;
  /** Text direction */
  dir: 'ltr' | 'rtl';
  /** Preferred date format pattern */
  dateFormat: string;
  /** Time format preference */
  timeFormat: '12h' | '24h';
  /** Flag emoji for visual identification */
  flag: string;
  /** Whether translations are complete */
  isComplete: boolean;
  /** Translation completion percentage (0-100) */
  completionPercent: number;
}

/**
 * Metadata for each supported locale
 */
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
    completionPercent: 100,
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
    completionPercent: 0,
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
    completionPercent: 0,
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
    completionPercent: 0,
  },
};

// ============================================================================
// Future Locale Placeholders
// ============================================================================

/**
 * Languages planned for future support
 */
export const futureLocales = [
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Portugues',
    flag: '🇧🇷',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
  },
  {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    flag: '🇮🇱',
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
  },
] as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a locale code is valid and supported
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Check if a locale uses RTL text direction
 */
export function isRTLLocale(locale: string): boolean {
  return rtlLocales.includes(locale);
}

/**
 * Get the text direction for a locale
 */
export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return localeMetadata[locale]?.dir || 'ltr';
}

/**
 * Get metadata for a locale, with fallback to default
 */
export function getLocaleMetadata(locale: string): LocaleMetadata {
  if (isValidLocale(locale)) {
    return localeMetadata[locale];
  }
  return localeMetadata[defaultLocale];
}

/**
 * Get all complete locales
 */
export function getCompleteLocales(): Locale[] {
  return locales.filter((locale) => localeMetadata[locale].isComplete);
}

/**
 * Get all available locales (including incomplete ones)
 */
export function getAllLocales(): Locale[] {
  return [...locales];
}

// ============================================================================
// Cookie/Storage Configuration
// ============================================================================

/**
 * Key used for storing locale preference
 */
export const LOCALE_STORAGE_KEY = 'preferred-locale';

/**
 * Cookie name for server-side locale detection
 */
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Cookie max age in seconds (1 year)
 */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// ============================================================================
// Type Exports
// ============================================================================

export type { Locale };

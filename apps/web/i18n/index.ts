/**
 * i18n Module Exports
 *
 * This module re-exports all i18n configuration and utilities
 * for convenient importing throughout the application.
 */

// Configuration
export {
  locales,
  defaultLocale,
  rtlLocales,
  localeMetadata,
  futureLocales,
  isValidLocale,
  isRTLLocale,
  getLocaleDirection,
  getLocaleMetadata,
  getCompleteLocales,
  getAllLocales,
  LOCALE_STORAGE_KEY,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  type Locale,
  type LocaleMetadata,
} from './config';

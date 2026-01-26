/**
 * Custom i18n hooks that wrap next-intl functionality
 * with additional formatting utilities
 */

'use client';

import { useTranslations, useLocale, useNow, useTimeZone } from 'next-intl';
import { useCallback, useMemo } from 'react';

import {
  formatDate,
  formatTime,
  formatRelativeTime,
  formatNumber,
  formatPercent,
  formatCompactNumber,
  formatList,
  formatCurrency,
  pluralize,
  selectPlural,
  interpolate,
  isRTL,
  getTextDirection,
  localeMetadata,
  type Locale,
  type DateFormatOptions,
  type NumberFormatOptions,
  type PluralCategory,
} from '../lib/i18n';

// ============================================================================
// Main Translation Hook
// ============================================================================

/**
 * Enhanced useTranslation hook with additional formatting utilities
 */
export function useI18n(namespace?: string) {
  const t = useTranslations(namespace);
  const locale = useLocale() as Locale;
  const now = useNow();
  const timeZone = useTimeZone();

  // Date formatting
  const formatDateFn = useCallback(
    (date: Date | string | number, options?: DateFormatOptions) => {
      return formatDate(date, locale, options);
    },
    [locale]
  );

  // Time formatting
  const formatTimeFn = useCallback(
    (date: Date | string | number, use24Hour?: boolean) => {
      return formatTime(date, locale, use24Hour);
    },
    [locale]
  );

  // Relative time formatting
  const formatRelativeTimeFn = useCallback(
    (date: Date | string | number) => {
      return formatRelativeTime(date, locale);
    },
    [locale]
  );

  // Number formatting
  const formatNumberFn = useCallback(
    (value: number, options?: NumberFormatOptions) => {
      return formatNumber(value, locale, options);
    },
    [locale]
  );

  // Percent formatting
  const formatPercentFn = useCallback(
    (value: number, fractionDigits?: number) => {
      return formatPercent(value, locale, fractionDigits);
    },
    [locale]
  );

  // Compact number formatting
  const formatCompactFn = useCallback(
    (value: number) => {
      return formatCompactNumber(value, locale);
    },
    [locale]
  );

  // List formatting
  const formatListFn = useCallback(
    (items: string[], options?: { style?: 'long' | 'short' | 'narrow'; type?: 'conjunction' | 'disjunction' | 'unit' }) => {
      return formatList(items, locale, options);
    },
    [locale]
  );

  // Currency formatting
  const formatCurrencyFn = useCallback(
    (value: number, currency: string) => {
      return formatCurrency(value, currency, locale);
    },
    [locale]
  );

  // Pluralization
  const pluralizeFn = useCallback(
    (count: number, singular: string, plural: string) => {
      return pluralize(count, singular, plural, locale);
    },
    [locale]
  );

  // Select plural form
  const selectPluralFn = useCallback(
    <T>(count: number, forms: Partial<Record<PluralCategory, T>> & { other: T }) => {
      return selectPlural(count, forms, locale);
    },
    [locale]
  );

  // Check if RTL
  const isRtl = useMemo(() => isRTL(locale), [locale]);

  // Text direction
  const dir = useMemo(() => getTextDirection(locale), [locale]);

  // Locale metadata
  const metadata = useMemo(() => localeMetadata[locale], [locale]);

  return {
    // Translation function
    t,

    // Locale info
    locale,
    isRtl,
    dir,
    metadata,
    now,
    timeZone,

    // Formatting functions
    formatDate: formatDateFn,
    formatTime: formatTimeFn,
    formatRelativeTime: formatRelativeTimeFn,
    formatNumber: formatNumberFn,
    formatPercent: formatPercentFn,
    formatCompact: formatCompactFn,
    formatList: formatListFn,
    formatCurrency: formatCurrencyFn,

    // Pluralization
    pluralize: pluralizeFn,
    selectPlural: selectPluralFn,

    // Interpolation (for dynamic values)
    interpolate,
  };
}

// ============================================================================
// Specialized Hooks
// ============================================================================

/**
 * Hook for date/time formatting only
 */
export function useDateFormatter() {
  const locale = useLocale() as Locale;

  return useMemo(
    () => ({
      formatDate: (date: Date | string | number, options?: DateFormatOptions) =>
        formatDate(date, locale, options),
      formatTime: (date: Date | string | number, use24Hour?: boolean) =>
        formatTime(date, locale, use24Hour),
      formatRelativeTime: (date: Date | string | number) =>
        formatRelativeTime(date, locale),
    }),
    [locale]
  );
}

/**
 * Hook for number formatting only
 */
export function useNumberFormatter() {
  const locale = useLocale() as Locale;

  return useMemo(
    () => ({
      formatNumber: (value: number, options?: NumberFormatOptions) =>
        formatNumber(value, locale, options),
      formatPercent: (value: number, fractionDigits?: number) =>
        formatPercent(value, locale, fractionDigits),
      formatCompact: (value: number) => formatCompactNumber(value, locale),
      formatCurrency: (value: number, currency: string) =>
        formatCurrency(value, currency, locale),
    }),
    [locale]
  );
}

/**
 * Hook for RTL-aware styles
 */
export function useRTLStyles() {
  const locale = useLocale() as Locale;
  const isRtl = isRTL(locale);

  return useMemo(
    () => ({
      isRtl,
      dir: getTextDirection(locale),
      // Style helpers
      marginStart: isRtl ? 'marginRight' : 'marginLeft',
      marginEnd: isRtl ? 'marginLeft' : 'marginRight',
      paddingStart: isRtl ? 'paddingRight' : 'paddingLeft',
      paddingEnd: isRtl ? 'paddingLeft' : 'paddingRight',
      textAlign: isRtl ? 'right' : 'left',
      flexDirection: isRtl ? 'row-reverse' : 'row',
    }),
    [locale, isRtl]
  );
}

// ============================================================================
// Type Exports
// ============================================================================

export type {
  Locale,
  DateFormatOptions,
  NumberFormatOptions,
  PluralCategory,
};

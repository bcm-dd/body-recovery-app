import { getRequestConfig } from 'next-intl/server';
import { headers, cookies } from 'next/headers';
import { defaultLocale, locales, type Locale } from '../src/lib/i18n';

/**
 * Server-side locale configuration for next-intl
 *
 * Locale detection priority:
 * 1. Cookie (user's saved preference)
 * 2. Accept-Language header (browser preference)
 * 3. Default locale (fallback)
 */
export default getRequestConfig(async () => {
  let locale: Locale = defaultLocale;

  try {
    // 1. Try to get locale from cookie (user's saved preference)
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('preferred-locale');

    if (localeCookie?.value && locales.includes(localeCookie.value as Locale)) {
      locale = localeCookie.value as Locale;
    } else {
      // 2. Try to detect from Accept-Language header
      const headerStore = await headers();
      const acceptLanguage = headerStore.get('accept-language');

      if (acceptLanguage) {
        // Parse Accept-Language header (e.g., "en-US,en;q=0.9,es;q=0.8")
        const preferredLocales = acceptLanguage
          .split(',')
          .map((lang) => lang.split(';')[0].trim().split('-')[0])
          .filter((lang) => locales.includes(lang as Locale));

        if (preferredLocales.length > 0) {
          locale = preferredLocales[0] as Locale;
        }
      }
    }
  } catch (error) {
    // If cookie/header access fails (e.g., during static generation),
    // fall back to default locale
    console.warn('Locale detection failed, using default:', error);
  }

  // Load messages for the detected locale
  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    return {
      locale,
      messages,
      timeZone: 'UTC',
      now: new Date(),
    };
  } catch (error) {
    // If locale messages fail to load, fall back to default
    console.warn(`Failed to load messages for ${locale}, falling back to ${defaultLocale}`);
    const messages = (await import(`../messages/${defaultLocale}.json`)).default;
    return {
      locale: defaultLocale,
      messages,
      timeZone: 'UTC',
      now: new Date(),
    };
  }
});

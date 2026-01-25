'use client';

import { Globe, Check, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect, useCallback, useId } from 'react';

import { useI18n } from '../hooks';
import { localeMetadata, type Locale } from '../lib/i18n';
import { useLocaleContext } from '../../app/providers';

// ============================================================================
// Types
// ============================================================================

interface LocaleSwitcherProps {
  /** Display variant */
  variant?: 'dropdown' | 'inline' | 'compact';
  /** Show flag icons */
  showFlags?: boolean;
  /** Show native language names */
  showNativeNames?: boolean;
  /** Custom class name */
  className?: string;
  /** Callback when locale changes */
  onLocaleChange?: (locale: Locale) => void;
}

// ============================================================================
// LocaleSwitcher Component
// ============================================================================

export function LocaleSwitcher({
  variant = 'dropdown',
  showFlags = true,
  showNativeNames = true,
  className = '',
  onLocaleChange,
}: LocaleSwitcherProps) {
  const { locale, setLocale, availableLocales } = useLocaleContext();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const buttonId = useId();

  // Current locale metadata
  const currentMeta = localeMetadata[locale];

  // Handle locale selection
  const handleSelect = useCallback(
    (newLocale: Locale) => {
      setLocale(newLocale);
      setIsOpen(false);
      onLocaleChange?.(newLocale);
      buttonRef.current?.focus();
    },
    [setLocale, onLocaleChange]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          }
          break;
        case 'Enter':
        case ' ':
          if (!isOpen) {
            event.preventDefault();
            setIsOpen(true);
          }
          break;
      }
    },
    [isOpen]
  );

  // Render compact variant (just icon button)
  if (variant === 'compact') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          ref={buttonRef}
          id={buttonId}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className="flex h-10 w-10 items-center justify-center rounded-xl glass-button-ghost text-[var(--text-muted)] hover:text-foreground transition-all duration-300 touch-target ripple"
          aria-label={t('locale.switcher.ariaLabel')}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={menuId}
        >
          {showFlags && currentMeta.flag ? (
            <span className="text-lg" aria-hidden="true">
              {currentMeta.flag}
            </span>
          ) : (
            <Globe className="h-5 w-5" aria-hidden="true" />
          )}
        </button>

        {isOpen && (
          <LocaleDropdownMenu
            menuId={menuId}
            buttonId={buttonId}
            availableLocales={availableLocales as Locale[]}
            currentLocale={locale}
            showFlags={showFlags}
            showNativeNames={showNativeNames}
            onSelect={handleSelect}
            onClose={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  // Render inline variant (horizontal list)
  if (variant === 'inline') {
    return (
      <div
        className={`flex items-center gap-2 ${className}`}
        role="radiogroup"
        aria-label={t('locale.switcher.ariaLabel')}
      >
        {availableLocales.map((loc) => {
          const meta = localeMetadata[loc as Locale];
          const isSelected = loc === locale;

          return (
            <button
              key={loc}
              onClick={() => handleSelect(loc as Locale)}
              role="radio"
              aria-checked={isSelected}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                isSelected
                  ? 'glass-panel-subtle bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)]'
                  : 'text-[var(--text-muted)] hover:text-foreground hover:bg-[var(--glass-bg-subtle)]'
              }`}
            >
              {showFlags && meta.flag && (
                <span className="text-base" aria-hidden="true">
                  {meta.flag}
                </span>
              )}
              <span className="text-sm font-medium">
                {showNativeNames ? meta.nativeName : meta.name}
              </span>
              {isSelected && (
                <Check className="h-4 w-4 ml-1" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        id={buttonId}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-button-ghost text-foreground hover:bg-[var(--glass-bg)] transition-all duration-300 touch-target min-w-[140px]"
        aria-label={t('locale.switcher.ariaLabel')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={menuId}
      >
        {showFlags && currentMeta.flag && (
          <span className="text-lg" aria-hidden="true">
            {currentMeta.flag}
          </span>
        )}
        <span className="flex-1 text-left text-sm font-medium">
          {showNativeNames ? currentMeta.nativeName : currentMeta.name}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-[var(--text-muted)] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <LocaleDropdownMenu
          menuId={menuId}
          buttonId={buttonId}
          availableLocales={availableLocales as Locale[]}
          currentLocale={locale}
          showFlags={showFlags}
          showNativeNames={showNativeNames}
          onSelect={handleSelect}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// ============================================================================
// Dropdown Menu Component
// ============================================================================

interface LocaleDropdownMenuProps {
  menuId: string;
  buttonId: string;
  availableLocales: Locale[];
  currentLocale: Locale;
  showFlags: boolean;
  showNativeNames: boolean;
  onSelect: (locale: Locale) => void;
  onClose: () => void;
}

function LocaleDropdownMenu({
  menuId,
  buttonId,
  availableLocales,
  currentLocale,
  showFlags,
  showNativeNames,
  onSelect,
  onClose,
}: LocaleDropdownMenuProps) {
  const menuRef = useRef<HTMLUListElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(
    availableLocales.indexOf(currentLocale)
  );

  // Focus first item on mount
  useEffect(() => {
    const items = menuRef.current?.querySelectorAll('[role="option"]');
    if (items && items[focusedIndex]) {
      (items[focusedIndex] as HTMLElement).focus();
    }
  }, [focusedIndex]);

  // Handle keyboard navigation within menu
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex((prev) =>
            prev < availableLocales.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : availableLocales.length - 1
          );
          break;
        case 'Home':
          event.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          event.preventDefault();
          setFocusedIndex(availableLocales.length - 1);
          break;
        case 'Escape':
          onClose();
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          onSelect(availableLocales[focusedIndex]);
          break;
        case 'Tab':
          onClose();
          break;
      }
    },
    [availableLocales, focusedIndex, onClose, onSelect]
  );

  return (
    <ul
      ref={menuRef}
      id={menuId}
      role="listbox"
      aria-labelledby={buttonId}
      aria-activedescendant={`locale-option-${availableLocales[focusedIndex]}`}
      onKeyDown={handleKeyDown}
      className="absolute right-0 top-full mt-2 min-w-[180px] rounded-xl glass-card shadow-lg overflow-hidden z-50 py-1 animate-fadeIn"
    >
      {availableLocales.map((loc, index) => {
        const meta = localeMetadata[loc];
        const isSelected = loc === currentLocale;
        const isFocused = index === focusedIndex;

        return (
          <li key={loc}>
            <button
              id={`locale-option-${loc}`}
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(loc)}
              onMouseEnter={() => setFocusedIndex(index)}
              onFocus={() => setFocusedIndex(index)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ${
                isSelected
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                  : isFocused
                  ? 'bg-[var(--glass-bg)]'
                  : 'text-foreground'
              }`}
            >
              {showFlags && meta.flag && (
                <span className="text-lg flex-shrink-0" aria-hidden="true">
                  {meta.flag}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {showNativeNames ? meta.nativeName : meta.name}
                </div>
                {showNativeNames && (
                  <div className="text-xs text-[var(--text-muted)] truncate">
                    {meta.name}
                  </div>
                )}
              </div>
              {isSelected && (
                <Check
                  className="h-4 w-4 flex-shrink-0 text-[var(--primary)]"
                  aria-hidden="true"
                />
              )}
              {!meta.isComplete && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-medium"
                  aria-label="Coming soon"
                >
                  Soon
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ============================================================================
// Standalone Flag Component
// ============================================================================

interface LocaleFlagProps {
  locale: Locale;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LocaleFlag({ locale, size = 'md', className = '' }: LocaleFlagProps) {
  const meta = localeMetadata[locale];

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <span
      className={`${sizeClasses[size]} ${className}`}
      aria-label={meta.name}
      role="img"
    >
      {meta.flag}
    </span>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default LocaleSwitcher;

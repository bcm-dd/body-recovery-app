'use client';

import {
  LayoutDashboard,
  User,
  Activity,
  History,
  Settings,
  Moon,
  Sun,
  Smartphone,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback, useRef, useId } from 'react';

import { FocusTrap, VisuallyHidden, useAnnouncer } from './A11y';
import { useTheme } from '../../app/providers';
import { useI18n } from '../hooks';

interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/body', labelKey: 'bodyMap', icon: User },
  { href: '/progress', labelKey: 'progress', icon: Activity },
  { href: '/history', labelKey: 'history', icon: History },
  { href: '/settings', labelKey: 'settings', icon: Settings },
];

// Main navigation items for bottom nav (first 4)
const bottomNavItems = navItems.slice(0, 4);

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const mobileNavItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const { t } = useI18n();
  const { announcePolite } = useAnnouncer();
  const desktopNavId = useId();
  const mobileNavId = useId();
  const bottomNavId = useId();

  // Translation helper for nav items
  const getNavLabel = (key: string) => t(`nav.${key}`);

  // Keyboard navigation handler for nav list
  const handleNavKeyDown = useCallback(
    (event: React.KeyboardEvent, refs: React.MutableRefObject<(HTMLAnchorElement | null)[]>) => {
      const currentIndex = navItems.findIndex((item) => item.href === pathname);
      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= navItems.length) newIndex = 0;
          break;
        case 'ArrowUp':
          event.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0) newIndex = navItems.length - 1;
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = navItems.length - 1;
          break;
        case 'Enter':
        case ' ':
          // Let the link handle navigation naturally
          return;
        default:
          return;
      }

      // Focus the new item
      refs.current[newIndex]?.focus();
    },
    [pathname]
  );

  // Announce navigation changes
  const handleNavigation = useCallback(
    (label: string) => {
      announcePolite(`Navigating to ${label}`);
    },
    [announcePolite]
  );

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle escape key to close mobile menu
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
      menuButtonRef.current?.focus();
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus close button when menu opens
  useEffect(() => {
    if (isMobileMenuOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isMobileMenuOpen]);

  const openMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  return (
    <>
      {/* Desktop Sidebar - Premium Liquid Glass Effect */}
      <aside
        className="fixed left-0 top-0 z-40 h-screen w-64 glass-sidebar hidden md:block"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Aurora Background Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-br from-[var(--aurora-1)] to-transparent blur-3xl opacity-60 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-br from-[var(--aurora-2)] to-transparent blur-3xl opacity-40 animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 rounded-full bg-gradient-to-br from-[var(--aurora-4)] to-transparent blur-3xl opacity-30 animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
        </div>

        {/* Specular Highlight */}
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[var(--specular-white)] to-transparent opacity-60" aria-hidden="true" />

        <div className="flex h-full flex-col relative z-10">
          {/* Logo/Brand with Enhanced Glow */}
          <div className="flex h-16 items-center border-b border-[var(--glass-border)] px-6 relative">
            <div className="flex items-center gap-3">
              <div
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[#818cf8] glow-pulse group"
                aria-hidden="true"
              >
                <Activity className="h-5 w-5 text-white relative z-10 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[#818cf8] blur-xl opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
                {/* Inner specular highlight */}
                <div className="absolute top-0 left-[20%] right-[20%] h-px rounded-full bg-white/40" />
              </div>
              <div>
                <span className="text-lg font-bold text-foreground bg-clip-text">
                  {t('common.appName')}
                </span>
                <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <Sparkles className="h-3 w-3 text-[var(--primary)] animate-pulse" aria-hidden="true" />
                  <span className="bg-gradient-to-r from-[var(--primary)] to-cyan-500 bg-clip-text text-transparent font-medium">{t('common.premium')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation with Glass Effects */}
          <nav
            className="flex-1 space-y-1 p-4 stagger-in"
            aria-label={t('accessibility.mainNavigation') || 'Main navigation'}
            id={desktopNavId}
          >
            <ul role="list" className="space-y-1">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const label = getNavLabel(item.labelKey);

                return (
                  <li key={item.href} role="none">
                    <Link
                      ref={(el) => {
                        navItemRefs.current[index] = el;
                      }}
                      href={item.href}
                      className={`glass-nav-item flex items-center gap-3 px-4 py-3 text-sm font-medium ${
                        isActive
                          ? 'glass-nav-item-active text-white'
                          : 'text-[var(--text-muted)] hover:text-foreground'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                      aria-current={isActive ? 'page' : undefined}
                      aria-describedby={isActive ? `${desktopNavId}-current` : undefined}
                      tabIndex={isActive ? 0 : -1}
                      onKeyDown={(e) => handleNavKeyDown(e, navItemRefs)}
                      onClick={() => handleNavigation(label)}
                      role="menuitem"
                    >
                      <div className={`icon-glow relative ${isActive ? '' : ''}`}>
                        <Icon className="h-5 w-5 relative z-10" aria-hidden="true" />
                      </div>
                      <span className="relative z-10">{label}</span>
                      {isActive && (
                        <ChevronRight
                          className="ml-auto h-4 w-4 relative z-10"
                          aria-hidden="true"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <VisuallyHidden id={`${desktopNavId}-current`}>
              Current page
            </VisuallyHidden>
          </nav>

          {/* Bottom Section with Glass Cards */}
          <div className="border-t border-[var(--glass-border)] p-4 space-y-3">
            {/* Mobile App Link - Glass Button */}
            <a
              href="#"
              className="glass-button-ghost flex items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--text-muted)] hover:text-foreground ripple"
              aria-label={t('nav.getMobileApp')}
            >
              <Smartphone className="h-5 w-5" aria-hidden="true" />
              <span>{t('nav.getMobileApp')}</span>
            </a>

            {/* Theme Toggle - Liquid Button */}
            <button
              onClick={toggleTheme}
              className="glass-button-ghost flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--text-muted)] hover:text-foreground ripple"
              aria-label={t('accessibility.toggleTheme')}
              aria-pressed={theme === 'dark'}
            >
              <div className="relative">
                {theme === 'dark' ? (
                  <Sun
                    className="h-5 w-5 transition-transform duration-300 hover:rotate-180"
                    aria-hidden="true"
                  />
                ) : (
                  <Moon
                    className="h-5 w-5 transition-transform duration-300 hover:-rotate-12"
                    aria-hidden="true"
                  />
                )}
              </div>
              <span>{theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}</span>
            </button>

            {/* Disclaimer - Glass Card */}
            <div className="glass-panel-subtle rounded-xl p-4" role="note">
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {t('sidebar.disclaimer')}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header - Premium Liquid Glass Effect */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14 glass-header md:hidden safe-area-padding"
        role="banner"
      >
        {/* Specular highlight */}
        <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-[var(--specular-soft)] to-transparent opacity-50" aria-hidden="true" />

        <div className="flex h-full items-center justify-between px-4 relative z-10">
          {/* Logo with Enhanced Glow */}
          <div className="flex items-center gap-2">
            <div
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[#818cf8] group"
              aria-hidden="true"
            >
              <Activity className="h-5 w-5 text-white relative z-10 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[#818cf8] blur-lg opacity-50 transition-opacity duration-300 group-hover:opacity-70" />
              {/* Inner specular */}
              <div className="absolute top-0 left-[20%] right-[20%] h-px rounded-full bg-white/30" />
            </div>
            <span className="text-lg font-bold text-foreground">{t('common.appName')}</span>
          </div>

          {/* Menu & Theme buttons with Glass Effect */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="glass-button-ghost flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-foreground transition-all duration-300 touch-target ripple"
              aria-label={t('accessibility.toggleTheme')}
              aria-pressed={theme === 'dark'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <button
              ref={menuButtonRef}
              onClick={openMenu}
              className="glass-button-ghost flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-foreground transition-all duration-300 touch-target ripple"
              aria-label={t('accessibility.openMenu')}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Menu Overlay with Enhanced Blur */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden mobile-overlay"
          onClick={closeMenu}
          role="presentation"
          aria-hidden="true"
        >
          {/* Slide-out Menu Panel - Glass */}
          <FocusTrap active={isMobileMenuOpen}>
            <aside
              id="mobile-menu"
              className="absolute left-0 top-0 h-full w-72 max-w-[80vw] glass-sidebar shadow-2xl slide-in-left"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="flex h-full flex-col relative z-10">
                {/* Header with close button */}
                <div className="flex h-14 items-center justify-between border-b border-[var(--glass-border)] px-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[#818cf8]"
                      aria-hidden="true"
                    >
                      <Activity
                        className="h-5 w-5 text-white relative z-10"
                        aria-hidden="true"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[#818cf8] blur-md opacity-40" />
                    </div>
                    <span className="text-lg font-bold text-foreground">
                      {t('common.appName')}
                    </span>
                  </div>
                  <button
                    ref={closeButtonRef}
                    onClick={closeMenu}
                    className="glass-button-ghost flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-foreground touch-target ripple"
                    aria-label={t('accessibility.closeMenu')}
                  >
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Navigation - Glass Nav Items */}
                <nav
                  className="flex-1 space-y-1 p-4 overflow-y-auto stagger-in"
                  aria-label={t('accessibility.mainNavigation') || 'Main navigation'}
                  id={mobileNavId}
                >
                  <ul role="list" className="space-y-1">
                    {navItems.map((item, index) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      const label = getNavLabel(item.labelKey);

                      return (
                        <li key={item.href} role="none">
                          <Link
                            ref={(el) => {
                              mobileNavItemRefs.current[index] = el;
                            }}
                            href={item.href}
                            className={`glass-nav-item flex items-center gap-3 px-4 py-4 text-base font-medium touch-target ${
                              isActive
                                ? 'glass-nav-item-active text-white'
                                : 'text-[var(--text-muted)] hover:text-foreground'
                            }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                            aria-current={isActive ? 'page' : undefined}
                            aria-describedby={isActive ? `${mobileNavId}-current` : undefined}
                            tabIndex={isActive ? 0 : -1}
                            onKeyDown={(e) => handleNavKeyDown(e, mobileNavItemRefs)}
                            onClick={() => handleNavigation(label)}
                            role="menuitem"
                          >
                            <div className="icon-glow relative">
                              <Icon
                                className="h-5 w-5 relative z-10"
                                aria-hidden="true"
                              />
                            </div>
                            <span className="relative z-10">{label}</span>
                            {isActive && (
                              <ChevronRight
                                className="ml-auto h-4 w-4 relative z-10"
                                aria-hidden="true"
                              />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  <VisuallyHidden id={`${mobileNavId}-current`}>
                    Current page
                  </VisuallyHidden>
                </nav>

                {/* Bottom Section */}
                <div className="border-t border-[var(--glass-border)] p-4 safe-area-padding space-y-2">
                  {/* Mobile App Link */}
                  <a
                    href="#"
                    className="glass-button-ghost flex items-center gap-3 px-4 py-4 text-base font-medium text-[var(--text-muted)] hover:text-foreground touch-target ripple"
                    aria-label={t('nav.getMobileApp')}
                  >
                    <Smartphone className="h-5 w-5" aria-hidden="true" />
                    <span>{t('nav.getMobileApp')}</span>
                  </a>

                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="glass-button-ghost flex w-full items-center gap-3 px-4 py-4 text-base font-medium text-[var(--text-muted)] hover:text-foreground touch-target ripple"
                    aria-label={t('accessibility.toggleTheme')}
                    aria-pressed={theme === 'dark'}
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Moon className="h-5 w-5" aria-hidden="true" />
                    )}
                    <span>{theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}</span>
                  </button>

                  {/* Disclaimer - Glass Card */}
                  <div className="glass-panel-subtle rounded-xl p-4 mt-3" role="note">
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {t('sidebar.disclaimer')}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </FocusTrap>
        </div>
      )}

      {/* Mobile Bottom Navigation - Premium Liquid Glass Effect */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 glass-bottom-nav md:hidden safe-area-padding slide-up"
        role="navigation"
        aria-label={t('accessibility.quickNavigation') || 'Quick navigation'}
        id={bottomNavId}
      >
        {/* Top specular highlight */}
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[var(--specular-soft)] to-transparent opacity-40" aria-hidden="true" />

        {/* Subtle aurora glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-[var(--aurora-1)] to-transparent opacity-20 blur-2xl" />
        </div>

        <ul role="list" className="grid grid-cols-4 gap-1 px-2 py-2 relative z-10">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const label = getNavLabel(item.labelKey);

            return (
              <li key={item.href} role="none">
                <Link
                  href={item.href}
                  className={`glass-bottom-nav-item flex flex-col items-center justify-center rounded-xl py-2 px-1 touch-target relative overflow-hidden ${
                    isActive
                      ? 'glass-bottom-nav-item-active text-[var(--primary)]'
                      : 'text-[var(--text-muted)] hover:text-foreground'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`${label}${isActive ? ' (current page)' : ''}`}
                  onClick={() => handleNavigation(label)}
                  role="menuitem"
                >
                  {/* Active indicator glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/20 to-transparent rounded-xl" aria-hidden="true" />
                  )}
                  <div className={`relative ${isActive ? 'icon-glow' : ''}`}>
                    <Icon
                      className={`h-6 w-6 relative z-10 transition-all duration-300 ${
                        isActive ? 'scale-110 drop-shadow-lg' : ''
                      }`}
                      aria-hidden="true"
                    />
                    {/* Active dot indicator */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--primary)] shadow-lg shadow-[var(--glow-primary)]" aria-hidden="true" />
                    )}
                  </div>
                  <span
                    className={`mt-1 text-xs font-medium transition-all duration-300 relative z-10 ${
                      isActive ? 'text-[var(--primary)] font-semibold' : ''
                    }`}
                    aria-hidden="true"
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

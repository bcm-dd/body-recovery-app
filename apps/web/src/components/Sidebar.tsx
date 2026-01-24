'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { useTheme } from '../../app/providers';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/body', label: 'Body Map', icon: User },
  { href: '/progress', label: 'Progress', icon: Activity },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
];

// Main navigation items for bottom nav (first 4)
const bottomNavItems = navItems.slice(0, 4);

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <>
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-surface hidden md:block">
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div className="flex h-16 items-center border-b border-border px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-foreground">
                Recovery
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-muted hover:bg-card hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-border p-4">
            {/* Mobile App Link */}
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-card hover:text-foreground transition-colors"
            >
              <Smartphone className="h-5 w-5" />
              <span>Get Mobile App</span>
            </a>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-card hover:text-foreground transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* Disclaimer */}
            <div className="mt-4 rounded-lg bg-card p-3">
              <p className="text-xs text-muted leading-relaxed">
                This is guided self-care, not medical treatment. Consult a healthcare professional for medical advice.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header - visible on mobile only */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60 md:hidden safe-area-padding">
        <div className="flex h-full items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              Recovery
            </span>
          </div>

          {/* Menu & Theme buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-card hover:text-foreground transition-colors touch-target"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-card hover:text-foreground transition-colors touch-target"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {/* Slide-out Menu Panel */}
          <aside
            className="absolute left-0 top-0 h-full w-72 max-w-[80vw] bg-surface shadow-xl slide-in-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full flex-col">
              {/* Header with close button */}
              <div className="flex h-14 items-center justify-between border-b border-border px-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-foreground">
                    Recovery
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-card hover:text-foreground transition-colors touch-target"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3.5 text-base font-medium transition-colors touch-target ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-muted hover:bg-card hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                      {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom Section */}
              <div className="border-t border-border p-4 safe-area-padding">
                {/* Mobile App Link */}
                <a
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-4 py-3.5 text-base font-medium text-muted hover:bg-card hover:text-foreground transition-colors touch-target"
                >
                  <Smartphone className="h-5 w-5" />
                  <span>Get Mobile App</span>
                </a>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-base font-medium text-muted hover:bg-card hover:text-foreground transition-colors touch-target"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                {/* Disclaimer */}
                <div className="mt-4 rounded-lg bg-card p-3">
                  <p className="text-xs text-muted leading-relaxed">
                    This is guided self-care, not medical treatment. Consult a healthcare professional for medical advice.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60 md:hidden safe-area-padding slide-up">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-lg py-2 px-1 transition-colors touch-target ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : ''}`} />
                <span className={`mt-1 text-xs font-medium ${isActive ? 'text-primary' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

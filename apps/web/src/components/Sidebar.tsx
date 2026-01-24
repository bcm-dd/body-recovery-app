'use client';

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

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-surface">
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
  );
}

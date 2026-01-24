'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  'body': 'Body Map',
  'progress': 'Progress',
  'history': 'History',
  'settings': 'Settings',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Home className="h-4 w-4 text-muted" />
        <span className="text-foreground font-medium">Dashboard</span>
      </div>
    );
  }

  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link
        href="/"
        className="flex items-center text-muted hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;
        const label = routeLabels[segment] || segment;

        return (
          <div key={segment} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-muted" />
            {isLast ? (
              <span className="text-foreground font-medium">{label}</span>
            ) : (
              <Link
                href={href}
                className="text-muted hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

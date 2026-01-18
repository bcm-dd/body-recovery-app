'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Today', icon: '🏠' },
  { href: '/workout', label: 'Workout', icon: '💪' },
  { href: '/body', label: 'Body', icon: '🫀' },
  { href: '/chat', label: 'Coach', icon: '💬' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

const styles = {
  navBar: {
    position: 'fixed' as const,
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 430,
    height: 80,
    background: 'var(--bg-primary)',
    borderTop: '1px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    zIndex: 100,
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.5rem',
    textDecoration: 'none',
    color: 'var(--text-tertiary)',
    transition: 'color 0.2s',
    WebkitTapHighlightColor: 'transparent',
  },
  navItemActive: {
    color: 'var(--brand-primary)',
  },
  navIcon: {
    fontSize: '1.5rem',
  },
  navLabel: {
    fontSize: '0.625rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.02em',
  },
};

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav style={styles.navBar}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span style={styles.navLabel}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

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

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="nav-bar">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
      <style jsx>{`
        .nav-bar {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 430px;
          height: var(--nav-height);
          background: var(--bg-primary);
          border-top: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding-bottom: var(--safe-area-bottom);
          z-index: 100;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem;
          text-decoration: none;
          color: var(--text-tertiary);
          transition: color 0.2s;
          -webkit-tap-highlight-color: transparent;
        }

        .nav-item:hover {
          color: var(--text-secondary);
        }

        .nav-item-active {
          color: var(--brand-primary);
        }

        .nav-icon {
          font-size: 1.5rem;
        }

        .nav-label {
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
      `}</style>
    </nav>
  );
}

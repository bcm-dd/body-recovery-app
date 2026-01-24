import { Outlet, NavLink } from 'react-router'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

const navItems = [
  { path: '/', label: 'Today', icon: SunIcon },
  { path: '/body', label: 'Body', icon: BodyIcon },
  { path: '/chat', label: 'Coach', icon: ChatIcon },
  { path: '/progress', label: 'Progress', icon: ChartIcon },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
]

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-void">
      {/* Mobile container - centers content on larger screens */}
      <div className="flex flex-col flex-1 w-full max-w-[430px] mx-auto bg-base glow-accent">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto hide-scrollbar">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Bottom navigation */}
        <nav
          className="sticky bottom-0 bg-surface border-t border-border safe-bottom"
          aria-label="Main navigation"
        >
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'relative flex flex-col items-center justify-center w-16 h-full gap-1',
                    'transition-all duration-200 ease-out',
                    'rounded-xl',
                    // Active state - warm glow background
                    isActive
                      ? 'text-accent'
                      : 'text-text-tertiary hover:text-text-secondary hover:bg-elevated/50 active:bg-elevated'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator - warm glowing pill behind icon */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-1 rounded-xl bg-accent/10"
                        style={{
                          boxShadow: '0 0 20px rgba(196, 164, 132, 0.15)',
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    {/* Icon with filled state */}
                    <span className="relative z-10">
                      <item.icon filled={isActive} />
                    </span>
                    {/* Label */}
                    <span className={cn(
                      'relative z-10 text-caption2 transition-all duration-200',
                      isActive && 'font-medium'
                    )}>
                      {item.label}
                    </span>
                    {/* Active dot indicator below label */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute bottom-1 w-1 h-1 rounded-full bg-accent"
                        style={{
                          boxShadow: '0 0 6px rgba(196, 164, 132, 0.6)',
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}

// Tab icons using inline SVGs
// All icons have aria-hidden since the NavLink label provides accessible text
function SunIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" fill={filled ? 'currentColor' : 'none'} />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function BodyIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="3" fill={filled ? 'currentColor' : 'none'} />
      <path d="M12 10L12 16" />
      <path d="M12 16L8 22" />
      <path d="M12 16L16 22" />
      <path d="M8 12L12 10L16 12" />
    </svg>
  )
}

function ChatIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  )
}

function ChartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M3 3V21H21" />
      <path d="M7 14L11 10L15 14L21 8" />
      {filled && (
        <>
          <circle cx="7" cy="14" r="2" fill="currentColor" />
          <circle cx="11" cy="10" r="2" fill="currentColor" />
          <circle cx="15" cy="14" r="2" fill="currentColor" />
          <circle cx="21" cy="8" r="2" fill="currentColor" />
        </>
      )}
    </svg>
  )
}

function SettingsIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" fill={filled ? 'currentColor' : 'none'} />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

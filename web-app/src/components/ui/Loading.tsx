/**
 * Loading - Breathing animation loader
 *
 * A calm, organic loading experience matching Tend's aesthetic.
 * Can be used inline or as a full-page overlay.
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

type LoadingSize = 'sm' | 'md' | 'lg'
type LoadingVariant = 'inline' | 'fullPage'

interface LoadingProps {
  size?: LoadingSize
  variant?: LoadingVariant
  label?: string
  className?: string
}

const sizes: Record<LoadingSize, { container: string; ring: number; strokeWidth: number }> = {
  sm: { container: 'w-6 h-6', ring: 24, strokeWidth: 2 },
  md: { container: 'w-10 h-10', ring: 40, strokeWidth: 3 },
  lg: { container: 'w-16 h-16', ring: 64, strokeWidth: 4 },
}

export function Loading({
  size = 'md',
  variant = 'inline',
  label,
  className,
}: LoadingProps) {
  const { container, ring, strokeWidth } = sizes[size]
  const radius = (ring - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        variant === 'fullPage' && 'min-h-screen bg-void',
        className
      )}
      role="status"
      aria-label={label || 'Loading'}
      aria-live="polite"
      aria-busy="true"
    >
      <div className={cn('relative', container)}>
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(196, 164, 132, 0.2) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Background ring */}
        <svg
          width={ring}
          height={ring}
          viewBox={`0 0 ${ring} ${ring}`}
          className="absolute inset-0"
        >
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-border"
          />
        </svg>

        {/* Animated breathing ring */}
        <motion.svg
          width={ring}
          height={ring}
          viewBox={`0 0 ${ring} ${ring}`}
          className="absolute inset-0"
          style={{ transform: 'rotate(-90deg)' }}
        >
          <motion.circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="text-accent"
            strokeDasharray={circumference}
            animate={{
              strokeDashoffset: [circumference * 0.75, circumference * 0.25, circumference * 0.75],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.svg>

        {/* Center breathing dot */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [0.7, 1, 0.7],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div
            className="rounded-full bg-accent"
            style={{
              width: ring * 0.15,
              height: ring * 0.15,
              boxShadow: '0 0 12px rgba(196, 164, 132, 0.4)',
            }}
          />
        </motion.div>
      </div>

      {label && (
        <motion.span
          className={cn(
            'text-text-secondary',
            size === 'sm' ? 'text-caption1' : size === 'md' ? 'text-subhead' : 'text-body'
          )}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {label}
        </motion.span>
      )}

      {/* Screen reader text */}
      <span className="sr-only">Loading, please wait</span>
    </div>
  )

  if (variant === 'fullPage') {
    return content
  }

  return content
}

Loading.displayName = 'Loading'

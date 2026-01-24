import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/cn'

type CardVariant = 'default' | 'elevated' | 'glass'
type CardPadding = 'none' | 'sm' | 'md' | 'lg'

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: CardVariant
  padding?: CardPadding
  interactive?: boolean
}

const variants: Record<CardVariant, string> = {
  default: 'bg-surface border border-border',
  elevated: 'bg-elevated border border-border',
  glass: 'glass',
}

const paddings: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      interactive = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        whileTap={interactive ? { scale: 0.98 } : undefined}
        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        className={cn(
          'rounded-lg',
          variants[variant],
          paddings[padding],
          interactive && 'cursor-pointer card-hover',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'
